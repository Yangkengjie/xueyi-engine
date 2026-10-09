import React from 'react';
import { Home, BookOpen, Send, User } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isFloating?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, isFloating = false }) => {
  const tabs = [
    { id: 'home' as TabType, label: '首页', icon: Home },
    { id: 'learning' as TabType, label: '学习', icon: BookOpen },
    { id: 'deduction' as TabType, label: '推演', icon: Send, badge: '引擎' },
    { id: 'profile' as TabType, label: '我的', icon: User },
  ];

  return (
    <nav
      className={`bg-white border-t border-stone-200 select-none ${
        isFloating
          ? 'w-full shadow-lg'
          : 'w-full'
      }`}
    >
      <div className="max-w-md mx-auto grid grid-cols-4 py-2 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 relative transition-colors ${
                isActive ? 'text-emerald-800 font-semibold' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-emerald-800' : ''}`} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-3 px-1 py-0.2 bg-emerald-700 text-[9px] text-white rounded-full leading-tight font-normal">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 ${isActive ? 'text-emerald-800 font-medium' : 'text-stone-500'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 bg-emerald-800 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
