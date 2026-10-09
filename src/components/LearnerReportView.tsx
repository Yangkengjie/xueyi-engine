import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { LearnerReportData } from '../types';
import { LearnerRadarChart } from './LearnerRadarChart';

interface LearnerReportViewProps {
  report: LearnerReportData;
  onBack: () => void;
  onRetest: () => void;
  onViewHistory: () => void;
}

export const LearnerReportView: React.FC<LearnerReportViewProps> = ({
  report,
  onBack,
  onRetest,
  onViewHistory,
}) => {
  return (
    <div className="space-y-3 animate-in fade-in">
      {/* Top Header Bar matching Screenshot 2 */}
      <div className="flex items-center justify-between py-1 relative">
        <button
          onClick={onBack}
          className="p-1 -ml-1 text-stone-700 hover:text-stone-950 rounded-lg transition-colors flex items-center gap-0.5"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>
        <h1 className="text-base font-bold text-stone-900 absolute left-1/2 -translate-x-1/2">
          学习者画像
        </h1>
        <div className="w-6" /> {/* Placeholder for alignment */}
      </div>

      {/* Main Report Card matching Screenshot 2 */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-none space-y-4">
        <h2 className="text-base font-bold text-stone-900">我的学习者画像</h2>

        {/* 4-Axis Radar Chart */}
        <div className="py-2 flex justify-center">
          <LearnerRadarChart scores={report.radarScores} size={230} />
        </div>

        {/* Current Archetype & Interpretation */}
        <div className="space-y-1 pt-1">
          <div className="text-sm font-bold text-stone-900">
            当前类型：{report.primaryRole}
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            {report.description}
          </p>
        </div>

        {/* Strengths (优势能力) */}
        <div className="space-y-1.5 pt-1">
          <div className="text-xs font-bold text-stone-900">优势能力</div>
          <div className="flex flex-wrap gap-1.5">
            {report.strengths.map((item, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-full text-xs font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Areas for Improvement (待提升项) */}
        <div className="space-y-1.5 pt-1">
          <div className="text-xs font-bold text-stone-900">待提升项</div>
          <div className="flex flex-wrap gap-1.5">
            {report.weaknesses.map((item, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200/80 rounded-full text-xs font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* AI Learning Suggestions (AI 学习建议) */}
        <div className="space-y-1.5 pt-1">
          <div className="text-xs font-bold text-stone-900">AI 学习建议</div>
          <ol className="space-y-1 text-xs text-stone-600 pl-0">
            {report.aiSuggestions.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1">
                <span className="shrink-0">{idx + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Bottom Action Buttons matching Screenshot 2 */}
        <div className="grid grid-cols-2 gap-3 pt-3">
          <button
            onClick={onRetest}
            className="py-3 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-semibold transition-all shadow-none text-center"
          >
            重新测试
          </button>
          <button
            onClick={onViewHistory}
            className="py-3 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs sm:text-sm font-semibold transition-all shadow-none text-center"
          >
            测试历史
          </button>
        </div>
      </div>
    </div>
  );
};
