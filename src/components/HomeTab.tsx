import React, { useState } from 'react';
import {
  Search,
  MessageSquare,
  RotateCw,
  Clock,
  Plus,
  ArrowRight,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Circle,
  HelpCircle,
  TrendingUp,
  Brain,
  Layers,
} from 'lucide-react';
import { TaskItem, CourseProgress, TabType } from '../types';
import { INITIAL_TASKS, INITIAL_COURSES } from '../data/tcmPresetData';

interface HomeTabProps {
  onNavigateTab: (tab: TabType, promptPreset?: string) => void;
  onOpenDocModal: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({ onNavigateTab, onOpenDocModal }) => {
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [courses] = useState<CourseProgress[]>(INITIAL_COURSES);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCourse, setNewTaskCourse] = useState('中医基础理论');

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: TaskItem = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      course: newTaskCourse,
      completed: false,
      category: '自定义',
    };
    setTasks((prev) => [...prev, newTask]);
    setNewTaskTitle('');
    setShowAddTask(false);
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-4 pb-6">
      {/* Header Banner matching Image 2 */}
      <div className="pt-2 pb-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          学医智用
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 font-normal">
          用AI重新定义中医学习——从千人一面到因你而变
        </p>
      </div>

      {/* 2 Quick Action Cards matching Image 2 */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: 知识速查 */}
        <button
          onClick={() => onNavigateTab('learning')}
          className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all text-left group"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Search className="w-5 h-5" />
          </div>
          <div className="font-bold text-stone-800 text-base">知识速查</div>
          <div className="text-[10px] tracking-wider text-stone-400 font-semibold uppercase mt-0.5">
            QUICK SEARCH
          </div>
        </button>

        {/* Card 2: AI 答疑 */}
        <button
          onClick={() => onNavigateTab('deduction')}
          className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all text-left group"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="font-bold text-stone-800 text-base">AI 答疑</div>
          <div className="text-[10px] tracking-wider text-stone-400 font-semibold uppercase mt-0.5">
            SMART QA
          </div>
        </button>
      </div>

      {/* Engine Core Highlight / Quick Prompt Try Card */}
      <div className="bg-linear-to-br from-emerald-800 to-emerald-950 text-white rounded-2xl p-4 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1 rounded-md bg-white/20 text-emerald-200">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
            核心引擎已驱动
          </span>
        </div>
        <h3 className="text-base font-bold mb-1">
          中医学习问题理解与增强引擎
        </h3>
        <p className="text-xs text-emerald-100/80 leading-relaxed mb-3">
          让不会问 AI 的同学，也能问出高质量问题。把模糊困惑转化为结构化中医学科问题。
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onNavigateTab('deduction', '为什么阴虚会五心潮热？')}
            className="text-xs bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-full text-emerald-50 border border-white/20 transition-colors flex items-center gap-1"
          >
            <span>试一试：为什么阴虚会五心潮热？</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 今日学习 Card matching Image 2 */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-stone-800">今日学习</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
              {completedCount}/{tasks.length} 完成
            </span>
          </div>
          <button
            onClick={() => {
              setTasks(INITIAL_TASKS.map((t) => ({ ...t, completed: false })));
            }}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-md transition-colors"
            title="重置今日任务"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Task Items */}
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="flex items-center justify-between py-1.5 cursor-pointer group hover:bg-stone-50/80 px-1 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                {task.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-stone-300 group-hover:text-emerald-600 shrink-0 transition-colors" />
                )}
                <span
                  className={`text-xs sm:text-sm font-medium transition-colors truncate ${
                    task.completed
                      ? 'text-stone-400 line-through'
                      : 'text-stone-700 group-hover:text-stone-900'
                  }`}
                >
                  {task.title}
                </span>
              </div>
              <span className="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                {task.course}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom Task Toolbar matching Image 2 icons */}
        <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-stone-100 text-stone-400">
          <button
            onClick={() => onNavigateTab('learning')}
            className="hover:text-emerald-800 p-1 transition-colors flex items-center gap-1 text-xs"
            title="学习历史"
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">学习历史</span>
          </button>
          <button
            onClick={() => setShowAddTask(true)}
            className="hover:text-emerald-800 p-1 transition-colors flex items-center gap-1 text-xs"
            title="添加任务"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">添加任务</span>
          </button>
        </div>

        {/* Add Task Simple Inline Modal */}
        {showAddTask && (
          <form onSubmit={handleAddTask} className="mt-3 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
            <div className="font-semibold text-stone-700 mb-2">添加自主学习任务</div>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="输入任务内容（如：背诵六味地黄丸歌诀）"
              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-stone-300 focus:outline-emerald-700 text-xs mb-2"
              autoFocus
            />
            <div className="flex justify-between items-center">
              <select
                value={newTaskCourse}
                onChange={(e) => setNewTaskCourse(e.target.value)}
                className="px-2 py-1 bg-white rounded border border-stone-300 text-[11px]"
              >
                <option value="中基">中医基础理论</option>
                <option value="中诊">中医诊断学</option>
                <option value="中药学">中药学</option>
                <option value="方剂学">方剂学</option>
                <option value="伤寒论">伤寒论</option>
                <option value="自定义">自定义</option>
              </select>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="px-2 py-1 rounded text-stone-500 hover:text-stone-700"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-emerald-800 text-white font-medium hover:bg-emerald-900"
                >
                  添加
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* 继续学习 Card matching Image 2 */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-3.5">
          <BookOpen className="w-4 h-4 text-emerald-800" />
          <h2 className="text-base font-bold text-stone-800">继续学习</h2>
        </div>

        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => onNavigateTab('learning')}
              className="group cursor-pointer p-2.5 rounded-xl hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-200"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs sm:text-sm font-bold text-stone-800 group-hover:text-emerald-800 transition-colors">
                  {course.title}
                </h3>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="text-[11px] text-stone-500 mb-2">
                {course.chapter}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-700 rounded-full transition-all duration-500"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-stone-600 w-8 text-right">
                  {course.progress}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3 Core Engines Collaboration Section */}
      <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/60">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
            <Brain className="w-4 h-4 text-emerald-800" />
            <span>三大核心引擎协同矩阵</span>
          </div>
          <button
            onClick={onOpenDocModal}
            className="text-[11px] text-emerald-800 hover:underline font-medium"
          >
            架构详情
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-xs">
          <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
            <div className="font-semibold text-emerald-900 mb-0.5">1. 知识理解</div>
            <div className="text-[11px] text-stone-600">跨课程关系强度知识图谱，量化关联与弱关联推荐</div>
          </div>
          <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
            <div className="font-semibold text-emerald-900 mb-0.5">2. 问题理解</div>
            <div className="text-[11px] text-stone-600">中医学习问题理解与增强引擎，模糊问题结构化拆解</div>
          </div>
          <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
            <div className="font-semibold text-emerald-900 mb-0.5">3. 用户理解</div>
            <div className="text-[11px] text-stone-600">个性化认知模型引擎，因人施教调整解释风格与规划</div>
          </div>
        </div>
      </div>
    </div>
  );
};
