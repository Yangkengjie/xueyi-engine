import React from 'react';
import { X, Calendar, Award, RotateCcw } from 'lucide-react';
import { LearnerReportData } from '../types';
import { LearnerRadarChart } from './LearnerRadarChart';

interface AssessmentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: LearnerReportData[];
  onSelectReport: (report: LearnerReportData) => void;
  onStartRetest: () => void;
}

export const AssessmentHistoryModal: React.FC<AssessmentHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectReport,
  onStartRetest,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 flex flex-col max-h-[88vh] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-[#F8FAF9]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-sm sm:text-base">
                画像测评历史记录
              </h2>
              <span className="text-[11px] text-stone-500">
                记录你的中医认知风格演化轨迹
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => {
                onSelectReport(item);
                onClose();
              }}
              className="p-4 bg-stone-50/70 hover:bg-emerald-50/40 rounded-2xl border border-stone-200 hover:border-emerald-200 cursor-pointer transition-all flex items-center gap-3 group"
            >
              <div className="w-16 h-16 shrink-0 bg-white rounded-xl border border-stone-200/80 p-1 flex items-center justify-center">
                <LearnerRadarChart scores={item.radarScores} size={58} showLabels={false} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-stone-900 text-xs sm:text-sm group-hover:text-emerald-900">
                      {item.primaryRole}
                    </span>
                    {idx === 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-900 font-bold">
                        当前
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-stone-400">{item.testDate}</span>
                </div>

                <div className="text-[11px] text-stone-500 line-clamp-1">
                  {item.description}
                </div>

                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-stone-400">
                  <span>记忆 {item.radarScores.memory}</span>
                  <span>·</span>
                  <span>理解 {item.radarScores.comprehension}</span>
                  <span>·</span>
                  <span>应用 {item.radarScores.application}</span>
                  <span>·</span>
                  <span>分析 {item.radarScores.analysis}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-[#F8FAF9] flex items-center justify-between">
          <span className="text-xs text-stone-400">
            共 {history.length} 次测评档案
          </span>
          <button
            onClick={() => {
              onClose();
              onStartRetest();
            }}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-none transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>发起新测评</span>
          </button>
        </div>
      </div>
    </div>
  );
};
