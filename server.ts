import express from 'express';
import path from 'path';
import fs from 'fs';
import net from 'net';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { buildSkillGuidance, listSkills } from './skillBooks';

/* 项目约定使用 .env.local 存放密钥（.env.example 同注释）；先加载默认 .env，再加载 .env.local 覆盖 */
dotenv.config();
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

/* 全局异常捕获：防止 Windows / 中文目录 / exec 类问题导致静默闪退（exit -1） */
process.on('uncaughtException', (err) => {
  console.error('[engine] uncaughtException:', err?.message || err);
  if (err?.stack) console.error(err.stack);
});
process.on('unhandledRejection', (err) => {
  console.error('[engine] unhandledRejection:', err);
});

/* 多轮对话历史消息（OpenAI 兼容：role + content） */
type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

const app = express();
const DEFAULT_PORT = 3000;
const HMR_PORT = 24678;

app.use(express.json());

/* 跨域：允许前端（GitHub Pages / 本地）访问。引擎不依赖 cookie，可放开来源；
   预检 OPTIONS 直接放行，SSE 流式接口同样生效 */
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});

/* ========== 一、端口管理：只检测占用 + 找空闲 + 写入 .engine-port.json
 *   （不再 taskkill/killPort —— Windows 下 execSync(taskkill) 与 Node v24 组合会闪退，
 *    若端口被占用直接提示用户手动关闭）========== */
function isWin() {
  return process.platform === 'win32';
}

function warnIfPortOccupied(port: number): void {
  if (!port || port <= 0) return;
  try {
    if (isWin()) {
      /* 用低权限 net createServer 探测更稳，不执行 exec */
      const probe = net.createServer();
      probe.unref();
      probe.once('error', (_e: any) => {
        if (_e?.code === 'EADDRINUSE') {
          console.warn(`[学医智用] 端口 ${port} 已被占用。如果启动失败，请先关闭该端口上的进程后再启动。`);
        }
      });
      probe.listen(port, '0.0.0.0', () => {
        try { probe.close(); } catch (_) {}
      });
      setTimeout(() => { try { probe.close(); } catch (_) {} }, 800);
    }
  } catch (_) {
    /* 探测失败不阻塞启动 */
  }
}

function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on('error', () => resolve(false));
    server.listen(port, '0.0.0.0', () => {
      server.close(() => resolve(true));
    });
    setTimeout(() => { try { server.close(); } catch (_) {} resolve(false); }, 1200);
  });
}

async function findFreePort(start: number, maxTry = 20): Promise<number> {
  for (let i = 0; i < maxTry; i++) {
    const p = start + i;
    if (await isPortFree(p)) return p;
  }
  return 0;
}

function writeEnginePort(port: number): void {
  try {
    const portFile = path.join(process.cwd(), '.engine-port.json');
    fs.writeFileSync(portFile, JSON.stringify({ port, at: new Date().toISOString() }), 'utf8');
  } catch (_) { /* 写失败忽略，vite 会 fallback 默认端口 */ }
}

/* ========== 二、DeepSeek-V3（OpenAI 兼容 fetch） ========== */
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';

async function callDeepSeek({ systemPrompt, userPrompt, jsonHint }: { systemPrompt: string; userPrompt: string; jsonHint?: string }): Promise<string | null> {
  if (!DEEPSEEK_API_KEY) return null;
  try {
    /* DeepSeek 要求 prompt 中出现 "json" 字样才允许 json_object 模式；
       jsonHint 未传时沿用增强问答的三键契约，传了则用调用方自定义结构。 */
    const jsonInstruction = jsonHint
      ? `\n\n请确保输出内容是一个合法的 JSON 对象：${jsonHint} 不要输出 JSON 以外的多余文字。`
      : `\n\n请确保输出内容是一个合法的 JSON 对象（包含 "analysis"、"answer"、"abComparison" 三个顶层键），不要输出 JSON 以外的多余文字。`;
    const resp = await fetch(`${DEEPSEEK_BASE_URL.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: 'system', content: systemPrompt + jsonInstruction },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });
    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      console.error(`[engine] DeepSeek API HTTP ${resp.status}: ${String(errText).slice(0, 400)}`);
      return null;
    }
    const data = await resp.json();
    const text: string =
      (data && typeof data === 'object' && (data as any).choices?.[0]?.message?.content) || '';
    return text || null;
  } catch (e: any) {
    console.error('[engine] DeepSeek API call error:', e?.message || e);
    return null;
  }
}

/* ========== 二·B、Kimi / Moonshot（OpenAI 兼容 fetch，用于推演「规划」界面） ========== */
const KIMI_BASE_URL = process.env.KIMI_BASE_URL || 'https://api.moonshot.cn/v1';
const KIMI_MODEL = process.env.KIMI_MODEL || 'kimi-k2.7-code';
const KIMI_API_KEY = process.env.KIMI_API_KEY || '';

/* 单次非流式 Kimi 请求 */
async function kimiOnce({ systemPrompt, userPrompt }: { systemPrompt: string; userPrompt: string }): Promise<{ ok: boolean; status: number; text: string | null }> {
  const resp = await fetch(`${KIMI_BASE_URL.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KIMI_API_KEY}`,
    },
    body: JSON.stringify({
      model: KIMI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      /* kimi-k2.7-code 仅允许 temperature=1，传其他值会被 API 拒绝 */
      temperature: 1,
    }),
  });
  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    console.error(`[engine] Kimi API HTTP ${resp.status}: ${String(errText).slice(0, 400)}`);
    return { ok: false, status: resp.status, text: null };
  }
  const data = await resp.json();
  const text: string =
    (data && typeof data === 'object' && (data as any).choices?.[0]?.message?.content) || '';
  return { ok: true, status: 200, text: text || null };
}

async function callKimi(args: { systemPrompt: string; userPrompt: string }): Promise<string | null> {
  if (!KIMI_API_KEY) return null;
  for (let attempt = 0; attempt <= 4; attempt++) {
    try {
      const r = await kimiOnce(args);
      if (r.ok) return r.text;
      const retryable = r.status === 429 || r.status === 529;
      if (retryable && attempt < 4) {
        await sleep(1200 * Math.pow(1.5, attempt) + Math.random() * 300);
        continue;
      }
      return null;
    } catch (e: any) {
      console.error('[engine] Kimi API call error:', e?.message || e);
      if (attempt < 4) { await sleep(1200 * (attempt + 1)); continue; }
      return null;
    }
  }
  return null;
}

/* 流式调 Kimi：逐 token 回调，返回完整文本 */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* 单次 Kimi 流式请求，返回结构化结果（便于外层按状态码重试） */
async function kimiStreamOnce(
  { systemPrompt, userPrompt, plain, history = [] }: { systemPrompt: string; userPrompt: string; plain?: boolean; history?: ChatMessage[] },
  onDelta: (chunk: string) => void
): Promise<{ ok: boolean; status: number; full: string | null }> {
  const resp = await fetch(`${KIMI_BASE_URL.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KIMI_API_KEY}`,
    },
    body: JSON.stringify({
      model: KIMI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userPrompt },
      ],
      ...(plain ? {} : { response_format: { type: 'json_object' } }),
      temperature: 1,
      stream: true,
    }),
  });
  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    console.error(`[engine] Kimi stream HTTP ${resp.status}: ${String(errText).slice(0, 300)}`);
    return { ok: false, status: resp.status, full: null };
  }
  const reader = resp.body?.getReader();
  if (!reader) return { ok: false, status: 200, full: null };
  const decoder = new TextDecoder('utf-8');
  let full = '';
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') continue;
      try {
        const j = JSON.parse(data);
        const delta = j?.choices?.[0]?.delta?.content || '';
        if (delta) { full += delta; onDelta(delta); }
      } catch (_) {}
    }
  }
  return { ok: true, status: 200, full: full || null };
}

async function callKimiStream(
  args: { systemPrompt: string; userPrompt: string; plain?: boolean; history?: ChatMessage[] },
  onDelta: (chunk: string) => void
): Promise<string | null> {
  if (!KIMI_API_KEY) return null;
  const MAX_RETRY = 4;
  /* Kimi 账户并发上限为 1，偶发 429；按错误提示退避后重试，不因此空白 */
  for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
    try {
      const r = await kimiStreamOnce(args, onDelta);
      if (r.ok) return r.full;
      const retryable = r.status === 429 || r.status === 529;
      if (retryable && attempt < MAX_RETRY) {
        await sleep(1200 * Math.pow(1.5, attempt) + Math.random() * 300);
        continue;
      }
      return null;
    } catch (e: any) {
      console.error('[engine] Kimi stream error:', e?.message || e);
      if (attempt < MAX_RETRY) { await sleep(1200 * (attempt + 1)); continue; }
      return null;
    }
  }
  return null;
}

/* ========== 三、Gemini 次选（保留，当 DeepSeek Key 不存在但 Gemini Key 存在时兜底） ========== */
type GoogleGenAIClient = any;
let geminiClient: GoogleGenAIClient | null = null;
async function getGeminiClient(): Promise<GoogleGenAIClient | null> {
  if (geminiClient) return geminiClient;
  if (!process.env.GEMINI_API_KEY) return null;
  try {
    const mod = await import('@google/genai');
    const ctor = (mod as any).GoogleGenAI;
    if (!ctor) return null;
    geminiClient = new ctor({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    }) as GoogleGenAIClient;
    return geminiClient;
  } catch (_) {
    return null;
  }
}

async function callGemini({ systemPrompt, userPrompt }: { systemPrompt: string; userPrompt: string }): Promise<string | null> {
  try {
    const ai = await getGeminiClient();
    if (!ai || !ai.models || typeof ai.models.generateContent !== 'function') return null;
    const r = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });
    return typeof r?.text === 'string' ? r.text : (typeof r?.text === 'function' ? r.text() : null);
  } catch (_) {
    return null;
  }
}

/* ========== 四、结构化 Prompt 契约 ========== */
const MODE_GUIDES: Record<string, string> = {
  '直接精准模式': '直击要点，核心定义与严谨病机解析',
  '引导式对话模式': '启发式提问与思路点拨，引导学生自主思考',
  '临床案例模式': '结合典型病案、患者主诉与四诊合参',
  '图像解说模式': '结构框图/思维导图、病机传变链路图解',
  '通俗类比模式': '生活化常识比喻，降低初学抽象认知负荷',
  '古籍溯源模式': '引经据典，如《黄帝内经》《伤寒论》《金匮要略》原文及释义',
  '医家各说模式': '历代名医（张仲景、李东垣、朱丹溪、叶天士等）学术观点辨析',
  '现代研究模式': '现代药理学、病理生理学、神经内分泌等现代科学机制解释',
  '关联方药模式': '对证方剂、经典药对配伍与跨学科方药关联',
};

function buildSystemPrompt(selectedOutputs: string[] = []): string {
  const picked = (selectedOutputs && selectedOutputs.length ? selectedOutputs : Object.keys(MODE_GUIDES))
    .filter((m) => MODE_GUIDES[m]);
  const modeLines = picked.map((m) => `   - ${m}：${MODE_GUIDES[m]}`).join('\n');
  return `你是"学医智用"平台的【中医学习问题理解与增强引擎】及【智能学伴】，把中医专业学生模糊、不完整的问题转化为结构化、高质量的提问，并以亲切的"学伴"身份解答。定位是"辅助自主学习的学伴"，不是居高临下的导师。
本次用户勾选的输出模式（严格据此定制 sections）：
${modeLines}
输出要求：
1. 必须输出严格 JSON，不要 Markdown 代码块或多余文字。
2. 顶层三个键：analysis（对象）、answer（对象）、abComparison（对象）。answer 含 companionGreeting、sections（数组，元素 {mode,title,content}）、relatedKnowledgeNodes（数组）。abComparison 含 unenhancedShortAnswer 和 comparisonMetrics（accuracyDiff/completenessDiff/understandabilityDiff/knowledgeExpansionDiff，形如 "+35%"）。
3. 凡病机传变链、流程图、分类树、思维导图、结构、时间节律等"图"，content 中必须用三反引号包裹的 mermaid 代码（流程图统一 "graph TD" 竖向，节点文字简洁中文、避免特殊字符），例如：
\`\`\`mermaid
graph TD
A[阴液亏虚] --> B[阴不制阳]
B --> C[虚热内生]
\`\`\`
严禁用 ┌ ─ └ │ ▼ → 等制表符拼"字符图"。表格用标准 Markdown 表格语法。`;
}

function buildUserPrompt(params: {
  question: string;
  selectedOutputs: string[];
  studentGrade: string;
  currentCourse: string;
  userPreference: string;
  studyStats?: {
    learningDays?: number;
    totalHours?: number;
    streakDays?: number;
    todayMinutes?: number;
    summary?: string;
  };
}): string {
  const schemaExample = JSON.stringify({
    analysis: {
      background: `中医学 / ${params.studentGrade} / ${params.currentCourse}`,
      topic: '紧扣题目的主题',
      intent: '机制理解 / 概念解释 / 对比辨析 / 方药关联',
      course: params.currentCourse,
      outputModes: params.selectedOutputs,
      structuredPrompt: ['针对题目的结构化追问1', '追问2', '追问3'],
    },
    answer: {
      companionGreeting: '亲切学伴引导语（1-2句）',
      sections: params.selectedOutputs.map((m) => ({ mode: m, title: '标题', content: '内容（图用mermaid，表用markdown）' })),
      relatedKnowledgeNodes: [
        { name: '知识点', course: '中基/方剂/中药', strength: 0.9, relationType: '治法方药', reason: '推荐理由' },
      ],
    },
    abComparison: {
      unenhancedShortAnswer: '直接面对模糊原问题时的泛泛短回答',
      comparisonMetrics: { accuracyDiff: '+35%', completenessDiff: '+48%', understandabilityDiff: '+42%', knowledgeExpansionDiff: '+60%' },
    },
  }, null, 2);

  const st = params.studyStats || {};
  const studyBits: string[] = [];
  if (st.learningDays) studyBits.push(`累计学习${st.learningDays}天`);
  if (st.totalHours) studyBits.push(`累计${st.totalHours}小时`);
  if (st.streakDays) studyBits.push(`连续打卡${st.streakDays}天`);
  if (st.todayMinutes) studyBits.push(`今日已学${st.todayMinutes}分钟`);
  const studyLine = studyBits.length ? `；学习记录：${studyBits.join('、')}` : "";

  return `用户原始问题："${params.question}"
学生背景：${params.studentGrade}中医学专业，当前主修/涉及课程：${params.currentCourse}，认知风格：${params.userPreference}${studyLine}。
用户指定的输出方式（请针对勾选的模式分别生成对应的sections小节）：
${params.selectedOutputs.join('、')}

【重要要求】
1. analysis.background 必须严格基于上面给出的真实学生背景与学习记录填写，不要编造年级/专业/时长；
2. analysis.topic、analysis.intent、analysis.structuredPrompt 必须紧扣用户原始问题本身分析强化，体现该题目的知识点、易混点、考点深度，不要套话；
3. 其余字段按 JSON 示例格式返回。

请严格按照以下 JSON 格式返回分析与回答（顶层三个键 analysis/answer/abComparison，不要有 markdown 代码块）：
${schemaExample}`;
}

/* ========== 五、健康检查 ========== */
app.get('/api/health', (req, res) => {
  const providers: string[] = [];
  const models: string[] = [];
  if (DEEPSEEK_API_KEY) { providers.push('DeepSeek'); models.push(DEEPSEEK_MODEL); }
  if (KIMI_API_KEY) { providers.push('Kimi'); models.push(KIMI_MODEL); }
  if (process.env.GEMINI_API_KEY) { providers.push('Gemini'); models.push('gemini-3.7-flash'); }
  res.json({
    status: 'ok',
    hasApiKey: Boolean(DEEPSEEK_API_KEY || KIMI_API_KEY || process.env.GEMINI_API_KEY),
    providers,
    models,
    provider: providers[0] || 'none',
    model: models[0] || 'mock',
    engine: '中医学习问题理解与增强引擎 (TCM Question Understanding & Prompt Enhancement Engine)',
  });
});

/* 阶段三：列出可用的专科专家（技能书） */
app.get('/api/skills', (_req, res) => {
  res.json({ skills: listSkills() });
});

/* ========== 六、核心接口：增强 + 回答 ========== */
app.post('/api/enhance-and-answer', async (req, res) => {
  try {
    const {
      question,
      selectedOutputs = ['直接精准模式', '通俗类比模式', '临床案例模式', '关联方药模式'],
      studentGrade = '大一',
      currentCourse = '中医诊断学',
      userPreference = '机制推演型',
      studyStats,
      provider = '', /* 'kimi' | 'deepseek' | ''（自动） */
    } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    const systemPrompt = buildSystemPrompt(selectedOutputs);
    const userPrompt = buildUserPrompt({ question, selectedOutputs, studentGrade, currentCourse, userPreference, studyStats });

    /* 优先级：请求指定 provider -> DeepSeek -> Kimi -> Gemini -> 本地 Mock
       规划界面请求带 provider='kimi'；答疑带 provider='deepseek' 或留空自动。 */
    let rawText: string | null = null;
    if (provider === 'kimi') {
      rawText = await callKimi({ systemPrompt, userPrompt });
    } else if (provider === 'deepseek') {
      rawText = await callDeepSeek({ systemPrompt, userPrompt });
    } else {
      if (DEEPSEEK_API_KEY) rawText = await callDeepSeek({ systemPrompt, userPrompt });
      if (!rawText && KIMI_API_KEY) rawText = await callKimi({ systemPrompt, userPrompt });
      if (!rawText && process.env.GEMINI_API_KEY) rawText = await callGemini({ systemPrompt, userPrompt });
    }

    if (rawText) {
      try {
        const cleaned = rawText.replace(/```(?:json)?\s*([\s\S]*?)```/gi, (_m, g1) => g1 || '').trim();
        const parsed = JSON.parse(cleaned);
        return res.json(parsed);
      } catch (_) {
        /* JSON 解析失败 → 兜底 mock */
      }
    }

    const fallback = generateLocalStructuredResponse(
      question,
      Array.isArray(selectedOutputs) ? selectedOutputs : ['直接精准模式', '通俗类比模式', '临床案例模式', '关联方药模式'],
      studentGrade,
      currentCourse,
      userPreference
    );
    res.json(fallback);
  } catch (error: any) {
    console.error('[engine] enhance-and-answer error:', error);
    const fallback = generateLocalStructuredResponse(
      req.body?.question || '为什么阴虚会五心潮热？',
      req.body?.selectedOutputs || ['直接精准模式', '通俗类比模式', '临床案例模式', '关联方药模式'],
      req.body?.studentGrade || '大一',
      req.body?.currentCourse || '中医诊断学',
      req.body?.userPreference || '机制推演型'
    );
    res.json(fallback);
  }
});

/* 流式调 DeepSeek：onDelta 逐字回调，返回完整文本 */
async function callDeepSeekStream({ systemPrompt, userPrompt, jsonHint, plain, history = [] }: { systemPrompt: string; userPrompt: string; jsonHint?: string; plain?: boolean; history?: ChatMessage[] }, onDelta: (chunk: string) => void): Promise<string | null> {
  if (!DEEPSEEK_API_KEY) return null;
  try {
    const jsonInstruction = jsonHint
      ? `\n\n请确保输出内容是一个合法的 JSON 对象：${jsonHint} 不要输出 JSON 以外的多余文字。`
      : `\n\n请确保输出内容是一个合法的 JSON 对象（包含 "analysis"、"answer"、"abComparison" 三个顶层键），不要输出 JSON 以外的多余文字。`;
    const resp = await fetch(`${DEEPSEEK_BASE_URL.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: 'system', content: plain ? systemPrompt : systemPrompt + jsonInstruction },
          ...history,
          { role: 'user', content: userPrompt },
        ],
        ...(plain ? {} : { response_format: { type: 'json_object' } }),
        temperature: 0.7,
        stream: true,
      }),
    });
    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      console.error(`[engine] DeepSeek stream HTTP ${resp.status}: ${String(errText).slice(0, 300)}`);
      return null;
    }
    const reader = resp.body?.getReader();
    if (!reader) return null;
    const decoder = new TextDecoder('utf-8');
    let full = '';
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const data = trimmed.slice(5).trim();
        if (data === '[DONE]') continue;
        try {
          const j = JSON.parse(data);
          const delta = j?.choices?.[0]?.delta?.content || '';
          if (delta) {
            full += delta;
            onDelta(delta);
          }
        } catch (_) {}
      }
    }
    return full || null;
  } catch (e: any) {
    console.error('[engine] DeepSeek stream error:', e?.message || e);
    return null;
  }
}

/* DeepSeek 思考模式（deepseek-reasoner / R1）：流式返回两段——
   reasoning_content 是模型的内部思考过程（思维链），content 是最终答案。
   前端把思考过程逐字显示在"正在思考"折叠区（参考 DeepSeek），再显示正文。
   R1 不支持 temperature / response_format，故不传这些参数。 */
async function callDeepSeekReasonerStream(
  { systemPrompt, userPrompt, history = [] }: { systemPrompt: string; userPrompt: string; history?: ChatMessage[] },
  onReasoning: (chunk: string) => void,
  onDelta: (chunk: string) => void
): Promise<string | null> {
  if (!DEEPSEEK_API_KEY) return null;
  try {
    const resp = await fetch(`${DEEPSEEK_BASE_URL.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-reasoner',
        messages: [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: userPrompt },
        ],
        stream: true,
      }),
    });
    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      console.error(`[engine] Reasoner stream HTTP ${resp.status}: ${String(errText).slice(0, 300)}`);
      return null;
    }
    const reader = resp.body?.getReader();
    if (!reader) return null;
    const decoder = new TextDecoder('utf-8');
    let full = '';
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const data = trimmed.slice(5).trim();
        if (data === '[DONE]') continue;
        try {
          const j = JSON.parse(data);
          const d = j?.choices?.[0]?.delta;
          const r = d?.reasoning_content || '';
          const c = d?.content || '';
          if (r) onReasoning(r);
          if (c) { full += c; onDelta(c); }
        } catch (_) {}
      }
    }
    return full || null;
  } catch (e: any) {
    console.error('[engine] Reasoner stream error:', e?.message || e);
    return null;
  }
}

/* 流式增强回答：SSE 逐字推送 answer 内容，最后推 analysis 等结构 */
app.post('/api/enhance-stream', async (req, res) => {
  try {
    const {
      question,
      selectedOutputs = ['直接精准模式', '通俗类比模式', '临床案例模式', '关联方药模式'],
      studentGrade = '大一',
      currentCourse = '中医诊断学',
      userPreference = '机制推演型',
      userNotes = [],
      studyStats,
      history = [],
      provider = '',
    } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }
    /* 清洗多轮历史：只保留 user/assistant、内容为非空字符串，限制条数与长度，
       防止超长上下文拖慢、也避免脏数据进入模型 */
    const cleanHistory: ChatMessage[] = (Array.isArray(history) ? history : [])
      .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .slice(-12)
      .map((m: any) => ({ role: m.role, content: m.content.slice(0, 4000) }));
    /* 纯 Markdown 学伴回答：不套 JSON，逐字流式直接可读 */
    const modes = (Array.isArray(selectedOutputs) ? selectedOutputs : []).filter(Boolean);
    const sys = `你是"学医智用"平台里亲切的中医学习学伴，像同学一样循循善诱地解答，不要居高临下。
根据用户问题直接输出 Markdown 正文：
- 先用一两句亲切开场白，再围绕问题展开讲解。
- ${modes.length ? `请按这些视角分别组织小节：${modes.join('、')}，每节用 ### 小标题。` : '条理清晰，适当用小标题。'}
- 讲病机传变、流程、分类、关系时，用三反引号包裹的 mermaid 代码块（统一 graph TD 竖向，节点用简洁中文、避免特殊符号）；对比类内容用标准 Markdown 表格。
- 严禁用 ┌ ─ └ │ ▼ → 等制表符拼字符图。内容紧扣题目、准确易懂。不要输出 JSON，不要输出任何额外说明。

【重要：如何对待用户的纠正与反馈】
- 结合上方对话历史理解当前问题。若用户说"不对 / 错了 / 不是这样 / 你理解错了 / 应该是…"，这是在纠正你，绝不能固执己见、也不要重复或辩解上一轮的说法。
- 此时应：①大方承认理解有偏差（不绕弯、不嘴硬）；②用一句话复述用户真正的意思，确认你这次抓对了；③据此重新给出修订后的正确内容。
- 若用户只是在追问或补充，就顺着新信息继续，不必刻意认错。拿不准时，先澄清再回答，而不是坚持原判断。`;

    /* 阶段三：按问题路由到专科专家智能体，把其"专家方法论 + 易错点"注入系统提示，
       最终作答（R1 / DeepSeek / Kimi）统一使用 fullSys */
    const skill = buildSkillGuidance(question);
    const fullSys = `${sys}\n\n${skill.guidance}`;
    const st = studyStats || {};
    /* 用户跨会话记住的纠正/强调，提醒模型长期尊重 */
    const notesLine = Array.isArray(userNotes) && userNotes.length
      ? `\n该同学此前明确强调或纠正过以下要点（请长期尊重，避免再犯）：\n- ${userNotes.slice(0, 5).map((n: any) => String(n)).join('\n- ')}`
      : '';
    let userMsg = `问题：${question}${st.learningDays ? `\n（该同学累计学习${st.learningDays}天、累计${st.totalHours || '若干'}小时）` : ''}${notesLine}`;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    const send = (event: string, data: any) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    /* 是否启用 DeepSeek 思考模式（R1）：仅 DeepSeek 侧的复杂问题。
       Kimi(plan) 没有 reasoner；简单问题走快速直答，避免小问题也长思考。 */
    const useReasoner = provider !== 'kimi' && isComplexQuestion(question);

    /* 立即告知前端：本次由哪位专科专家解答（阶段三），不依赖 analysis 成功 */
    send('skill', { skillId: skill.skillId, skillName: skill.skillName });

    /* 问题理解卡片：所有问题都生成，完成后立即发送 analysis（约 3.5s）。 */
    let review: any = null;
    let analysisObj: any = null;
    try {
      analysisObj = await buildAnalysis(question, modes, provider);
      if (analysisObj) send('analysis', analysisObj);
    } catch {
      /* 分析异常不影响正文流 */
    }
    /* 非 R1 路径（Kimi plan，或简单问题）保留独立自我审校；
       R1 路径不再单独 buildReview——思考过程与自检由 reasoner 内部完成，
       并通过 reasoning 事件直接可见（参考 DeepSeek）。 */
    if (!useReasoner && analysisObj && isComplexQuestion(question)) {
      try {
        review = await buildReview(question, modes, analysisObj, cleanHistory, provider);
        if (review) {
          analysisObj.review = review;
          send('review', review);   /* 前端把自我审校补填到分析卡片 */
        }
      } catch {
        /* 审校失败退回直接作答 */
      }
    }

    /* 把核对无误的要点作为"硬约束"追加给最终作答：正文必须与之保持一致（仅非 R1 路径）。 */
    if (review && Array.isArray(review.verifiedPoints) && review.verifiedPoints.length) {
      userMsg += `\n\n【以下要点已经过严格审校、核对无误，请严格遵循，正文不得与之矛盾或遗漏】\n${review.verifiedPoints.map((p: any) => `- ${p}`).join('\n')}${review.caution ? `\n口径提醒：${review.caution}` : ''}`;
    }
    userMsg += `\n请直接开始解答。`;

    /* 正文生成：
       - R1 路径：先流式"思考过程"(reasoning) 显示在折叠区，再流式"正文"(delta)；
       - Kimi / 普通 DeepSeek：直接流式正文。 */
    const onDelta = (delta: string) => send('delta', { text: delta });
    const onReasoning = (r: string) => send('reasoning', { text: r });
    let bodyText: string | null = null;
    if (useReasoner) {
      bodyText = await callDeepSeekReasonerStream({ systemPrompt: fullSys, userPrompt: userMsg, history: cleanHistory }, onReasoning, onDelta);
    } else if (provider === 'kimi') {
      bodyText = await callKimiStream({ systemPrompt: fullSys, userPrompt: userMsg, plain: true, history: cleanHistory }, onDelta);
    } else {
      bodyText = await callDeepSeekStream({ systemPrompt: fullSys, userPrompt: userMsg, plain: true, history: cleanHistory }, onDelta);
    }

    /* 正文生成失败（上游限流/网络/异常）：明确告知前端 error，而不是静默结束，
       否则前端会保存一条"内容为空"的回答。 */
    if (!bodyText) {
      send('error', { msg: 'AI 正文生成失败（上游服务异常或限流），请点「重新生成」再试' });
      res.end();
      return;
    }

    send('done', { done: true });
    res.end();
  } catch (error: any) {
    console.error('[engine] enhance-stream error:', error?.message || error);
    try {
      /* 头已写出说明处于 SSE 阶段：补一个 error 事件，避免前端收到空响应 */
      if (res.headersSent && !res.writableEnded) {
        res.write(`event: error\n`);
        res.write(`data: ${JSON.stringify({ msg: '生成中断，请重新生成' })}\n\n`);
      }
      res.end();
    } catch (_) {}
  }
});

/* 快速问题理解：返回小 JSON，供前端"问题理解与增强分析"卡片 */
/* 问题理解：独立调用一次 LLM 生成结构化 JSON，供 /api/analyze 与 /api/enhance-stream 复用。
   返回 null 表示模型不可用；JSON 解析失败时返回兜底对象。 */
async function buildAnalysis(question: string, modes: string[], provider = ''): Promise<any | null> {
  const sys = `你是中医学习问题理解引擎。把学生的问题转成结构化理解，只输出一个 JSON 对象，不要多余文字。`;
  const jsonHint = `包含 background(string，形如"中医学 / 大一 / 中医诊断学")、topic(string，紧扣题目的主题)、intent(string，如 机制理解/概念解释/对比辨析)、outputModes(字符串数组)、structuredPrompt(字符串数组，3 条结构化追问)、draftReasoning(字符串数组，4-6 条你对该问题的初步推理要点，供后续审校)`;
  const userMsg = `问题：${question}\n可选输出模式：${modes.join('、') || '直接精准模式'}`;
  const text = provider === 'kimi'
    ? await callKimi({ systemPrompt: sys, userPrompt: userMsg })
    : await callDeepSeek({ systemPrompt: sys, userPrompt: userMsg, jsonHint });
  if (!text) return null;
  try {
    const cleaned = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { background: '中医学', topic: question, intent: '理解', outputModes: modes, structuredPrompt: ['结合该同学的学习背景', '联系已学的相关概念', '联系临床或考试应用'] };
  }
}

/* 判定问题复杂度：鉴别/对比/病机/辨证等需要深度推理的走"草稿→审校"，
   单一事实（组成/出处/性味）直接答，控制延迟与成本。 */
function isComplexQuestion(q: string): boolean {
  const COMPLEX = /区别|鉴别|对比|比较|为什么|病机|治则|治法|辨证|病案|分析|如何理解|关系|传变|加减|配伍|主次|先后|异同|联系|机制|原理|证候|方义|如何|怎么办|怎么理解|鉴别诊断/;
  const SIMPLE = /是什么|哪一味|组成|出处|出自|定义|功效|性味|归经|剂量|用量|作者|年代|成书|别名|又叫/;
  if (COMPLEX.test(q)) return true;
  if (SIMPLE.test(q)) return false;
  return q.length >= 20;
}

/* 第二轮：严格审校者拿到初步推理，逐条挑错、核对，给出最终必须坚持的要点。 */
async function buildReview(question: string, modes: string[], analysis: any, history: ChatMessage[], provider = ''): Promise<any | null> {
  const sys = `你是极其严格的中医学术审校（教学督导），熟读《中医基础理论》《中医诊断学》《方剂学》《中药学》及经典原文。下面是一道学生问题和另一位 AI 给出的"初步推理要点"。请以挑错、纠错的态度逐条审查：对照权威教材与经典，找出事实错误、概念混淆（如方名、病位、寒热虚实、君臣佐使、出处）、逻辑跳跃、遗漏或过度断言；再给出核对无误、最终必须严格坚持的要点。只输出一个 JSON 对象，不要多余文字。`;
  const jsonHint = `包含 issues(字符串数组，发现的具体问题及更正，没有则空数组)、verifiedPoints(字符串数组，4-8 条核对后必须讲对的要点)、caution(字符串，输出时需特别注意的口径，没有则空字符串)`;
  const draft: string[] = Array.isArray(analysis?.draftReasoning) ? analysis.draftReasoning : [];
  const historyLine = history.length
    ? `\n对话历史（供理解上下文，注意学生是否在纠正）：\n${history.map((m) => `${m.role === 'user' ? '学生' : 'AI'}：${m.content}`).join('\n').slice(0, 3000)}`
    : '';
  const userMsg = `学生问题：${question}\n输出模式：${modes.join('、') || '直接精准模式'}\nAI 初步推理要点：\n${draft.map((p, i) => `${i + 1}. ${p}`).join('\n')}${historyLine}\n\n请逐条挑错核对，并给出最终要点。`;
  const text = provider === 'kimi'
    ? await callKimi({ systemPrompt: sys, userPrompt: userMsg })
    : await callDeepSeek({ systemPrompt: sys, userPrompt: userMsg, jsonHint });
  if (!text) return null;
  try {
    const cleaned = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

app.post('/api/analyze', async (req, res) => {
  try {
    const { question, selectedOutputs = [], studyStats, provider = '' } = req.body || {};
    if (!question || typeof question !== 'string') return res.status(400).json({ error: 'Question is required' });
    const modes = (Array.isArray(selectedOutputs) ? selectedOutputs : []).filter(Boolean);
    const parsed = await buildAnalysis(question, modes, provider);
    if (!parsed) return res.status(502).json({ error: 'AI unavailable' });
    return res.json(parsed);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'analyze failed' });
  }
});

/* ========== 六·B、智能学习建议 / 报告文案（DeepSeek，供首页智能建议、日报/周报/月报总结等推演界面外模块使用） ========== */
app.post('/api/smart-advice', async (req, res) => {
  try {
    const { mode = 'study', status = {}, data = {} } = req.body || {};
    let systemPrompt = '';
    let userPrompt = '';
    let jsonHint = '';

    if (mode === 'daily' || mode === 'weekly' || mode === 'monthly') {
      systemPrompt = '你是一名中医学习陪伴助手，擅长根据学习统计数据撰写自然、贴心、有指导性的学习总结文案，语气亲切但不空泛。';
      userPrompt = `请根据以下学习统计数据，撰写一段不超过 120 字的中医学习${mode === 'daily' ? '日报' : mode === 'weekly' ? '周报' : '月报'}总结，需包含 1 条具体可行的改进建议：\n${JSON.stringify(data, null, 2)}`;
      jsonHint = '顶层只有一个键 "summary"（字符串）';
    } else {
      const statusLine = Object.keys(status || {}).length ? `\n当前学习状态：${JSON.stringify(status)}` : '';
      systemPrompt = '你是一名中医学习陪伴助手，擅长根据学生学习情况给出个性化、具体、可执行的学习建议。建议要结合中医学科特点（方剂学、内经、中医诊断学、中药学、针灸学等），语气亲切自然，拒绝空泛鼓励。';
      userPrompt = `请为一名中医学专业学生生成 3 条${mode === 'exam' ? '备考冲刺' : '日常学习'}建议，内容各不相同。每条建议字段：type（knowledge 知识点 / plan 计划 / achievement 激励，三选一）、title（4-8 字标题）、content（40-80 字具体建议）、priority（high / medium / low）。${statusLine}`;
      jsonHint = '顶层只有一个键 "advice"，值为数组，每个元素包含 type、title、content、priority 四个字段';
    }

    const rawText = await callDeepSeek({ systemPrompt, userPrompt, jsonHint });
    if (rawText) {
      try {
        const cleaned = rawText.replace(/```(?:json)?\s*([\s\S]*?)```/gi, (_m, g1) => g1 || '').trim();
        const parsed = JSON.parse(cleaned);
        if (mode === 'daily' || mode === 'weekly' || mode === 'monthly') {
          if (parsed && typeof parsed.summary === 'string' && parsed.summary.trim()) {
            return res.json({ summary: parsed.summary.trim() });
          }
        } else if (Array.isArray(parsed?.advice) && parsed.advice.length) {
          const now = Date.now();
          return res.json({
            advice: parsed.advice.slice(0, 3).map((a: any, i: number) => ({
              id: `ai-${now}-${i}`,
              type: a?.type || 'knowledge',
              title: String(a?.title || '学习建议').slice(0, 12),
              content: String(a?.content || ''),
              priority: a?.priority || 'medium',
            })),
          });
        }
      } catch (e: any) {
        console.error('[engine] smart-advice parse error:', e?.message || e);
      }
    }
    return res.status(502).json({ error: 'AI unavailable' });
  } catch (error: any) {
    console.error('[engine] smart-advice error:', error?.message || error);
    return res.status(500).json({ error: 'internal error' });
  }
});

/* ========== 推荐问题：根据用户历史提问个性化生成高频痛点快捷问题 ========== */
app.post('/api/recommend-questions', async (req, res) => {
  try {
    const { historyQuestions = [], studentGrade = '' } = req.body || {};
    const history = Array.isArray(historyQuestions) ? historyQuestions.slice(0, 12) : [];
    const systemPrompt = '你是一名中医学习推荐助手，擅长根据学生最近问过的问题，推荐 4 个与其学习进度相关、有深度的高频痛点问题。问题要覆盖不同科目（中基/中诊/方剂/中药/伤寒/温病等），既有巩固已学，也有对比辨析和延伸。';
    const historyText = history.length
      ? `学生最近问过的问题：\n${history.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}`
      : '学生还没有提问记录，按中医大一常见高频痛点推荐。';
    const gradeText = studentGrade ? `\n学生年级：${studentGrade}` : '';
    const userPrompt = `${historyText}${gradeText}\n\n请生成 4 个推荐问题，每个字段：title（4-10 字标题）、question（完整问题，20-50 字）、tag（科目标签，如"中基/中诊 · 经典痛点"）。问题要与学生最近的学习主题相关但不重复，有递进和对比价值。`;
    const jsonHint = '顶层只有一个键 "questions"，值为数组，恰好 4 个元素，每个元素包含 title、question、tag 三个字段';

    const rawText = await callDeepSeek({ systemPrompt, userPrompt, jsonHint });
    if (rawText) {
      try {
        const cleaned = rawText.replace(/```(?:json)?\s*([\s\S]*?)```/gi, (_m, g1) => g1 || '').trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed?.questions) && parsed.questions.length) {
          return res.json({
            questions: parsed.questions.slice(0, 4).map((q: any, i: number) => ({
              id: `rec-${Date.now()}-${i}`,
              title: String(q?.title || '').slice(0, 12),
              question: String(q?.question || ''),
              tag: String(q?.tag || '推荐问题'),
            })),
          });
        }
      } catch (e: any) {
        console.error('[engine] recommend-questions parse error:', e?.message || e);
      }
    }
    return res.status(502).json({ error: 'AI unavailable' });
  } catch (error: any) {
    console.error('[engine] recommend-questions error:', error?.message || error);
    return res.status(500).json({ error: 'internal error' });
  }
});

/* ========== 七、本地 Mock：9 模式全量模板（兜底与演示） ========== */
function generateLocalStructuredResponse(
  question: string,
  selectedOutputs: string[],
  studentGrade: string,
  currentCourse: string,
  userPreference: string = '机制推演型'
) {
  const q = String(question || '');
  const isYinxu = /阴虚|五心潮热|潮热|盗汗|知柏|六味|舌红少苔|细数脉/.test(q);
  const isYangxu = /阳虚|低热|补中益气|甘温除热|阴火|浮阳|戴阳|气虚发热/.test(q);
  const isFangji = /汤|方|厚朴|半夏|桂枝|麻黄|柴胡|白虎|承气|六味|补中|归脾|当归补血/.test(q);
  const isExam = /考试|考点|重点|易错|鉴别|对比|区别| vs |\/|和.*区别/.test(q);

  const allPossibleSections: Record<string, { title: string; content: string }> = {
    直接精准模式: {
      title: '核心病机与本质定义',
      content: isYinxu
        ? '阴液亏耗，水不制火，虚热内生。五心（手心、足心、胸中）为心肾阴经气血汇聚之处，阴亏则虚火循经上浮内扰；午后至入夜阳气入阴，阴虚不能敛阳，故发热如潮水定时而发。'
        : isYangxu
        ? '阳气虚衰致虚阳外浮（气虚发热 / 戴阳），或中气下陷导致阴火上冲。午后夜间阴阳交接，正不胜邪，故表现为低热，本质属虚。'
        : isFangji
        ? '方剂主治病机与配伍机制。以核心病机为轴，按"君臣佐使"拆解方义：君药定方向、臣药增效、佐药兼治反佐、使药引经报使；结合煎服法与禁忌加深理解。'
        : isExam
        ? '核心考点与鉴别链：先锁定病位病性，再按"主症 + 舌脉 + 类证鉴别 + 代表方"四层输出。'
        : '从脏腑阴阳、气血津液、经络循行的平衡角度解析核心病机，锁定病位、病性、病势三层，形成完整辨证链路。',
    },
    引导式对话模式: {
      title: '学伴启发与思路点拨',
      content: isYinxu
        ? '💡 思考一下：为什么发热偏偏是在"手心、脚心、胸口"而不是全身大热？\n这是因为手心劳宫穴归心包经，足心涌泉穴归肾经，胸中为膻中（心之宫城）。当你联想到"肾主藏精、心主血脉"时，是不是立刻能把中基的经络脏腑和中诊的症状串起来了？'
        : isYangxu
        ? '💡 想一想：阳虚的人本应畏寒肢冷，为什么反而会体温升高出现低热？\n试着回忆李东垣《脾胃论》中的"阴火"理论——脾胃之气下陷，谷气不升，伏留于下焦而生内热。'
        : isFangji
        ? '💡 试着列 3 条答案：①君药是谁？解决什么病机？②臣药/佐药如何辅助君药？③如果去掉某一味药，方义会发生什么变化？'
        : isExam
        ? '💡 先自己写出该考点的 3 条"最易混淆辨析项"，再对比教材原文找出你遗漏的关键体征或舌脉。'
        : '💡 尝试思考：抓住该证候或方药的"特征性表现"与"舌脉特异性"，我们该如何逐步排除相近证型？',
    },
    临床案例模式: {
      title: '典型病案与四诊合参',
      content: isYinxu
        ? '【病案记录】：患者女，21岁中医大一学生，期末熬夜备考后出现傍晚手足心烦热，伴口燥咽干、夜间盗汗。诊见舌质红、苔剥脱，脉细数。辨证为"肾阴亏虚，虚热内生"，以知柏地黄丸加减滋阴降火。'
        : isYangxu
        ? '【病案记录】：患者男，48岁，劳累后常感午后微热（37.4℃），少气懒言，便溏，身虽微热但喜温水。舌淡胖有齿痕，脉沉细无力。辨证为"脾胃气虚发热"，投补中益气汤3剂，体温恢复正常。'
        : isFangji
        ? '【病案记录】：以主诉为切入，按"主诉→现病史→既往史→过敏史→四诊合参（舌脉）→辨证→治法→方药→调护"的完整链条书写，注意方证对应与剂量变化。'
        : isExam
        ? '【病案记录】：写真题病案：主诉 3 条必带（主症 + 时间 + 加重/缓解因素），舌脉一定写清楚，最后写辨证分型、治法、方药、剂量。'
        : '【病案记录】：临床辨证注重四诊合参，抓住"主诉-现病史-舌象-脉象"证据链，形成完整的理法方药闭环；鉴别诊断至少列出 2 个易混证型。',
    },
    图像解说模式: {
      title: '病机传变链路与结构图解',
      content: isYinxu
        ? '【病机链路图解】：\n久病 / 熬夜耗伤精血 ──▶ 肾水不足（水箱枯竭） ──▶ 水不涵木、水不制火 ──▶ 虚热内炽 ──▶ 五心烦热 / 骨蒸潮热 / 舌红少苔细数脉'
        : isYangxu
        ? '【病机链路图解】：\n劳倦 / 饮食伤脾 ──▶ 中气下陷 ──▶ 谷气下流 ──▶ 下焦伏留化热（阴火） ──▶ 低热 / 自汗 / 少气懒言'
        : isFangji
        ? '【组方结构图解】：\n君药 ──▶ 解决主病主证\n├ 臣药 ──▶ 加强君药功效\n├ 佐药 ──▶ 兼证 + 反佐\n└ 使药 ──▶ 引经 + 调和诸药'
        : isExam
        ? '【考点图谱】：\n顶层：证型\n├ 主症分支（症候群）\n├ 舌脉分支（客观金指标）\n├ 治法分支\n└ 方药分支（代表方 + 经典药对）'
        : '【知识图谱结构】：\n病因 → 病位（脏腑/经络/六经/卫气营血）→ 病性（寒热虚实阴阳）→ 证候 → 治法 → 代表方 → 常用中药 → 鉴别要点',
    },
    通俗类比模式: {
      title: '生活化比喻模型（降低初学负荷）',
      content: isYinxu
        ? '【水壶煮水模型】：把人体比作一个正在加热的茶壶，阳气是炉火，阴液是壶里的水。\n当水充足时，炉火再旺水温也平衡稳定；如果水快烧干了（阴虚），哪怕火没有调大，壶底和壶壁也会被烧得滚烫发焦（虚热）。手心脚心就是壶身导热最敏感的受热点。'
        : isYangxu
        ? '【油灯与微风模型】：阳虚发热好比油灯里的灯油快耗尽了，灯芯摇摇欲坠，微风一吹火苗不仅不稳，反而突然往上乱窜（虚阳浮越）。虽然看见火光，底座却是冰凉的。'
        : isFangji
        ? '【足球队模型】：一首方剂就是一支足球队：君=前锋（主攻）、臣=中场（输送弹药）、佐=后卫/门将（防守反佐）、使=教练（调度指挥、引经报使）。'
        : isExam
        ? '【抽屉收纳模型】：考点像衣服，八纲=衣柜（表/里/寒/热/虚/实/阴/阳），脏腑=抽屉，舌脉=标签，考场上只要先找到"哪一柜哪一屉"就不会乱。'
        : '【城市管道供水模型】：气为动力水泵，血为自来水流，经络为城市管网，津液是河道水库。动力足、水源清、管道畅，各脏腑街区才能水润通达；哪里堵、哪里漏，就会出现对应的证候。',
    },
    古籍溯源模式: {
      title: '经典古籍原文依据',
      content: isYinxu
        ? '《素问·调经论》："阴虚生内热奈何？……阴气衰，天气闭塞，故神气上冲，但热不恶寒，故曰内热。"\n《景岳全书·传忠录》："阳胜则身热，腠理闭，喘粗，为之俯仰，汗不出而热，齿干以烦冤，腹满死，能冬不能夏。"'
        : isYangxu
        ? '《黄帝内经·素问·阴阳应象大论》："阴在内，阳之守也；阳在外，阴之使也。阴平阳秘，精神乃治。"\n《脾胃论·饮食劳倦所伤始为热中论》："脾胃气虚，则下流于肾，阴火得以乘其土位。"'
        : isFangji
        ? '《伤寒论》原方条文 + 《医方考》《医宗金鉴·删补名医方论》对方义的拆解；对照原文背方歌更容易记住"为什么这么配伍"。'
        : isExam
        ? '【必背原文 + 条文号】：把高频考点对应的《伤寒论》《金匮》条文号记在卡片正面，条文原文写背面，考前 3 天翻卡片自测。'
        : '【经典原文】：建议回查《黄帝内经素问》《灵枢》《难经》《伤寒论》《金匮要略》《温病条辨》对应条文，按"原文 + 校注 + 后世发挥"三层做卡片。',
    },
    医家各说模式: {
      title: '历代名医学术观点辨析',
      content: isYinxu
        ? '• 朱丹溪（滋阴派）："阳常有余，阴常不足"，强调保护真阴，主张用熟地、黄柏、知母滋水降火。\n• 张景岳（温补派）："善补阴者，必于阳中求阴，则阴得阳升而泉源不竭"，主张阴阳互济互根。'
        : isYangxu
        ? '• 李东垣（脾胃论）："内伤脾胃，百病由生"，创甘温除大热之法，代表方补中益气汤。\n• 张景岳 / 郑钦安：重视命门真火，提出"阳主阴从"，用附子、干姜回阳救逆、引火归元。'
        : isFangji
        ? '• 仲景：方证对应，药简力专；\n• 叶天士 / 吴鞠通：温病方剂注重轻灵透达；\n• 王清任：血瘀证方剂注重逐瘀与补气并行。'
        : isExam
        ? '• 考点视角：同样一个"发热"，仲景看六经（太阳/阳明/少阳），东垣看脾胃（阴火），叶天士看卫气营血；考试要按题干给出的"学术语境"选择学派。'
        : '【历代医家观点】：每一个考点建议至少列出 3 位代表医家的不同视角（如外感宗仲景、内伤遵东垣、温病学叶薛吴王），做横向对比表。',
    },
    现代研究模式: {
      title: '现代生理与药理学机制',
      content: isYinxu
        ? '现代医学研究表明：中医"阴虚内热"状态常伴有自主神经系统功能紊乱（交感神经兴奋性偏高）、下丘脑-垂体-甲状腺 / 肾上腺皮质轴亢进，以及基础代谢率轻微上升和微循环障碍，这解释了患者自觉肢端发热而体温计测量通常正常的现象。'
        : isYangxu
        ? '现代药理与微循环研究证实：甘温除热代表方（补中益气汤等）通过多靶点调节神经-内分泌-免疫网络（NEI 网络），改善肠道屏障、炎症因子水平与细胞能量代谢，从而纠正"气虚发热"的低烈度慢性炎症状态。'
        : isFangji
        ? '【现代药理】：中药复方多通过"多成分-多靶点-多通路"协同起效；常用方法包括：网络药理学、代谢组学、肠道菌群 16S 测序、分子对接、血清药物化学等。'
        : isExam
        ? '【近年真题热点】：常考"某代表方的现代药理作用"——如补中益气汤的免疫调节、六味地黄丸对 HPA 轴的影响、黄连解毒汤的抗炎机制等。'
        : '【现代机制】：中药复方多通过"多成分-多靶点-多通路"协同起效；常用方法包括：网络药理学、代谢组学、肠道菌群 16S 测序、分子对接等。',
    },
    关联方药模式: {
      title: '对证方剂与药对配伍拓展',
      content: isYinxu
        ? '【核心对证方】：六味地黄丸（三补三泻：熟地配泽泻、山茱萸配丹皮、山药配茯苓）、知柏地黄丸（滋阴降火代表方）、大补阴丸（培本清源）。\n【经典药对】：知母 + 黄柏（清退虚热），鳖甲 + 地骨皮（滋阴退蒸），生地 + 玄参（增液滋阴）。'
        : isYangxu
        ? '【核心对证方】：补中益气汤（甘温除大热代表）、理中丸（温中祛寒）、金匮肾气丸 / 右归丸（温补肾阳）。\n【经典药对】：附子 + 干姜（回阳救逆），黄芪 + 党参 / 人参（益气升阳），升麻 + 柴胡（升阳举陷）。'
        : isFangji
        ? '【方药拓展】：除记忆方歌、组成、功用主治外，重点拆解"核心药对 + 加减变化 + 类方鉴别"；建议用"异病同治 / 同病异治"双向串联方剂。'
        : isExam
        ? '【核心必考药对】：麻黄+桂枝、附子+干姜、知母+黄柏、升麻+柴胡、当归+黄芪、半夏+厚朴、石膏+知母；记住"剂量变化带来的方义转变"。'
        : '【相关方药联想】：按"治法 → 代表方 → 核心药对 → 常用中药 → 相似方鉴别"的层级构建知识树；至少关联 2 张代表方与 3 组经典药对。',
    },
  };

  const sections = (Array.isArray(selectedOutputs) ? selectedOutputs : []).map((mode) => {
    const sec = allPossibleSections[mode] || { title: mode, content: '针对该模式的中医学科解析内容，结合具体知识点层层剖析。' };
    return { mode, title: sec.title, content: sec.content };
  });

  let topic = q ? q.slice(0, 18) : '中医学习问题理解';
  let intent = '概念辨析与知识建构';
  if (isYinxu) { topic = '阴虚潮热与五心烦热病机'; intent = '病机理解与鉴别辨析'; }
  else if (isYangxu) { topic = '阳虚低热与阳分伏热机理'; intent = '病机理解与鉴别辨析'; }
  else if (isFangji) { topic = '方剂组方配伍与方证对应'; intent = '方剂组成与配伍机制'; }
  else if (isExam) { topic = '考点辨析与易错鉴别'; intent = '考点总结与对比辨析'; }

  const baseNodes = [
    {
      name: isYinxu ? '六味地黄丸与知柏地黄丸' : isYangxu ? '甘温除热法与补中益气汤' : isFangji ? '君臣佐使配伍原则' : '八纲辨证与脏腑辨证',
      course: '方剂学',
      strength: 0.94,
      relationType: '对应治法方药',
      reason: '直接针对核心证候/治法的代表方剂',
    },
    {
      name: isYinxu ? '舌红少苔与细数脉' : isYangxu ? '舌淡胖齿痕与沉细脉' : isFangji ? '方歌速记与类方鉴别' : '舌脉诊法要点',
      course: '中医诊断学',
      strength: 0.91,
      relationType: '核心舌脉体征',
      reason: '客观诊断的关键辨证指标',
    },
    {
      name: isYinxu ? '阳分伏热与透热转气' : isYangxu ? '引火归元与真武汤' : isFangji ? '半夏厚朴汤 vs 厚朴温中汤' : '卫气营血辨证概要',
      course: '温病学',
      strength: 0.72,
      relationType: '弱关联延伸',
      reason: '跨学科关联：机制相似但层次不同，避免混淆',
    },
  ];

  return {
    analysis: {
      background: `中医学 / ${studentGrade} / ${currentCourse}`,
      topic,
      intent,
      course: currentCourse,
      outputModes: (Array.isArray(selectedOutputs) && selectedOutputs.length) ? selectedOutputs.slice() : ['直接精准模式', '通俗类比模式', '临床案例模式', '关联方药模式'],
      structuredPrompt: [
        '请从以下结构化维度深入解析：',
        '1. 核心病机机制与脏腑 / 经络 / 气血津液定位？',
        '2. 临床表现特征、节律特点与舌脉鉴别要点？',
        `3. 根据勾选的模式（${(Array.isArray(selectedOutputs) && selectedOutputs.length) ? selectedOutputs.join('、') : '默认 4 项'}）针对性分层阐述。`,
        '4. 关联方药 / 类方鉴别 / 延伸知识点至少列出 2 组。',
      ],
      learnerCognitive: userPreference,
    },
    answer: {
      companionGreeting: '你好呀学伴！已按你定制的输出模式生成结构化解答，希望能帮助你理清思维：',
      sections: sections.length ? sections : [{ mode: '直接精准模式', title: '要点解析', content: '针对该问题的核心要点解析。' }],
      relatedKnowledgeNodes: baseNodes,
    },
    abComparison: {
      unenhancedShortAnswer: '这是常见的中医知识点，主要是体内阴阳失调或对应病机造成的，平时多注意休息和清淡饮食，可以参考教材相关章节。',
      comparisonMetrics: { accuracyDiff: '+36%', completenessDiff: '+52%', understandabilityDiff: '+45%', knowledgeExpansionDiff: '+65%' },
    },
  };
}

/* ========== 八、启动服务：检测占用 → 找空闲端口 → 启动 Express（纯 API 模式，默认跳过 Vite React 中间件） ========== */
/*
 * 关键修复：
 *  1) ENABLE_VITE_MIDDLEWARE=false —— 避免加载 engine 目录里 React 兄弟项目的 vite.config，
 *     在 Windows + Node v24 下会触发 libuv 断言崩溃。真实业务中 Vue 前端（xueyi-webapp-main）走独立 Vite 端口。
 *  2) 不再 killPort/taskkill —— Windows 下 execSync(taskkill) 会触发未捕获异常导致静默闪退（exit -1）。
 *     改为 warnIfPortOccupied 仅提示。
 *  3) startServer() 整体 try/catch，保证错误一定会打印到控制台。
 */
const ENABLE_VITE_MIDDLEWARE: boolean = false;

async function startServer(): Promise<void> {
  try {
    /* 启动前只做占用提示，不做强制清理 */
    warnIfPortOccupied(DEFAULT_PORT);
    warnIfPortOccupied(HMR_PORT);

    /* 云平台（Render 等）通过 PORT 指定端口，必须直接监听；本地开发才自动找空闲端口 */
    const cloudPort = Number(process.env.PORT);
    let resolvedPort;
    if (Number.isFinite(cloudPort) && cloudPort > 0) {
      resolvedPort = cloudPort;
    } else {
      resolvedPort = await findFreePort(DEFAULT_PORT, 30);
      if (!resolvedPort) {
        console.error('[学医智用] 找不到可用端口，请手动关闭占用后重试');
        process.exit(1);
      }
      writeEnginePort(resolvedPort);
    }

    if (ENABLE_VITE_MIDDLEWARE && process.env.NODE_ENV !== 'production') {
      try {
        const vite = await createViteServer({
          server: { middlewareMode: true, hmr: { port: HMR_PORT } },
          appType: 'spa',
        });
        app.use(vite.middlewares);
        console.log('[学医智用] Vite middleware 已挂载（React 调试模式）');
      } catch (err) {
        console.warn('[学医智用] Vite dev server 启动失败，仅运行 Express API：', err);
      }
    } else if (process.env.NODE_ENV === 'production') {
      const distPath = path.join(process.cwd(), 'dist');
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.get('*', (_req, res) => {
          res.sendFile(path.join(distPath, 'index.html'));
        });
        console.log('[学医智用] production 静态资源已挂载（dist）');
      } else {
        console.log('[学医智用] production 模式但未找到 dist/，仅运行 Express API');
      }
    } else {
      console.log('[学医智用] 纯 API 模式（Vite middleware 已关闭，修复 Windows 下 React Vite 崩溃）');
    }

    app.listen(resolvedPort, '0.0.0.0', () => {
      console.log(`[学医智用] Server running on http://0.0.0.0:${resolvedPort}`);
      console.log(`[学医智用] Engine provider: ${DEEPSEEK_API_KEY ? 'DeepSeek(' + DEEPSEEK_MODEL + ')' : (process.env.GEMINI_API_KEY ? 'Gemini' : 'Mock(本地)')}`);
      console.log(`[学医智用] 端口已写入：${path.join(process.cwd(), '.engine-port.json')}`);
    });
  } catch (e: any) {
    console.error('[学医智用] startServer() 抛出致命异常：', e?.message || e);
    if (e?.stack) console.error(e.stack);
    process.exit(2);
  }
}

startServer();
