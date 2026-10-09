import { LearnerArchetype, LearnerRadarScores, LearnerReportData } from '../types';

export interface AssessmentQuestionOption {
  id: string; // A, B, C...
  text: string;
  subtext?: string;
  // 权重加分映射：{ [archetype]: score }
  weights?: Partial<Record<LearnerArchetype, number>>;
  // 4维雷达增益加分
  radarWeights?: Partial<LearnerRadarScores>;
}

export interface AssessmentQuestion {
  id: number;
  part: string;
  title: string;
  instruction?: string;
  type: 'single' | 'multiple' | 'ranking';
  maxSelect?: number;
  options: AssessmentQuestionOption[];
  allowCustomInput?: boolean;
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 1,
    part: '第一部分：基线信息',
    title: 'Q1. 你当前的主修专业是？',
    instruction: '（单选）',
    type: 'single',
    options: [
      { id: 'A', text: '中医学' },
      { id: 'B', text: '针灸推拿学' },
      { id: 'C', text: '中医骨伤科学' },
      { id: 'D', text: '中医儿科学' },
      { id: 'E', text: '中西医临床医学' },
      { id: 'F', text: '中药学' },
      { id: 'G', text: '非中医学专业' },
    ],
    allowCustomInput: true,
  },
  {
    id: 2,
    part: '第一部分：基线信息',
    title: 'Q2. 你当前的年级是？',
    instruction: '（单选）',
    type: 'single',
    options: [
      { id: 'A', text: '大一' },
      { id: 'B', text: '大二' },
      { id: 'C', text: '大三' },
      { id: 'D', text: '大四' },
      { id: 'E', text: '大五' },
      { id: 'F', text: '研究生' },
    ],
  },
  {
    id: 3,
    part: '第一部分：基线信息',
    title: 'Q3. 使用这个学习系统，你最核心的任务目标是什么？',
    instruction: '（可多选，最多选 2 项）',
    type: 'multiple',
    maxSelect: 2,
    options: [
      {
        id: 'A',
        text: '日常跟课，弄懂今天学的内容',
        weights: { 线性吸收者: 2 },
        radarWeights: { comprehension: 10, memory: 5 },
      },
      {
        id: 'B',
        text: '期末备考，快速锁定重点并记住',
        weights: { 应试突击者: 3 },
        radarWeights: { memory: 15 },
      },
      {
        id: 'C',
        text: '解决某个具体困惑（如“为什么肝郁会犯脾”）',
        weights: { 困惑探索者: 2 },
        radarWeights: { analysis: 10, application: 5 },
      },
      {
        id: 'D',
        text: '建立整门课的框架，把零散知识串起来',
        weights: { 框架建构师: 2, 体系构建师: 2 },
        radarWeights: { comprehension: 15, analysis: 10 },
      },
    ],
  },
  {
    id: 4,
    part: '第二部分：知识组织与理解方式',
    title: 'Q4. 当你学到一个抽象病机（如“肝郁气滞”）时，你下意识的思考路径是？',
    instruction: '（单选）',
    type: 'single',
    options: [
      {
        id: 'A',
        text: '先拆解肝的生理功能和气滞的含义，再找它们之间的联系',
        weights: { 框架建构师: 2, 体系构建师: 2 },
        radarWeights: { comprehension: 15, analysis: 10 },
      },
      {
        id: 'B',
        text: '马上想它和“肝火犯肺”“脾肾阳虚”有什么异同',
        weights: { 批判思辨者: 2, 困惑探索者: 1 },
        radarWeights: { analysis: 15 },
      },
      {
        id: 'C',
        text: '先找教材里的原话背下来再说',
        weights: { 线性吸收者: 2 },
        radarWeights: { memory: 15 },
      },
      {
        id: 'D',
        text: '必须结合一个具体例子（如胁痛或月经不调）才能理解',
        weights: { 困惑探索者: 2 },
        radarWeights: { application: 15 },
      },
    ],
  },
  {
    id: 5,
    part: '第二部分：知识组织与理解方式',
    title: 'Q5. 复习时发现不同学习材料（如教材、老师讲解、参考书）对同一概念表述有差异，你通常会？',
    instruction: '（单选）',
    type: 'single',
    options: [
      {
        id: 'A',
        text: '感到困惑，希望知道以哪个为准、为什么不同',
        weights: { 框架建构师: 1, 体系构建师: 1, 线性吸收者: 1 },
        radarWeights: { comprehension: 10 },
      },
      {
        id: 'B',
        text: '这很正常，我会放在一起对比，理解视角不同',
        weights: { 批判思辨者: 3 },
        radarWeights: { analysis: 20 },
      },
      {
        id: 'C',
        text: '没注意过差异，对我复习影响不大',
        weights: { 应试突击者: 1, 线性吸收者: 1 },
        radarWeights: { memory: 10 },
      },
    ],
  },
  {
    id: 6,
    part: '第二部分：知识组织与理解方式',
    title: 'Q6. 给你一张空白的章节框架图，你更倾向于？',
    instruction: '（单选）',
    type: 'single',
    options: [
      {
        id: 'A',
        text: '先自己尝试填充，填不上再查资料',
        weights: { 框架建构师: 3, 体系构建师: 3 },
        radarWeights: { comprehension: 20, analysis: 10 },
      },
      {
        id: 'B',
        text: '直接看现成的，在此基础上改成自己的',
        weights: { 框架建构师: 1, 体系构建师: 1, 应试突击者: 1 },
        radarWeights: { comprehension: 10, application: 5 },
      },
      {
        id: 'C',
        text: '不太习惯框架图，更习惯按顺序一条条复习',
        weights: { 线性吸收者: 3 },
        radarWeights: { memory: 15 },
      },
    ],
  },
  {
    id: 7,
    part: '第三部分：AI 交互偏好',
    title: 'Q7. 如果 AI 的回答和你教材上的表述有出入，你一般会？',
    instruction: '（单选）',
    type: 'single',
    options: [
      {
        id: 'A',
        text: '觉得 AI 不可靠，不太敢用',
        weights: { 线性吸收者: 2 },
        radarWeights: { memory: 10 },
      },
      {
        id: 'B',
        text: '对比两边的逻辑，看哪方更合理',
        weights: { 批判思辨者: 3 },
        radarWeights: { analysis: 20 },
      },
      {
        id: 'C',
        text: '只要不影响考试，不太在意',
        weights: { 应试突击者: 2 },
        radarWeights: { memory: 10 },
      },
    ],
  },
  {
    id: 8,
    part: '第三部分：AI 交互偏好',
    title: 'Q8. 遇到一个想不通的知识点，你希望 AI 怎么帮你？',
    instruction: '（请按偏好顺序拖拽或点击箭头排序，第1项为最偏好）',
    type: 'ranking',
    options: [
      {
        id: 'opt1',
        text: '用连环追问带我一步步想通',
        weights: { 批判思辨者: 2, 困惑探索者: 1 },
        radarWeights: { analysis: 15, application: 5 },
      },
      {
        id: 'opt2',
        text: '给一个精辟的比喻或口诀，帮我快速理解',
        weights: { 应试突击者: 2, 困惑探索者: 1 },
        radarWeights: { memory: 10, comprehension: 10 },
      },
      {
        id: 'opt3',
        text: '详细耐心，分步骤讲：定义→原理→举例→关联知识→小测验',
        weights: { 线性吸收者: 3, 框架建构师: 1, 体系构建师: 1 },
        radarWeights: { comprehension: 15, memory: 5 },
      },
      {
        id: 'opt4',
        text: '简洁有力，重点突出，方便快速抓住结论。',
        weights: { 应试突击者: 2 },
        radarWeights: { memory: 10 },
      },
      {
        id: 'opt5',
        text: '先搭好框架再填细节，层次分明、逻辑清晰。',
        weights: { 框架建构师: 3, 体系构建师: 3 },
        radarWeights: { comprehension: 20 },
      },
    ],
  },
  {
    id: 9,
    part: '第四部分：学习习惯与状态感知',
    title: 'Q9. 你希望自己在中医学习中最终能达到什么样的状态？',
    instruction: '（可多选）',
    type: 'multiple',
    options: [
      {
        id: 'A',
        text: '能用自己的话清晰解释给别人听',
        weights: { 框架建构师: 2, 体系构建师: 2 },
        radarWeights: { comprehension: 15, application: 10 },
      },
      {
        id: 'B',
        text: '做题正确率高，考试有把握',
        weights: { 应试突击者: 3 },
        radarWeights: { memory: 20 },
      },
      {
        id: 'C',
        text: '能随时回忆起知识在整体框架中的位置',
        weights: { 框架建构师: 1, 体系构建师: 1, 线性吸收者: 1 },
        radarWeights: { comprehension: 15 },
      },
      {
        id: 'D',
        text: '能灵活运用理论分析临床或生活案例',
        weights: { 困惑探索者: 1 },
        radarWeights: { application: 20 },
      },
      {
        id: 'E',
        text: '能对所学内容进行批判性思考和独立判断',
        weights: { 批判思辨者: 3 },
        radarWeights: { analysis: 20 },
      },
    ],
  },
  {
    id: 10,
    part: '第四部分：学习习惯与状态感知',
    title: 'Q10. 目前学中医最大的困难是什么？',
    instruction: '（请按困难程度从高到低排序，第1项为最困难）',
    type: 'ranking',
    options: [
      {
        id: 'pain1',
        text: '内容太多，不想记、记不牢',
        weights: { 应试突击者: 2, 线性吸收者: 1 },
        radarWeights: { memory: 15 },
      },
      {
        id: 'pain2',
        text: '有些理论理解不透，但不知道怎么提问',
        weights: { 困惑探索者: 3 },
        radarWeights: { analysis: 10, application: 10 },
      },
      {
        id: 'pain3',
        text: '知识点零散，不知道它们之间怎么联系',
        weights: { 框架建构师: 2, 体系构建师: 2 },
        radarWeights: { comprehension: 15 },
      },
      {
        id: 'pain4',
        text: '不知道怎么把知识用到看病或实际场景上',
        weights: { 困惑探索者: 1 },
        radarWeights: { application: 15 },
      },
    ],
  },
  {
    id: 11,
    part: '第四部分：学习习惯与状态感知',
    title: 'Q11. 你通常如何学习新知识？',
    instruction: '（多选，限选 1~2 项）',
    type: 'multiple',
    maxSelect: 2,
    options: [
      {
        id: 'A',
        text: '先听老师讲课，课后整理笔记，再复习',
        weights: { 线性吸收者: 2 },
        radarWeights: { memory: 10, comprehension: 5 },
      },
      {
        id: 'B',
        text: '先自己预习教材，带着问题去听课或查资料',
        weights: { 框架建构师: 1, 体系构建师: 1, 批判思辨者: 1 },
        radarWeights: { comprehension: 10, analysis: 10 },
      },
      {
        id: 'C',
        text: '课后主要靠做题和练习来巩固理解',
        weights: { 应试突击者: 3 },
        radarWeights: { memory: 15, application: 5 },
      },
      {
        id: 'D',
        text: '喜欢和同学讨论，通过交流碰撞加深印象',
        weights: { 困惑探索者: 1 },
        radarWeights: { analysis: 10, application: 10 },
      },
      {
        id: 'E',
        text: '习惯用思维导图、表格或框架图自行梳理',
        weights: { 框架建构师: 3, 体系构建师: 3 },
        radarWeights: { comprehension: 25 },
      },
    ],
  },
];

// 评估计算函数：根据用户答卷输出 LearnerReportData
export function evaluateAssessmentAnswers(answers: Record<number, any>): LearnerReportData {
  const scores: Record<LearnerArchetype, number> = {
    体系构建师: 0,
    框架建构师: 0,
    应试突击者: 0,
    困惑探索者: 0,
    线性吸收者: 0,
    批判思辨者: 0,
  };

  const radar: LearnerRadarScores = {
    memory: 45,
    comprehension: 50,
    application: 40,
    analysis: 45,
  };

  // 遍历每道题并按加权计算
  ASSESSMENT_QUESTIONS.forEach((q) => {
    const ans = answers[q.id];
    if (!ans) return;

    if (q.type === 'single') {
      const opt = q.options.find((o) => o.id === ans);
      if (opt) {
        if (opt.weights) {
          Object.entries(opt.weights).forEach(([arch, pts]) => {
            scores[arch as LearnerArchetype] += pts || 0;
          });
        }
        if (opt.radarWeights) {
          Object.entries(opt.radarWeights).forEach(([dim, pts]) => {
            radar[dim as keyof LearnerRadarScores] += pts || 0;
          });
        }
      }
    } else if (q.type === 'multiple' && Array.isArray(ans)) {
      ans.forEach((optId) => {
        const opt = q.options.find((o) => o.id === optId);
        if (opt) {
          if (opt.weights) {
            Object.entries(opt.weights).forEach(([arch, pts]) => {
              scores[arch as LearnerArchetype] += pts || 0;
            });
          }
          if (opt.radarWeights) {
            Object.entries(opt.radarWeights).forEach(([dim, pts]) => {
              radar[dim as keyof LearnerRadarScores] += pts || 0;
            });
          }
        }
      });
    } else if (q.type === 'ranking' && Array.isArray(ans)) {
      // 第一项权重最高
      ans.forEach((optId, rankIdx) => {
        const opt = q.options.find((o) => o.id === optId);
        const multiplier = rankIdx === 0 ? 1.5 : rankIdx === 1 ? 0.8 : 0.2;
        if (opt) {
          if (opt.weights) {
            Object.entries(opt.weights).forEach(([arch, pts]) => {
              scores[arch as LearnerArchetype] += Math.round((pts || 0) * multiplier);
            });
          }
          if (opt.radarWeights) {
            Object.entries(opt.radarWeights).forEach(([dim, pts]) => {
              radar[dim as keyof LearnerRadarScores] += Math.round((pts || 0) * multiplier);
            });
          }
        }
      });
    }
  });

  // 归一化雷达得分在 50~95 之间
  const clamp = (val: number) => Math.min(95, Math.max(52, Math.round(val)));
  radar.memory = clamp(radar.memory);
  radar.comprehension = clamp(radar.comprehension);
  radar.application = clamp(radar.application);
  radar.analysis = clamp(radar.analysis);

  // 找出得分最高的原型
  let primaryRole: LearnerArchetype = '体系构建师';
  let maxScore = -1;

  // 合并“体系构建师”和“框架建构师”作为体系构建主导
  const unifiedScores = { ...scores };
  unifiedScores.体系构建师 += unifiedScores.框架建构师;

  Object.entries(unifiedScores).forEach(([role, score]) => {
    if (role === '框架建构师') return;
    if (score > maxScore) {
      maxScore = score;
      primaryRole = role as LearnerArchetype;
    }
  });

  // 如果理解型最高，默认判定为体系构建师
  if (radar.comprehension >= Math.max(radar.memory, radar.application, radar.analysis)) {
    primaryRole = '体系构建师';
  } else if (radar.memory >= Math.max(radar.comprehension, radar.application, radar.analysis)) {
    primaryRole = '应试突击者';
  } else if (radar.analysis >= Math.max(radar.comprehension, radar.application, radar.memory)) {
    primaryRole = '批判思辨者';
  } else if (radar.application >= Math.max(radar.comprehension, radar.memory, radar.analysis)) {
    primaryRole = '困惑探索者';
  }

  // 根据最终确定的角色构造报告详情
  const ARCHETYPE_DETAILS: Record<
    LearnerArchetype,
    {
      roleEnglish: string;
      description: string;
      strengths: string[];
      weaknesses: string[];
      aiSuggestions: string[];
    }
  > = {
    体系构建师: {
      roleEnglish: 'Structure Builder',
      description: '理解型得分最高，擅长把知识点连成体系；建议多通过案例与图谱巩固应用能力。',
      strengths: ['知识体系构建能力强', '概念理解深入', '逻辑思维清晰'],
      weaknesses: ['应用实践需加强', '记忆细节可提升'],
      aiSuggestions: [
        '多做案例分析题，将抽象病机落地于具体患者主诉',
        '使用知识图谱建立跨学科（中基-中诊-中药-方剂）关联',
        '定期做记忆强化训练，巩固细小药对与经络循行细节',
      ],
    },
    框架建构师: {
      roleEnglish: 'Structure Builder',
      description: '擅长从顶层逻辑入手，追求体系通透感，对零散背诵容忍度较低。',
      strengths: ['宏观框架感知敏锐', '知识迁移速度快', '结构梳理能力强'],
      weaknesses: ['应试题感需打磨', '细部方药剂量易遗漏'],
      aiSuggestions: [
        '在知识图谱中通过“半空白填空”检验回忆完整度',
        '在AI答疑中多使用【直接精准模式】与【关联方药模式】',
        '结合典型临床病案反推框架节点的临床实际意义',
      ],
    },
    应试突击者: {
      roleEnglish: 'Exam Navigator',
      description: '目标明确，效率优先；善于提取高频考点，但在深层机制贯通上可进一步加深。',
      strengths: ['考点记忆敏锐', '复习推进速度快', '应试提分导向清晰'],
      weaknesses: ['机理推演深度不足', '跨学科关联易断层'],
      aiSuggestions: [
        '利用关键词遮罩记忆工具巩固高频必背条文',
        '在AI答疑时开启【通俗类比模式】快速建立第一印象',
        '适度增加病机传变分析，减少死记硬背带来的遗忘率',
      ],
    },
    困惑探索者: {
      roleEnglish: 'Puzzled Explorer',
      description: '对未知病机充满探究欲望，善于从具体案例中领会深意，依赖启发与点拨。',
      strengths: ['案例领悟直觉好', '善于联系生活经验', '求知动机强烈'],
      weaknesses: ['提问精准度有待提升', '自主结构化梳理较弱'],
      aiSuggestions: [
        '使用AI问题增强引擎将模糊疑问一键转化为学科标准问题',
        '优先勾选【引导式对话模式】与【临床案例模式】启发思考',
        '在知识图谱中跟随学习路径一步步建立自信心',
      ],
    },
    线性吸收者: {
      roleEnglish: 'Linear Absorber',
      description: '治学严谨、按部就班；注重教材权威定义与经典顺序，稳扎稳打。',
      strengths: ['基础扎实稳健', '概念记忆严谨精确', '条理性好'],
      weaknesses: ['跳跃性联系较少', '面对发散性病案容易犹豫'],
      aiSuggestions: [
        '按照教材大纲顺序渐进式完成章节微任务',
        '在AI回答中选用【古籍溯源模式】与【直接精准模式】',
        '尝试通过对比表格将同类证候和方剂横向对照',
      ],
    },
    批判思辨者: {
      roleEnglish: 'Critical Thinker',
      description: '不满足于单一结论，乐于对比诸家学说与教材差异，具备独立学术潜质。',
      strengths: ['批判性思维出色', '学术视野开阔', '深层机理探索深入'],
      weaknesses: ['有时易陷入学术争议细节而影响复习进度'],
      aiSuggestions: [
        '在AI答疑中勾选【医家各说模式】与【现代研究模式】',
        '在跨学科知识图谱中探索弱关联节点与学术争鸣',
        '平衡学术辨析与期末基础考点掌握节奏',
      ],
    },
  };

  const details = ARCHETYPE_DETAILS[primaryRole];

  return {
    id: `rep_${Date.now()}`,
    testDate: new Date().toISOString().split('T')[0],
    primaryRole,
    roleEnglish: details.roleEnglish,
    description: details.description,
    radarScores: radar,
    strengths: details.strengths,
    weaknesses: details.weaknesses,
    aiSuggestions: details.aiSuggestions,
    dimensions: {
      knowledgeStyle: primaryRole === '体系构建师' ? '分析建构型' : '比较联结型',
      interactionMode: '溯源求证型',
      scenario: {
        goals: ['日常跟课', '建立框架'],
        painPoint: '记忆负荷',
      },
      metaGoal: ['架构师', '临床家'],
    },
    aiConfig: {
      answerStructure: '逻辑解释优先',
      citationLevel: '高（必须带出处）',
      interactivity: '中（可接受追问）',
      defaultView: '图谱模式',
    },
  };
}
