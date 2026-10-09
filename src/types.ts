export type TabType = 'home' | 'learning' | 'deduction' | 'profile';

export type OutputModeType =
  | '直接精准模式'
  | '引导式对话模式'
  | '临床案例模式'
  | '图像解说模式'
  | '通俗类比模式'
  | '古籍溯源模式'
  | '医家各说模式'
  | '现代研究模式'
  | '关联方药模式';

export interface TaskItem {
  id: string;
  title: string;
  course: string;
  completed: boolean;
  category: '背诵' | '练习' | '预习' | '复习' | '自定义';
}

export interface CourseProgress {
  id: string;
  title: string;
  chapter: string;
  progress: number;
  tags: string[];
}

export interface RelatedKnowledgeNode {
  name: string;
  course: '中医基础理论' | '中医诊断学' | '中药学' | '方剂学' | '温病学' | '黄帝内经' | '伤寒论' | string;
  strength: number; // 0.0 to 1.0 (relation strength)
  relationType: string;
  reason: string;
}

export interface QuestionAnalysis {
  background: string;
  topic: string;
  intent: string;
  course: string;
  outputModes: string[];
  structuredPrompt: string[];
}

export interface AnswerSection {
  mode: OutputModeType;
  title: string;
  content: string;
  extra?: any;
}

export interface AnswerPayload {
  companionGreeting: string;
  sections: AnswerSection[];
  relatedKnowledgeNodes?: RelatedKnowledgeNode[];
}

export interface ABComparison {
  unenhancedShortAnswer: string;
  comparisonMetrics: {
    accuracyDiff: string;
    completenessDiff: string;
    understandabilityDiff: string;
    knowledgeExpansionDiff: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'companion' | 'system_analysis';
  rawQuestion?: string;
  timestamp: string;
  analysis?: QuestionAnalysis;
  answer?: AnswerPayload;
  abComparison?: ABComparison;
  activeView?: 'enhanced' | 'unenhanced' | 'comparison';
  isConfirmed?: boolean;
}

export interface MindMapNode {
  id: string;
  label: string;
  course: string;
  mastery: 'unlearned' | 'learning' | 'mastered';
  keyTerms: string[];
  fullText: string;
  maskedText: string;
  relatedIds: string[];
  children?: MindMapNode[];
}

export interface LearnerRadarScores {
  memory: number; // 记忆型 (0-100)
  comprehension: number; // 理解型 (0-100)
  application: number; // 应用型 (0-100)
  analysis: number; // 分析型 (0-100)
}

export type LearnerArchetype =
  | '体系构建师'
  | '框架建构师'
  | '应试突击者'
  | '困惑探索者'
  | '线性吸收者'
  | '批判思辨者';

export interface LearnerReportData {
  id: string;
  testDate: string;
  primaryRole: LearnerArchetype;
  roleEnglish: string;
  description: string;
  radarScores: LearnerRadarScores;
  strengths: string[];
  weaknesses: string[];
  aiSuggestions: string[];
  dimensions: {
    knowledgeStyle: string;
    interactionMode: string;
    scenario: {
      goals: string[];
      painPoint: string;
    };
    metaGoal: string[];
  };
  aiConfig: {
    answerStructure: string;
    citationLevel: string;
    interactivity: string;
    defaultView: string;
  };
}

export interface StudentProfile {
  name: string;
  userId: string;
  grade: string;
  major: string;
  university: string;
  cognitiveStyle: string;
  studyHabit: string;
  weakPoints: string[];
  strengths: string[];
  weeklyQuestions: number;
  masteredKnowledgeCount: number;
  currentReport: LearnerReportData;
  assessmentHistory: LearnerReportData[];
  engineSettings: {
    vernacularPreference: boolean;
    autoExpandGraph: boolean;
    clinicalCaseFocus: boolean;
    activeRecallMode: boolean;
  };
}

