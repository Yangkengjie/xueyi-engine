import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  History,
  PlusCircle,
  Image as ImageIcon,
  Check,
  Brain,
  Layers,
  BarChart2,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Calendar,
  ArrowRight,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ChatMessage,
  TabType,
  OutputModeType,
} from '../types';
import { PRESET_QUESTIONS } from '../data/tcmPresetData';

interface DeductionTabProps {
  initialPrompt?: string;
  onNavigateTab: (tab: TabType, prompt?: string) => void;
  onOpenDocModal: () => void;
}

// 9 Output Modes specified in user design
const ALL_OUTPUT_MODES: OutputModeType[] = [
  '直接精准模式',
  '引导式对话模式',
  '临床案例模式',
  '图像解说模式',
  '通俗类比模式',
  '古籍溯源模式',
  '医家各说模式',
  '现代研究模式',
  '关联方药模式',
];

export const DeductionTab: React.FC<DeductionTabProps> = ({
  initialPrompt,
  onNavigateTab,
  onOpenDocModal,
}) => {
  // Top switcher: 答疑 (Q&A) vs 规划 (Study Planning)
  const [subMode, setSubMode] = useState<'qa' | 'planning'>('qa');

  // Input & state
  const [inputText, setInputText] = useState(initialPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeHistoryOpen, setActiveHistoryOpen] = useState(false);

  // 9 Output Modes state (Default selecting common modes for TCM learners)
  const [selectedOutputs, setSelectedOutputs] = useState<OutputModeType[]>([
    '直接精准模式',
    '通俗类比模式',
    '临床案例模式',
    '关联方药模式',
  ]);

  // Planning state
  const [planGoal, setPlanGoal] = useState('期末复习《中医诊断学》八纲辨证与舌脉诊断');
  const [planDays, setPlanDays] = useState('7');
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle initial prompt from other pages
  useEffect(() => {
    if (initialPrompt && messages.length === 0) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const toggleOutputMode = (mode: OutputModeType) => {
    setSelectedOutputs((prev) => {
      if (prev.includes(mode)) {
        // Keep at least one selected
        if (prev.length === 1) return prev;
        return prev.filter((m) => m !== mode);
      } else {
        return [...prev, mode];
      }
    });
  };

  // Main sending handler
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    setInputText('');
    const newMsgId = Date.now().toString();

    const userMsg: ChatMessage = {
      id: newMsgId,
      sender: 'user',
      rawQuestion: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isConfirmed: false,
      activeView: 'enhanced',
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/enhance-and-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          selectedOutputs,
          studentGrade: '大一',
          currentCourse: '中医诊断学',
        }),
      });

      const data = await response.json();

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === newMsgId) {
            return {
              ...msg,
              analysis: data.analysis,
              answer: data.answer,
              abComparison: data.abComparison,
              isConfirmed: true,
            };
          }
          return msg;
        })
      );
    } catch (err) {
      console.error('Failed to enhance prompt:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewChat = () => {
    setMessages([]);
    setInputText('');
  };

  const handleGeneratePlan = () => {
    setIsLoading(true);
    setTimeout(() => {
      setGeneratedPlan({
        target: planGoal,
        duration: `${planDays}天规划`,
        studentType: '大一中医学专业 · 机制推演偏好',
        stages: [
          {
            day: 'Day 1-2: 基础理论与八纲辨证框架',
            focus: '中基与中诊交叉考点',
            tasks: [
              '梳理八纲辨证框架（表里、寒热、虚实、阴阳）',
              '利用【直接精准模式】自测阴虚潮热 vs 阳虚低热病机',
              '完成《中诊》问诊章节真题20道',
            ],
            graphRelation: '关联图谱节点：阴虚潮热、虚热病机（关系强度 0.94）',
          },
          {
            day: 'Day 3-4: 舌脉特征与临床案例鉴别',
            focus: '四诊合参技能巩固',
            tasks: [
              '对比掌握：舌红少苔（阴虚） vs 舌淡苔白腻（脾虚湿阻）',
              '脉象图谱强化：细数脉与浮大无力脉鉴别',
              '通过【临床案例模式】分析3个经典误诊病例',
            ],
            graphRelation: '关联图谱节点：脉细数、舌红少苔（关系强度 0.91）',
          },
          {
            day: 'Day 5-6: 跨课程方药映射与配伍',
            focus: '中诊证候 ──> 方剂学对应治法',
            tasks: [
              '阴虚证 -> 六味地黄丸/知柏地黄丸三补三泻机制',
              '气虚发热 -> 补中益气汤甘温除大热机制',
              '方剂同名药对比：半夏厚朴汤 vs 厚朴温中汤',
            ],
            graphRelation: '跨课关联：六味地黄丸（关系强度 0.92）、补中益气汤（0.95）',
          },
          {
            day: 'Day 7: 综合模拟与弱项自测',
            focus: '综合答疑与错题闭环',
            tasks: [
              '在【推演】板块进行全真病案推演测试',
              '回看个性化认知模型中的薄弱知识点清单',
            ],
            graphRelation: '全图谱闭环自测',
          },
        ],
      });
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Top Pill Switcher: [ 答疑 ] / [ 规划 ] */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex bg-stone-200/80 p-0.5 rounded-full border border-stone-300/60 w-48">
          <button
            onClick={() => setSubMode('qa')}
            className={`flex-1 py-1 rounded-full text-xs font-semibold transition-all text-center ${
              subMode === 'qa'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            答疑
          </button>
          <button
            onClick={() => setSubMode('planning')}
            className={`flex-1 py-1 rounded-full text-xs font-semibold transition-all text-center ${
              subMode === 'planning'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            规划
          </button>
        </div>

        {/* Sub-bar Actions */}
        {subMode === 'qa' && (
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveHistoryOpen(!activeHistoryOpen)}
              className="flex items-center gap-1 text-stone-500 hover:text-stone-800 px-2 py-1 rounded-md hover:bg-stone-100 transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              <span>历史记录</span>
            </button>
            <button
              onClick={handleStartNewChat}
              className="flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-medium px-2 py-1 rounded-md hover:bg-emerald-50 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>新对话</span>
            </button>
          </div>
        )}
      </div>

      {/* History Drawer Modal */}
      {activeHistoryOpen && (
        <div className="bg-white border border-stone-200 rounded-xl p-3 shadow-xs text-xs space-y-2 animate-in fade-in">
          <div className="font-semibold text-stone-700 flex justify-between items-center">
            <span>近期答疑历史</span>
            <button
              onClick={() => setActiveHistoryOpen(false)}
              className="text-stone-400 hover:text-stone-600"
            >
              ✕
            </button>
          </div>
          <div className="divide-y divide-stone-100">
            {PRESET_QUESTIONS.map((pq, idx) => (
              <div
                key={idx}
                onClick={() => {
                  handleSendMessage(pq.question);
                  setActiveHistoryOpen(false);
                }}
                className="py-1.5 hover:text-emerald-800 cursor-pointer flex justify-between items-center"
              >
                <span className="truncate pr-2">{pq.question}</span>
                <span className="text-[10px] text-stone-400 shrink-0">刚刚</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 1: AI 答疑 (QA Mode) */}
      {subMode === 'qa' ? (
        <div className="flex-1 flex flex-col justify-between min-h-[500px]">
          {/* Chat / Content stream area */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 pb-2">
            {/* Empty state when no messages */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center pt-8 sm:pt-12 pb-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5 border border-emerald-100">
                  <Brain className="w-7 h-7" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-stone-800">
                  中医 AI 学伴
                </h2>
                <p className="text-xs text-stone-500 mt-1 max-w-sm">
                  请问有什么可以帮您？在下方勾选输出方式并输入疑问，引擎将自动为您结构化升级。
                </p>

                {/* Recommended Presets */}
                <div className="mt-5 w-full max-w-md space-y-2 text-left">
                  <div className="text-[11px] font-medium text-stone-500 px-1">
                    💡 试一试中医高频痛点问题：
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {PRESET_QUESTIONS.map((pq, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(pq.question)}
                        className="p-2.5 bg-white hover:bg-emerald-50/40 rounded-xl border border-stone-200/80 hover:border-emerald-200 text-left transition-all shadow-none group"
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-semibold text-stone-800 group-hover:text-emerald-900">
                            {pq.question}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 font-medium shrink-0">
                            {pq.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 line-clamp-1">
                          {pq.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Message Stream */}
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-3">
                {/* 1. Student Original Question */}
                <div className="flex justify-end">
                  <div className="bg-emerald-800 text-white rounded-2xl rounded-tr-xs px-3.5 py-2 max-w-[85%] text-xs sm:text-sm shadow-xs">
                    <div className="text-[10px] text-emerald-200/80 mb-0.5">学生提问</div>
                    <div className="font-normal leading-relaxed">{msg.rawQuestion}</div>
                  </div>
                </div>

                {/* 2. Problem Understanding & Enhancement Card (Clean, Minimal, Light Green Theme) */}
                {msg.analysis && (
                  <div className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-none space-y-2.5">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                        <span className="text-xs font-bold text-stone-800">
                          问题理解与增强分析
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 font-medium">
                        已结构化拆解
                      </span>
                    </div>

                    {/* Meta Analysis Items (Minimal grid) */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-[#F7F9F8] p-2.5 rounded-xl border border-stone-100 text-stone-600">
                      <div>
                        <span className="text-[11px] text-stone-400">背景：</span>
                        <span className="font-medium text-stone-800">{msg.analysis.background}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-stone-400">主题：</span>
                        <span className="font-medium text-emerald-900">{msg.analysis.topic}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-stone-400">意图：</span>
                        <span className="font-medium text-stone-800">{msg.analysis.intent}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-stone-400">输出方式：</span>
                        <span className="font-medium text-emerald-850 truncate inline-block max-w-[120px] align-bottom">
                          {msg.analysis.outputModes.join('、')}
                        </span>
                      </div>
                    </div>

                    {/* AI Structured Augmented Prompt */}
                    <div className="bg-white rounded-xl p-2.5 border border-stone-100 text-xs">
                      <div className="font-semibold text-stone-700 mb-1 flex items-center gap-1 text-[11px]">
                        <FileText className="w-3 h-3 text-emerald-700" />
                        <span>增强优化后的结构化提问：</span>
                      </div>
                      <ul className="space-y-0.5 text-stone-600 list-disc pl-4 text-[11px] leading-relaxed">
                        {msg.analysis.structuredPrompt.map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* 3. A/B Comparison View Switcher (Clean, Subtle) */}
                {msg.abComparison && (
                  <div className="flex items-center justify-between bg-stone-100/80 p-1 rounded-xl border border-stone-200/70 text-xs">
                    <span className="text-stone-500 font-medium text-[11px] pl-1.5">
                      效果对比：
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          setMessages((prev) =>
                            prev.map((m) =>
                              m.id === msg.id ? { ...m, activeView: 'enhanced' } : m
                            )
                          )
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          msg.activeView === 'enhanced'
                            ? 'bg-emerald-800 text-white shadow-xs'
                            : 'bg-white text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        增强解答
                      </button>
                      <button
                        onClick={() =>
                          setMessages((prev) =>
                            prev.map((m) =>
                              m.id === msg.id ? { ...m, activeView: 'unenhanced' } : m
                            )
                          )
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          msg.activeView === 'unenhanced'
                            ? 'bg-stone-700 text-white shadow-xs'
                            : 'bg-white text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        原始直接回答
                      </button>
                      <button
                        onClick={() =>
                          setMessages((prev) =>
                            prev.map((m) =>
                              m.id === msg.id ? { ...m, activeView: 'comparison' } : m
                            )
                          )
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          msg.activeView === 'comparison'
                            ? 'bg-stone-800 text-white shadow-xs'
                            : 'bg-white text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        对照评测
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. Structured Answer Response (Clean, Light Green & White, Minimalist) */}
                {msg.answer && msg.activeView === 'enhanced' && (
                  <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-none space-y-3.5 text-xs sm:text-sm">
                    {/* Companion Header */}
                    <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                      <div className="w-7 h-7 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-medium shrink-0">
                        学伴
                      </div>
                      <div>
                        <div className="font-bold text-stone-800 text-xs">
                          中医智能学伴
                        </div>
                        <div className="text-[11px] text-stone-400">
                          {msg.answer.companionGreeting}
                        </div>
                      </div>
                    </div>

                    {/* Output Mode Sections (Rendered cleanly according to selected 9 modes) */}
                    <div className="space-y-3">
                      {msg.answer.sections && msg.answer.sections.length > 0 ? (
                        msg.answer.sections.map((section, sIdx) => (
                          <div
                            key={sIdx}
                            className="bg-[#F9FBFA] p-3 rounded-xl border border-stone-150 space-y-1.5"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
                              <span className="text-xs font-bold text-stone-900">
                                {section.title || section.mode}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-100/80 font-normal">
                                {section.mode}
                              </span>
                            </div>
                            <div className="text-stone-700 leading-relaxed whitespace-pre-line text-xs pl-2.5 border-l border-stone-200">
                              {section.content}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-stone-600 text-xs leading-relaxed">
                          暂无小节内容
                        </div>
                      )}
                    </div>

                    {/* Related Knowledge Nodes (if available) */}
                    {msg.answer.relatedKnowledgeNodes &&
                      msg.answer.relatedKnowledgeNodes.length > 0 && (
                        <div className="pt-2 border-t border-stone-100 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-stone-800 flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5 text-emerald-700" />
                              <span>关联知识拓展（弱关联推荐）：</span>
                            </span>
                            <button
                              onClick={() => onNavigateTab('learning')}
                              className="text-[11px] text-emerald-800 hover:underline flex items-center gap-0.5"
                            >
                              <span>知识图谱</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {msg.answer.relatedKnowledgeNodes.map((node, i) => (
                              <div
                                key={i}
                                onClick={() =>
                                  handleSendMessage(`请深入讲解【${node.name}】与当前知识点的内在逻辑关系`)
                                }
                                className="p-2.5 bg-stone-50/80 hover:bg-emerald-50/60 rounded-xl border border-stone-200/80 hover:border-emerald-200 cursor-pointer transition-colors"
                              >
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className="font-semibold text-stone-800 text-xs">
                                    {node.name}
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100/70 text-emerald-900 font-medium">
                                    强度 {(node.strength * 100).toFixed(0)}%
                                  </span>
                                </div>
                                <div className="text-[10px] text-stone-500">
                                  {node.course} · {node.relationType}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Feedback Toolbar */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-stone-100 text-stone-400 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-stone-400">学伴回答是否有帮助？</span>
                        <button
                          onClick={() => alert('已记录您的正向反馈！')}
                          className="p-1 hover:text-emerald-700 rounded hover:bg-stone-50"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => alert('感谢反馈，我们将持续优化回答！')}
                          className="p-1 hover:text-stone-700 rounded hover:bg-stone-50"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleSendMessage(`请针对“${msg.rawQuestion}”换一种更白话的表达重新解释`)}
                        className="text-[11px] text-stone-500 hover:text-emerald-800 px-2 py-0.5 bg-stone-100 rounded hover:bg-stone-200 transition-colors"
                      >
                        重新解释
                      </button>
                    </div>
                  </div>
                )}

                {/* View 2: Unenhanced Direct Answer (for comparison) */}
                {msg.abComparison && msg.activeView === 'unenhanced' && (
                  <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 text-xs sm:text-sm space-y-2">
                    <div className="text-[11px] font-semibold text-stone-500 border-b border-stone-200 pb-1">
                      通用大模型未增强直接回答：
                    </div>
                    <p className="text-stone-700 leading-relaxed whitespace-pre-line">
                      {msg.abComparison.unenhancedShortAnswer}
                    </p>
                  </div>
                )}

                {/* View 3: A/B Comparison Evaluation */}
                {msg.abComparison && msg.activeView === 'comparison' && (
                  <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-none space-y-3">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <div className="flex items-center gap-1.5 font-bold text-stone-800 text-xs sm:text-sm">
                        <BarChart2 className="w-4 h-4 text-emerald-800" />
                        <span>对照实验评测指标</span>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-full font-medium">
                        增强显著
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                        <div className="text-base font-bold text-emerald-800">
                          {msg.abComparison.comparisonMetrics.accuracyDiff}
                        </div>
                        <div className="text-[10px] text-stone-500 mt-0.5">回答准确性</div>
                      </div>
                      <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                        <div className="text-base font-bold text-emerald-800">
                          {msg.abComparison.comparisonMetrics.completenessDiff}
                        </div>
                        <div className="text-[10px] text-stone-500 mt-0.5">回答完整性</div>
                      </div>
                      <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                        <div className="text-base font-bold text-emerald-800">
                          {msg.abComparison.comparisonMetrics.understandabilityDiff}
                        </div>
                        <div className="text-[10px] text-stone-500 mt-0.5">可理解性</div>
                      </div>
                      <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                        <div className="text-base font-bold text-emerald-800">
                          {msg.abComparison.comparisonMetrics.knowledgeExpansionDiff}
                        </div>
                        <div className="text-[10px] text-stone-500 mt-0.5">知识拓展能力</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="bg-white rounded-2xl p-3.5 border border-emerald-100 shadow-none flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-800 text-white flex items-center justify-center animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                    <span>中医学习问题理解与增强引擎解析中...</span>
                    <RefreshCw className="w-3 h-3 text-emerald-700 animate-spin" />
                  </div>
                  <div className="text-[11px] text-stone-400">
                    正在按所选模式生成结构化提问与学伴解答
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Area: Output Mode Selector (Placed ABOVE the input box as requested!) + Chat Input Bar */}
          <div className="pt-2 space-y-1.5 border-t border-stone-200/60 bg-[#F7F9F8]">
            {/* 9 Output Modes Selector placed directly above input box */}
            <div className="bg-white/90 p-2.5 rounded-2xl border border-stone-200/80 shadow-none space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-stone-600 font-medium">
                <span className="flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3 text-emerald-800" />
                  <span>选择输出方式（支持多选）：</span>
                </span>
                <span className="text-[10px] text-stone-400">
                  已选 {selectedOutputs.length} 项
                </span>
              </div>

              {/* 9 Output Mode Chips (Clean, subtle light green theme) */}
              <div className="flex flex-wrap gap-1">
                {ALL_OUTPUT_MODES.map((mode) => {
                  const isSelected = selectedOutputs.includes(mode);
                  return (
                    <button
                      key={mode}
                      onClick={() => toggleOutputMode(mode)}
                      className={`px-2.5 py-1 rounded-lg text-xs transition-all flex items-center gap-1 ${
                        isSelected
                          ? 'bg-emerald-800 text-white font-medium shadow-none'
                          : 'bg-[#F2F5F3] text-stone-600 hover:bg-stone-200/70 border border-transparent'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 shrink-0" />}
                      <span className="whitespace-nowrap">{mode}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Bar */}
            <div className="bg-white rounded-2xl p-1.5 border border-stone-200 shadow-none flex items-center gap-2">
              <button
                onClick={() => alert('支持上传病案图片或舌象，引擎将自动提取并增强分析')}
                className="p-2 text-stone-400 hover:text-emerald-800 rounded-xl transition-colors shrink-0"
                title="上传图片"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="输入信息......（如：为什么阴虚会五心潮热？）"
                className="flex-1 text-xs sm:text-sm bg-transparent focus:outline-hidden text-stone-800 placeholder-stone-400 px-1"
                disabled={isLoading}
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isLoading}
                className={`p-2 rounded-xl transition-all shrink-0 ${
                  inputText.trim() && !isLoading
                    ? 'bg-emerald-800 text-white shadow-xs hover:bg-emerald-900'
                    : 'text-stone-300 cursor-not-allowed'
                }`}
                title="发送"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* SUB-VIEW 2: 学习规划 (Planning Mode) */
        <div className="flex-1 space-y-3.5 overflow-y-auto pr-1">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-none space-y-3.5">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-800" />
              <div>
                <h3 className="font-bold text-stone-800 text-sm sm:text-base">
                  智能学伴 · 个性化学习规划
                </h3>
                <p className="text-xs text-stone-500">
                  结合知识图谱与认知模型，生成适配当前学习阶段与薄弱点的进阶规划
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  🎯 你的当前学习目标：
                </label>
                <input
                  type="text"
                  value={planGoal}
                  onChange={(e) => setPlanGoal(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:outline-emerald-800"
                  placeholder="例如：准备《中医诊断学》期末复习八纲辨证与舌脉"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    ⏱️ 期望规划周期：
                  </label>
                  <select
                    value={planDays}
                    onChange={(e) => setPlanDays(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
                  >
                    <option value="3">3天 极速突击</option>
                    <option value="7">7天 阶梯周计划（推荐）</option>
                    <option value="14">14天 深度体系构建</option>
                    <option value="30">30天 跨学科融会贯通</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    🧠 认知模型适配：
                  </label>
                  <div className="px-3 py-2 bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-xl text-xs font-medium truncate">
                    大一 · 机制推演与对比分析型
                  </div>
                </div>
              </div>

              <button
                onClick={handleGeneratePlan}
                disabled={isLoading}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-medium rounded-xl text-xs sm:text-sm shadow-none transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>生成个性化学习推进路线</span>
              </button>
            </div>
          </div>

          {/* Generated Plan Output */}
          {generatedPlan && (
            <div className="space-y-3 animate-in fade-in">
              <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-none flex items-center justify-between">
                <div>
                  <div className="text-xs text-stone-500 font-medium">规划目标</div>
                  <div className="text-sm sm:text-base font-bold text-stone-800 mt-0.5">
                    {generatedPlan.target}
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full text-xs font-semibold">
                  {generatedPlan.duration}
                </span>
              </div>

              <div className="space-y-2.5">
                {generatedPlan.stages.map((stage: any, sIdx: number) => (
                  <div
                    key={sIdx}
                    className="p-3.5 bg-white rounded-xl border border-stone-200/90 shadow-none space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-stone-900 text-xs sm:text-sm">
                        {stage.day}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 bg-stone-100 text-stone-600 rounded-md">
                        {stage.focus}
                      </span>
                    </div>

                    <ul className="space-y-1 text-stone-600 list-disc pl-4 text-xs">
                      {stage.tasks.map((task: string, tIdx: number) => (
                        <li key={tIdx}>{task}</li>
                      ))}
                    </ul>

                    <div className="pt-2 border-t border-stone-100 text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                      <Layers className="w-3 h-3 text-emerald-700" />
                      <span>{stage.graphRelation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
