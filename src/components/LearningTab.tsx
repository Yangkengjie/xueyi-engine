import React, { useState } from 'react';
import {
  Network,
  GitBranch,
  Search,
  BookOpen,
  Filter,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  CheckCircle2,
  Clock,
  HelpCircle,
  ArrowRight,
  Bookmark,
  Share2,
  Brain,
  Sliders,
} from 'lucide-react';
import {
  KNOWLEDGE_GRAPH_NODES,
  MINDMAP_DATA,
} from '../data/tcmPresetData';
import { TabType } from '../types';

interface LearningTabProps {
  onNavigateTab: (tab: TabType, prompt?: string) => void;
}

export const LearningTab: React.FC<LearningTabProps> = ({ onNavigateTab }) => {
  const [viewType, setViewType] = useState<'graph' | 'mindmap'>('graph');
  const [activeCourse, setActiveCourse] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<any>(KNOWLEDGE_GRAPH_NODES[0]);

  // Exam / Keyword memory mode (Project spec highlight!)
  const [isExamMode, setIsExamMode] = useState(false);
  const [revealedNodes, setRevealedNodes] = useState<Record<string, boolean>>({});

  const courses = ['全部', '中医基础理论', '中医诊断学', '中药学', '方剂学', '温病学'];

  const filteredGraphNodes = KNOWLEDGE_GRAPH_NODES.filter((node) => {
    const matchCourse = activeCourse === '全部' || node.course === activeCourse;
    const matchSearch =
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCourse && matchSearch;
  });

  const toggleReveal = (id: string) => {
    setRevealedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            知识体系建构
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            跨课程关系强度知识图谱 · 弱关联推荐与关键词记忆
          </p>
        </div>

        {/* View mode toggle & Exam mode switch */}
        <div className="flex items-center gap-2">
          {/* Exam Mode Toggle */}
          <button
            onClick={() => setIsExamMode(!isExamMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isExamMode
                ? 'bg-amber-100 border-amber-300 text-amber-950 shadow-xs'
                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {isExamMode ? <EyeOff className="w-3.5 h-3.5 text-amber-700" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isExamMode ? '关键词记忆模式 (已开启)' : '备考自测模式'}</span>
          </button>

          {/* Graph vs Mindmap Switcher */}
          <div className="bg-stone-100 p-0.5 rounded-xl flex items-center border border-stone-200">
            <button
              onClick={() => setViewType('graph')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                viewType === 'graph'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>知识图谱</span>
            </button>
            <button
              onClick={() => setViewType('mindmap')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                viewType === 'mindmap'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>思维导图</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Course Filter Pills */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索知识点、病机、方药（如：阴虚潮热、半夏厚朴汤）..."
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-emerald-800 shadow-xs"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {courses.map((course) => (
            <button
              key={course}
              onClick={() => setActiveCourse(course)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-all text-xs font-medium ${
                activeCourse === course
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {course}
            </button>
          ))}
        </div>
      </div>

      {/* Exam Mode Banner notification */}
      {isExamMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-950 flex items-start gap-2">
          <Brain className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">关键词记忆模式：</span>
            <span>
              已将大纲核心关键词保留，其余详细内容已被遮罩。请尝试根据关键词主动回忆背诵病机与方义，点击方框即可翻开答案自测！
            </span>
          </div>
        </div>
      )}

      {/* Main View Area: 1. Graph View */}
      {viewType === 'graph' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left / Center: Interactive Graph Node Cards */}
          <div className="lg:col-span-2 space-y-3">
            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-emerald-800" />
                  <span className="font-bold text-stone-800 text-sm">
                    跨课程关系强度网络可视化
                  </span>
                </div>
                <span className="text-[11px] text-stone-400">
                  点击节点查看跨课程关系矩阵
                </span>
              </div>

              {/* Node Chips grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredGraphNodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id;
                  const isRevealed = revealedNodes[node.id];

                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-left relative ${
                        isSelected
                          ? 'bg-emerald-50/70 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20'
                          : 'bg-stone-50/70 border-stone-200 hover:border-emerald-300 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-stone-900 text-xs sm:text-sm">
                          {node.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-emerald-100 text-emerald-900">
                          {node.course}
                        </span>
                      </div>

                      {/* Content (Masked in Exam Mode) */}
                      {isExamMode ? (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleReveal(node.id);
                          }}
                          className="mt-2 p-2 bg-white rounded-lg border border-dashed border-amber-300 text-[11px] text-stone-700 cursor-pointer hover:bg-amber-50/50 transition-colors"
                        >
                          {isRevealed ? (
                            <div>{node.description}</div>
                          ) : (
                            <div className="text-amber-800/80 font-medium flex items-center justify-between">
                              <span>【关键词】：{node.name} · {node.category}</span>
                              <span className="text-[10px] text-amber-600 underline">点击揭晓</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed mt-1">
                          {node.description}
                        </p>
                      )}

                      {/* Relations count badge */}
                      <div className="mt-2.5 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[10px] text-stone-500">
                        <span>关联节点: {node.relations.length}个</span>
                        <span className="text-emerald-800 font-semibold group-hover:underline">
                          查看强度 ➔
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Selected Node Detail & Cross-Course Relation Strength Matrix */}
          <div className="space-y-3">
            {selectedNode ? (
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200 shadow-xs space-y-3 sticky top-20">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                      {selectedNode.course} · {selectedNode.category}
                    </span>
                    <h3 className="text-base font-bold text-stone-900 mt-1">
                      {selectedNode.name}
                    </h3>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-stone-700 mb-1">
                    📖 核心概念与病机解析：
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    {selectedNode.description}
                  </p>
                </div>

                {/* Relation Strength Matrix (Core Innovation Highlight!) */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-emerald-700" />
                      <span>跨课程关系强度矩阵：</span>
                    </span>
                    <span className="text-[10px] text-stone-400 font-normal">
                      量化关系强度
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedNode.relations.map((rel: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/80 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-800">
                            {rel.targetName}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                              rel.strength >= 0.9
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                : rel.strength >= 0.75
                                ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                : 'bg-amber-100 text-amber-900 border border-amber-200'
                            }`}
                          >
                            强度 {(rel.strength * 100).toFixed(0)}%
                          </span>
                        </div>

                        {/* Strength progress indicator */}
                        <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              rel.strength >= 0.9
                                ? 'bg-emerald-700'
                                : rel.strength >= 0.75
                                ? 'bg-blue-600'
                                : 'bg-amber-600'
                            }`}
                            style={{ width: `${rel.strength * 100}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-stone-500">
                          <span>跨课: {rel.course}</span>
                          <span className="text-stone-700 font-medium">{rel.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct question enhancement trigger */}
                <button
                  onClick={() =>
                    onNavigateTab(
                      'deduction',
                      `请详细解析【${selectedNode.name}】在《${selectedNode.course}》中的核心病机与跨课程关联方药`
                    )
                  }
                  className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs mt-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>使用问题增强引擎提问此知识点</span>
                </button>
              </div>
            ) : (
              <div className="p-8 text-center text-stone-400 bg-white rounded-2xl border border-stone-200 text-xs">
                请在左侧选择一个知识点
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 2. Mindmap View */
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-emerald-800" />
              <span className="font-bold text-stone-800 text-sm">
                思维导图渐进展开模式
              </span>
            </div>
            <span className="text-xs text-stone-500">支持加粗关键词记忆</span>
          </div>

          <div className="space-y-4">
            {MINDMAP_DATA.map((node) => (
              <div
                key={node.id}
                className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-700" />
                    <span>{node.label}</span>
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-medium">
                    {node.course}
                  </span>
                </div>

                {/* Text content with keyword highlighting */}
                <p className="text-xs text-stone-700 leading-relaxed pl-4 border-l-2 border-emerald-600/30">
                  {isExamMode ? node.maskedText : node.fullText}
                </p>

                {/* Sub nodes / Children */}
                {node.children && (
                  <div className="pl-4 space-y-2 pt-1 border-t border-stone-200/60">
                    {node.children.map((child) => (
                      <div
                        key={child.id}
                        className="p-2.5 bg-white rounded-lg border border-stone-200 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-semibold text-stone-800">
                          <span>{child.label}</span>
                          <button
                            onClick={() =>
                              onNavigateTab('deduction', `请详细解释【${child.label}】`)
                            }
                            className="text-[10px] text-emerald-800 hover:underline"
                          >
                            AI答疑 ➔
                          </button>
                        </div>
                        <p className="text-[11px] text-stone-600">
                          {isExamMode ? child.maskedText : child.fullText}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
