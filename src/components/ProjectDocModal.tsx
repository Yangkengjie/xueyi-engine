import React from 'react';
import { X, Sparkles, BookOpen, Brain, Layers, CheckCircle2, Award, Users, Target } from 'lucide-react';

interface ProjectDocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectDocModal: React.FC<ProjectDocModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-emerald-900 text-white rounded-t-3xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight">
                学医智用 · 项目定位与引擎说明
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-700 text-emerald-100">
                1.0 落地设计
              </span>
            </div>
            <p className="text-xs text-emerald-200 mt-0.5">
              从千人一面到因你而变 —— 让不会问 AI 的同学，也能问出高质量问题
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-stone-700 leading-relaxed">
          {/* Important Notice */}
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
            <div className="font-bold text-amber-950 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-amber-700" />
              <span>核心定位注意事项（来自项目立项文档）：</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-amber-900 text-xs">
              <li><strong>AI定位：</strong> AI 不是导师，而是<strong>智能学伴</strong>（辅助学生自主学习，不以居高临下态度说教）。</li>
              <li><strong>引擎更名：</strong> 原名“Prompt增强引擎”，现正式更名为<strong>“中医学习问题理解与增强引擎”</strong>，解决“学生的问题如何被理解和增强”。</li>
              <li><strong>产品形态：</strong> 1.0 Web应用，四大板块：首页、学习、推演、我的。</li>
            </ul>
          </div>

          {/* Section 1: 引擎是什么 */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-800" />
              <span>一、中医学习问题理解与增强引擎的核心价值</span>
            </h4>
            <p className="text-stone-600 text-xs">
              对于很多大一、大二的中医初学者来说，真正的困难不只是“不知道答案”，而是<strong>“不知道该怎么问”</strong>。
              例如他们只会问：“为什么阴虚会五心潮热？”
              背后隐藏着对阴虚虚热关系、表现机制、鉴别诊断等深层需求。
              引擎通过提取【背景 Background、主题 Topic、意图 Intent、输出 Output】，将模糊问题转化为 AI 能精准回答、学生也能看懂结构的提问，实现<strong>提问能力训练与思维建构</strong>。
            </p>
          </div>

          {/* Section 2: 三大核心引擎 */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-800" />
              <span>二、三大核心技术引擎协同</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="font-bold text-emerald-900 mb-1">1. 知识图谱引擎</div>
                <p className="text-stone-600 text-[11px]">
                  跨课程关系强度量化（0.0~1.0），挖掘中基、中诊、中药、方剂的潜在弱关联，提供专业知识依据。
                </p>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="font-bold text-emerald-900 mb-1">2. 问题理解增强引擎</div>
                <p className="text-stone-600 text-[11px]">
                  识别问题类型与学习意图，分层定制通俗解释、病案、对比与古籍，提高大模型精准度。
                </p>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="font-bold text-emerald-900 mb-1">3. 个性化认知模型</div>
                <p className="text-stone-600 text-[11px]">
                  基于学习行为刻画学生认知习惯与薄弱点，实现答疑方式与规划进度的因人施策。
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: 用户调研数据 */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-800" />
              <span>三、真实用户调研与数据支撑</span>
            </h4>
            <p className="text-stone-600 text-xs">
              覆盖成都、北京、上海、广州、南京等5所主要中医药高校，<strong>738份问卷 + 18名学生深度访谈</strong>：
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200 text-emerald-950 font-medium">
                大一痛点：90.8% 反映“知识点太多记不住”，无法判断重点
              </div>
              <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200 text-emerald-950 font-medium">
                大二痛点：73.3% 反映“不会实际应用与辨证”，缺整体框架
              </div>
            </div>
          </div>

          {/* Section 4: 1.0 落地功能清单 */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1">
            <div className="font-bold text-stone-800">1.0 落地核心能力：</div>
            <p className="text-stone-600">
              ① 问题类型模板（概念/机制/对比/病证/方药） ② 结构化Prompt模板库 ③ 课程知识点映射 ④ 通俗解释/临床案例/对比/相关知识点 ⑤ 用户确认与修改机制 ⑥ A/B 对照实验评测。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 rounded-b-3xl flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            开始体验 Demo
          </button>
        </div>
      </div>
    </div>
  );
};
