import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  ArrowUp,
  ArrowDown,
  Sparkles,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import {
  ASSESSMENT_QUESTIONS,
  evaluateAssessmentAnswers,
} from '../data/assessmentQuestions';
import { LearnerReportData } from '../types';

interface LearnerAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (newReport: LearnerReportData) => void;
}

export const LearnerAssessmentModal: React.FC<LearnerAssessmentModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [customMajor, setCustomMajor] = useState('');

  // Answers map: { [qId]: optionId | optionId[] }
  const [answers, setAnswers] = useState<Record<number, any>>({
    1: 'A',
    2: 'A',
    3: ['A', 'D'],
    4: 'A',
    5: 'B',
    6: 'A',
    7: 'B',
    8: ['opt5', 'opt3', 'opt1', 'opt2', 'opt4'], // 默认排序
    9: ['A', 'C', 'D'],
    10: ['pain3', 'pain2', 'pain1', 'pain4'], // 默认排序
    11: ['B', 'E'],
  });

  if (!isOpen) return null;

  const currentQ = ASSESSMENT_QUESTIONS[currentIdx];
  const progressPercent = Math.round(((currentIdx + 1) / ASSESSMENT_QUESTIONS.length) * 100);

  const handleSingleSelect = (optId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optId,
    }));
  };

  const handleMultipleSelect = (optId: string) => {
    const currentList: string[] = answers[currentQ.id] || [];
    const max = currentQ.maxSelect || 99;

    if (currentList.includes(optId)) {
      setAnswers((prev) => ({
        ...prev,
        [currentQ.id]: currentList.filter((id) => id !== optId),
      }));
    } else {
      if (currentList.length >= max) {
        // Replace oldest or prevent
        const updated = [...currentList.slice(1), optId];
        setAnswers((prev) => ({
          ...prev,
          [currentQ.id]: updated,
        }));
      } else {
        setAnswers((prev) => ({
          ...prev,
          [currentQ.id]: [...currentList, optId],
        }));
      }
    }
  };

  // Move item up/down in ranking questions
  const handleRankingMove = (index: number, direction: 'up' | 'down') => {
    const currentList: string[] = answers[currentQ.id] || currentQ.options.map((o) => o.id);
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= currentList.length) return;

    const newList = [...currentList];
    const temp = newList[index];
    newList[index] = newList[targetIdx];
    newList[targetIdx] = temp;

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: newList,
    }));
  };

  const isCurrentAnswered = () => {
    const ans = answers[currentQ.id];
    if (currentQ.type === 'single') return !!ans;
    if (currentQ.type === 'multiple') return Array.isArray(ans) && ans.length > 0;
    if (currentQ.type === 'ranking') return Array.isArray(ans) && ans.length > 0;
    return true;
  };

  const handleNext = () => {
    if (currentIdx < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = () => {
    const report = evaluateAssessmentAnswers(answers);
    onComplete(report);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-[#F8FAF9]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-sm sm:text-base">
                动态学习者画像测评
              </h2>
              <span className="text-[11px] text-emerald-800 font-medium">
                修订版 V2.0 · 个性化自适应建模
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

        {/* Progress Bar & Section Tag */}
        <div className="px-5 pt-3 pb-2 bg-white">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            <span className="font-medium text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md">
              {currentQ.part}
            </span>
            <span className="font-semibold text-stone-700">
              第 {currentIdx + 1} / {ASSESSMENT_QUESTIONS.length} 题 ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-800 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question Body */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-stone-900 leading-snug">
              {currentQ.title}
            </h3>
            {currentQ.instruction && (
              <p className="text-xs text-stone-400 mt-1">{currentQ.instruction}</p>
            )}
          </div>

          {/* Options Display */}
          {currentQ.type === 'single' && (
            <div className="space-y-2">
              {currentQ.options.map((opt) => {
                const isSelected = answers[currentQ.id] === opt.id;
                return (
                  <div key={opt.id}>
                    <button
                      onClick={() => handleSingleSelect(opt.id)}
                      className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2.5 ${
                        isSelected
                          ? 'border-emerald-800 bg-emerald-50/50 text-emerald-950 shadow-xs'
                          : 'border-stone-200/80 bg-white hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isSelected
                              ? 'bg-emerald-800 text-white'
                              : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          {opt.id}
                        </span>
                        <span className="text-xs sm:text-sm font-medium">{opt.text}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-800 shrink-0" />}
                    </button>

                    {/* Custom Input for Q1 Non-TCM */}
                    {opt.id === 'G' && isSelected && currentQ.allowCustomInput && (
                      <div className="mt-2 pl-9 pr-1">
                        <input
                          type="text"
                          placeholder="请输入您的专业名称（如：临床医学、生物医药等）"
                          value={customMajor}
                          onChange={(e) => setCustomMajor(e.target.value)}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-emerald-800"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {currentQ.type === 'multiple' && (
            <div className="space-y-2">
              {currentQ.options.map((opt) => {
                const selectedList: string[] = answers[currentQ.id] || [];
                const isSelected = selectedList.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleMultipleSelect(opt.id)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? 'border-emerald-800 bg-emerald-50/50 text-emerald-950 shadow-xs'
                        : 'border-stone-200/80 bg-white hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          isSelected
                            ? 'bg-emerald-800 text-white'
                            : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {opt.id}
                      </span>
                      <span className="text-xs sm:text-sm font-medium">{opt.text}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-800 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {currentQ.type === 'ranking' && (
            <div className="space-y-2">
              <div className="text-[11px] text-stone-500 bg-stone-50 p-2 rounded-xl border border-stone-150 flex items-center gap-1.5">
                <span>💡</span>
                <span>请使用右侧上下箭头调整优先级顺序（排在越上方权重越高）：</span>
              </div>
              {(
                (answers[currentQ.id] as string[]) ||
                currentQ.options.map((o) => o.id)
              ).map((optId, idx) => {
                const opt = currentQ.options.find((o) => o.id === optId);
                if (!opt) return null;
                const isFirst = idx === 0;
                const isLast =
                  idx ===
                  ((answers[currentQ.id] as string[]) || currentQ.options).length - 1;

                return (
                  <div
                    key={optId}
                    className="p-3 bg-white rounded-2xl border border-stone-200/90 flex items-center justify-between gap-2 shadow-2xs hover:border-emerald-200 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs sm:text-sm text-stone-800 font-medium">
                        {opt.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleRankingMove(idx, 'up')}
                        disabled={isFirst}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isFirst
                            ? 'text-stone-300 border-stone-100 cursor-not-allowed'
                            : 'text-stone-600 border-stone-200 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200'
                        }`}
                        title="向上移动"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRankingMove(idx, 'down')}
                        disabled={isLast}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isLast
                            ? 'text-stone-300 border-stone-100 cursor-not-allowed'
                            : 'text-stone-600 border-stone-200 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200'
                        }`}
                        title="向下移动"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3.5 border-t border-stone-100 bg-[#F8FAF9] flex items-center justify-between gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1 border ${
              currentIdx === 0
                ? 'text-stone-300 border-stone-200 bg-stone-50 cursor-not-allowed'
                : 'text-stone-700 border-stone-200 bg-white hover:bg-stone-50'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>上一题</span>
          </button>

          <button
            onClick={handleNext}
            disabled={!isCurrentAnswered()}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1 text-white shadow-xs transition-all ${
              isCurrentAnswered()
                ? 'bg-emerald-800 hover:bg-emerald-900'
                : 'bg-stone-300 cursor-not-allowed'
            }`}
          >
            <span>{currentIdx === ASSESSMENT_QUESTIONS.length - 1 ? '完成并生成画像' : '下一题'}</span>
            {currentIdx === ASSESSMENT_QUESTIONS.length - 1 ? (
              <Check className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
