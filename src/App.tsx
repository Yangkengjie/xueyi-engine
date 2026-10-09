import React, { useState } from 'react';
import { TabType } from './types';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomeTab } from './components/HomeTab';
import { DeductionTab } from './components/DeductionTab';
import { LearningTab } from './components/LearningTab';
import { ProfileTab } from './components/ProfileTab';
import { ProjectDocModal } from './components/ProjectDocModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>(undefined);

  const handleNavigateTab = (tab: TabType, prompt?: string) => {
    if (prompt) {
      setInitialPrompt(prompt);
    }
    setActiveTab(tab);
    // Smooth scroll up
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F5F7F6] text-stone-800 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Universal Navbar */}
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenDocModal={() => setIsDocModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {viewMode === 'mobile' ? (
          /* MOBILE VIEW CONTAINER (Replicating exact mobile frame from user screenshots) */
          <div className="flex-1 flex items-center justify-center p-2 sm:p-4 md:p-6">
            <div className="w-full max-w-[430px] bg-white rounded-[36px] shadow-2xl border-4 border-stone-800 overflow-hidden flex flex-col min-h-[780px] max-h-[92vh] relative">
              {/* iPhone Style Dynamic Island / Speaker notch */}
              <div className="bg-stone-900 h-5 w-full flex items-center justify-center shrink-0">
                <div className="w-20 h-3 bg-black rounded-full" />
              </div>

              {/* Scrollable Screen Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[#F7F9F8]">
                {activeTab === 'home' && (
                  <HomeTab
                    onNavigateTab={handleNavigateTab}
                    onOpenDocModal={() => setIsDocModalOpen(true)}
                  />
                )}
                {activeTab === 'deduction' && (
                  <DeductionTab
                    initialPrompt={initialPrompt}
                    onNavigateTab={handleNavigateTab}
                    onOpenDocModal={() => setIsDocModalOpen(true)}
                  />
                )}
                {activeTab === 'learning' && (
                  <LearningTab onNavigateTab={handleNavigateTab} />
                )}
                {activeTab === 'profile' && (
                  <ProfileTab onOpenDocModal={() => setIsDocModalOpen(true)} />
                )}
              </div>

              {/* Bottom Nav inside Phone frame matching screenshots */}
              <div className="shrink-0">
                <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
              </div>
            </div>
          </div>
        ) : (
          /* DESKTOP WORKSPACE VIEW (Wide responsive layout for multi-tasking) */
          <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col">
            {/* Desktop Tab Selector Header */}
            <div className="bg-white rounded-2xl p-2 border border-stone-200 shadow-xs mb-5 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'home'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  首页概览
                </button>
                <button
                  onClick={() => setActiveTab('deduction')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'deduction'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <span>推演 · 答疑与问题增强引擎</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-900 font-bold">
                    核心
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('learning')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'learning'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  知识体系建构与图谱
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'profile'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  认知画像与引擎设置
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500 pr-2">
                <span>当前定位：辅助中医学专业学生自主学习</span>
              </div>
            </div>

            {/* Desktop Tab Contents */}
            <div className="flex-1">
              {activeTab === 'home' && (
                <HomeTab
                  onNavigateTab={handleNavigateTab}
                  onOpenDocModal={() => setIsDocModalOpen(true)}
                />
              )}
              {activeTab === 'deduction' && (
                <DeductionTab
                  initialPrompt={initialPrompt}
                  onNavigateTab={handleNavigateTab}
                  onOpenDocModal={() => setIsDocModalOpen(true)}
                />
              )}
              {activeTab === 'learning' && (
                <LearningTab onNavigateTab={handleNavigateTab} />
              )}
              {activeTab === 'profile' && (
                <ProfileTab onOpenDocModal={() => setIsDocModalOpen(true)} />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Project Positioning and Engine Documentation Modal */}
      <ProjectDocModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
      />
    </div>
  );
}
