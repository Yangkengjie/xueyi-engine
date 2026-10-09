import React from 'react';
import { Sparkles, Smartphone, Monitor, BookOpen, Brain, Info, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  viewMode: 'mobile' | 'desktop';
  setViewMode: (mode: 'mobile' | 'desktop') => void;
  onOpenDocModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ viewMode, setViewMode, onOpenDocModal }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between">
        {/* Brand & Project Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs font-bold text-lg">
            医
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900 text-base sm:text-lg tracking-tight">
                学医智用
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                中医学习问题理解与增强引擎
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              从千人一面到因你而变 · 智能学伴自主学习辅助系统
            </p>
          </div>
        </div>

        {/* Actions & Device View Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Doc & Spec button */}
          <button
            onClick={onOpenDocModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-colors"
            title="查看项目定位与引擎说明"
          >
            <Info className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden md:inline">项目定位与引擎说明</span>
            <span className="md:hidden">说明</span>
          </button>

          {/* Device switch */}
          <div className="bg-stone-100 p-0.5 rounded-lg flex items-center border border-stone-200">
            <button
              onClick={() => setViewMode('mobile')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === 'mobile'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="切换为移动端原型视图"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">手机视图</span>
            </button>
            <button
              onClick={() => setViewMode('desktop')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === 'desktop'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="切换为宽屏工作台视图"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">宽屏视图</span>
            </button>
          </div>

          {/* Engine Status */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>智能学伴已就绪</span>
          </div>
        </div>
      </div>
    </header>
  );
};
