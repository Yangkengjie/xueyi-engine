import React, { useState } from 'react';
import {
  User,
  ChevronRight,
  Edit3,
  Calendar,
  Clock,
  Award,
  Layers,
  Sliders,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import { STUDENT_PROFILE_DATA } from '../data/tcmPresetData';
import { StudentProfile, LearnerReportData } from '../types';
import { LearnerRadarChart } from './LearnerRadarChart';
import { LearnerReportView } from './LearnerReportView';
import { LearnerAssessmentModal } from './LearnerAssessmentModal';
import { AssessmentHistoryModal } from './AssessmentHistoryModal';

interface ProfileTabProps {
  onOpenDocModal: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ onOpenDocModal }) => {
  const [profile, setProfile] = useState<StudentProfile>(STUDENT_PROFILE_DATA);
  const [currentView, setCurrentView] = useState<'profile_home' | 'report_view'>('profile_home');
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(profile.name);
  const [editUserId, setEditUserId] = useState(profile.userId);
  const [editMajor, setEditMajor] = useState(profile.major);
  const [editGrade, setEditGrade] = useState(profile.grade);

  // Handle assessment completion
  const handleAssessmentComplete = (newReport: LearnerReportData) => {
    setProfile((prev) => ({
      ...prev,
      currentReport: newReport,
      weakPoints: newReport.weaknesses,
      strengths: newReport.strengths,
      assessmentHistory: [newReport, ...prev.assessmentHistory],
    }));
    setIsAssessmentOpen(false);
    setCurrentView('report_view'); // Directly show the refreshed report view
  };

  const handleSaveProfile = () => {
    setProfile((prev) => ({
      ...prev,
      name: editName,
      userId: editUserId,
      major: editMajor,
      grade: editGrade,
    }));
    setIsEditProfileOpen(false);
  };

  // If in Detailed Report View (Matching Screenshot 2)
  if (currentView === 'report_view') {
    return (
      <>
        <LearnerReportView
          report={profile.currentReport}
          onBack={() => setCurrentView('profile_home')}
          onRetest={() => setIsAssessmentOpen(true)}
          onViewHistory={() => setIsHistoryOpen(true)}
        />

        {/* Retest Assessment Modal */}
        <LearnerAssessmentModal
          isOpen={isAssessmentOpen}
          onClose={() => setIsAssessmentOpen(false)}
          onComplete={handleAssessmentComplete}
        />

        {/* Assessment History Modal */}
        <AssessmentHistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          history={profile.assessmentHistory}
          onSelectReport={(selected) => {
            setProfile((prev) => ({ ...prev, currentReport: selected }));
          }}
          onStartRetest={() => {
            setIsHistoryOpen(false);
            setIsAssessmentOpen(true);
          }}
        />
      </>
    );
  }

  // Profile Main View (Matching Screenshot 1)
  return (
    <div className="space-y-4 pb-6 animate-in fade-in">
      {/* 1. Top User Profile Card (Matching Screenshot 1) */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-none flex flex-col items-center justify-center text-center">
        {/* Soft Light Green Avatar Circle */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 mb-2.5">
          <User className="w-8 h-8 stroke-[1.8]" />
        </div>

        {/* User Name & ID */}
        <h2 className="text-base font-bold text-stone-900">{profile.name}</h2>
        <p className="text-xs text-stone-400 mt-0.5">ID: {profile.userId}</p>

        {/* Edit Profile Capsule Button */}
        <button
          onClick={() => setIsEditProfileOpen(true)}
          className="mt-2.5 px-3 py-1 bg-stone-50 hover:bg-stone-100 border border-stone-200/90 rounded-full text-[11px] font-medium text-stone-600 flex items-center gap-1 transition-colors"
        >
          <Edit3 className="w-3 h-3" />
          <span>编辑资料</span>
        </button>
      </div>

      {/* 2. "我的学习者画像" Card with 4-Axis Radar & 3 Menu Links (Matching Screenshot 1) */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-none space-y-4">
        <h3 className="text-base font-bold text-stone-900">我的学习者画像</h3>

        {/* 4-Axis Radar Chart */}
        <div className="py-2 flex justify-center">
          <LearnerRadarChart scores={profile.currentReport.radarScores} size={230} />
        </div>

        {/* Menu Links with Dividers */}
        <div className="divide-y divide-stone-100 text-xs">
          {/* Option 1: 查看学习者画像报告 */}
          <button
            onClick={() => setCurrentView('report_view')}
            className="w-full py-3 flex items-center justify-between text-stone-800 hover:text-emerald-800 transition-colors group text-left"
          >
            <span className="font-medium">查看学习者画像报告</span>
            <div className="flex items-center gap-1 text-stone-400 group-hover:text-emerald-800">
              <span className="text-[11px]">查看详情</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          {/* Option 2: 查看画像测试历史 */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="w-full py-3 flex items-center justify-between text-stone-800 hover:text-emerald-800 transition-colors group text-left"
          >
            <span className="font-medium">查看画像测试历史</span>
            <div className="flex items-center gap-1 text-stone-400 group-hover:text-emerald-800">
              <span className="text-[11px]">查看</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          {/* Option 3: 重新测试 */}
          <button
            onClick={() => setIsAssessmentOpen(true)}
            className="w-full py-3 flex items-center justify-between text-stone-800 hover:text-emerald-800 transition-colors group text-left"
          >
            <span className="font-medium">重新测试</span>
            <div className="flex items-center gap-1 text-stone-400 group-hover:text-emerald-800">
              <span className="text-[11px] text-emerald-800 font-semibold">重测</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>

      {/* 3. "学习报告与成就" Card with 3 Light Green Tiles (Matching Screenshot 1) */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-none space-y-3">
        <h3 className="text-base font-bold text-stone-900">学习报告与成就</h3>

        {/* 3 Light Green Feature Tiles */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Tile 1: 学习打卡 */}
          <div className="bg-[#EDF5F0] rounded-2xl p-3 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 rounded-full bg-emerald-100/70 text-emerald-800 flex items-center justify-center mb-1.5">
              <Calendar className="w-4 h-4 stroke-[2]" />
            </div>
            <span className="text-[11px] font-medium text-stone-700">学习打卡</span>
            <span className="text-[10px] text-emerald-800 font-bold mt-0.5">连续 7 天</span>
          </div>

          {/* Tile 2: 学习时长 */}
          <div className="bg-[#EDF5F0] rounded-2xl p-3 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 rounded-full bg-emerald-100/70 text-emerald-800 flex items-center justify-center mb-1.5">
              <Clock className="w-4 h-4 stroke-[2]" />
            </div>
            <span className="text-[11px] font-medium text-stone-700">学习时长</span>
            <span className="text-[10px] text-emerald-800 font-bold mt-0.5">18.5 小时</span>
          </div>

          {/* Tile 3: 掌握知识点 */}
          <div className="bg-[#EDF5F0] rounded-2xl p-3 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 rounded-full bg-emerald-100/70 text-emerald-800 flex items-center justify-center mb-1.5">
              <Award className="w-4 h-4 stroke-[2]" />
            </div>
            <span className="text-[11px] font-medium text-stone-700">掌握知识点</span>
            <span className="text-[10px] text-emerald-800 font-bold mt-0.5">{profile.masteredKnowledgeCount} 个</span>
          </div>
        </div>
      </div>

      {/* 4. Engine Diagnostics & Positioning Link (Compact Footer) */}
      <div className="bg-white rounded-3xl p-4 border border-stone-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-800" />
          <span className="font-semibold text-stone-800">
            三大核心引擎与系统定位说明
          </span>
        </div>
        <button
          onClick={onOpenDocModal}
          className="text-xs text-emerald-800 font-bold hover:underline"
        >
          查看定位 ➔
        </button>
      </div>

      {/* Re-test Assessment Modal */}
      <LearnerAssessmentModal
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
        onComplete={handleAssessmentComplete}
      />

      {/* Assessment History Modal */}
      <AssessmentHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={profile.assessmentHistory}
        onSelectReport={(selected) => {
          setProfile((prev) => ({ ...prev, currentReport: selected }));
          setCurrentView('report_view');
        }}
        onStartRetest={() => {
          setIsHistoryOpen(false);
          setIsAssessmentOpen(true);
        }}
      />

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="font-bold text-stone-900 text-sm">编辑个人信息</h3>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-stone-600 block mb-1">昵称 / 姓名</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-emerald-800"
                />
              </div>

              <div>
                <label className="text-stone-600 block mb-1">学号 / ID</label>
                <input
                  type="text"
                  value={editUserId}
                  onChange={(e) => setEditUserId(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-emerald-800"
                />
              </div>

              <div>
                <label className="text-stone-600 block mb-1">主修专业</label>
                <input
                  type="text"
                  value={editMajor}
                  onChange={(e) => setEditMajor(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-emerald-800"
                />
              </div>

              <div>
                <label className="text-stone-600 block mb-1">年级阶段</label>
                <input
                  type="text"
                  value={editGrade}
                  onChange={(e) => setEditGrade(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-emerald-800"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="flex-1 py-2 rounded-xl bg-stone-100 text-stone-600 text-xs font-semibold"
              >
                取消
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-none"
              >
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
