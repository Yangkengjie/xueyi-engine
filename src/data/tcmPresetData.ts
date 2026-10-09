import { TaskItem, CourseProgress, StudentProfile, MindMapNode } from '../types';

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: '1',
    title: '背诵《伤寒论》一级条文5条',
    course: '伤寒论',
    completed: false,
    category: '背诵',
  },
  {
    id: '2',
    title: '做《内科学》第一章练习题并改错',
    course: '内科学',
    completed: false,
    category: '练习',
  },
  {
    id: '3',
    title: '学习《方剂学》解表剂组成与功效',
    course: '方剂学',
    completed: false,
    category: '预习',
  },
  {
    id: '4',
    title: '北包（整理中基五行学说错题考点）',
    course: '自定义',
    completed: false,
    category: '自定义',
  },
];

export const INITIAL_COURSES: CourseProgress[] = [
  {
    id: 'c1',
    title: '《方剂学·解表剂》',
    chapter: '上篇·第一章 · 上次学到 12',
    progress: 65,
    tags: ['麻黄汤', '桂枝汤', '九味羌活汤', '桑菊饮'],
  },
  {
    id: 'c2',
    title: '《内经》素问·上古天真论',
    chapter: '素问·卷一 · 上次学到 7',
    progress: 40,
    tags: ['法于阴阳', '和于术数', '女七男八'],
  },
  {
    id: 'c3',
    title: '中基·藏象学说',
    chapter: '第三章 · 上次学到 22',
    progress: 22,
    tags: ['五脏六腑', '心主血脉', '脾主运化'],
  },
  {
    id: 'c4',
    title: '中诊·问诊八纲辨证',
    chapter: '第二篇·第四章 · 上次学到 18',
    progress: 78,
    tags: ['表里寒热', '虚实阴阳', '潮热汗出'],
  },
];

export const DEFAULT_LEARNER_REPORT: StudentProfile['currentReport'] = {
  id: 'rep_init',
  testDate: '2024-05-18',
  primaryRole: '体系构建师',
  roleEnglish: 'Structure Builder',
  description: '理解型得分最高，擅长把知识点连成体系；建议多通过案例与图谱巩固应用能力。',
  radarScores: {
    memory: 70,
    comprehension: 88,
    application: 62,
    analysis: 76,
  },
  strengths: ['知识体系构建能力强', '概念理解深入', '逻辑思维清晰'],
  weaknesses: ['应用实践需加强', '记忆细节可提升'],
  aiSuggestions: [
    '多做案例分析题',
    '使用知识图谱建立关联',
    '定期做记忆强化训练',
  ],
  dimensions: {
    knowledgeStyle: '分析建构型',
    interactionMode: '溯源求证型',
    scenario: {
      goals: ['日常跟课', '建立框架'],
      painPoint: '记忆负荷',
    },
    metaGoal: ['传授者', '架构师'],
  },
  aiConfig: {
    answerStructure: '逻辑解释优先',
    citationLevel: '高（必须带出处）',
    interactivity: '中（可接受追问）',
    defaultView: '图谱模式',
  },
};

export const STUDENT_PROFILE_DATA: StudentProfile = {
  name: '岐黄学子',
  userId: '2024001',
  grade: '大一本科生',
  major: '中医学专业（五年制）',
  university: '北京中医药大学',
  cognitiveStyle: '机制推演与对比分析型',
  studyHabit: '注重概念本质，擅长把知识点连成体系',
  weakPoints: ['应用实践需加强', '记忆细节可提升', '温病与伤寒横向鉴别'],
  strengths: ['知识体系构建能力强', '概念理解深入', '逻辑思维清晰'],
  weeklyQuestions: 24,
  masteredKnowledgeCount: 68,
  currentReport: DEFAULT_LEARNER_REPORT,
  assessmentHistory: [
    DEFAULT_LEARNER_REPORT,
    {
      id: 'rep_prev_1',
      testDate: '2024-03-12',
      primaryRole: '困惑探索者',
      roleEnglish: 'Puzzled Explorer',
      description: '初学阶段对抽象概念理解有困惑，习惯结合具体临床案例与生动比喻消化。',
      radarScores: {
        memory: 58,
        comprehension: 65,
        application: 78,
        analysis: 60,
      },
      strengths: ['案例领悟直觉好', '善于联系实际'],
      weaknesses: ['理论框架较零散', '提问精准度需提升'],
      aiSuggestions: ['跟随知识图谱梳理八纲辨证', '多做真题自测'],
      dimensions: {
        knowledgeStyle: '具象体验型',
        interactionMode: '引导启发型',
        scenario: { goals: ['解决困惑'], painPoint: '表述困难' },
        metaGoal: ['临床家'],
      },
      aiConfig: {
        answerStructure: '举例优先',
        citationLevel: '标准',
        interactivity: '高',
        defaultView: '列表模式',
      },
    },
  ],
  engineSettings: {
    vernacularPreference: true,
    autoExpandGraph: true,
    clinicalCaseFocus: true,
    activeRecallMode: true,
  },
};

export const PRESET_QUESTIONS = [
  {
    title: '阴虚潮热机制',
    question: '为什么阴虚会五心潮热？',
    tag: '中基/中诊 · 经典痛点',
    desc: '学生常见提问：想理解阴虚和虚热关系，想知道五心潮热表现机制',
  },
  {
    title: '阳虚低热与伏热',
    question: '解释一下阳虚潮热，为什么午后和夜间有低热，阳分伏热',
    tag: '中诊/中基 · 概念辨析',
    desc: '拆解阳虚发热机制、午后夜间低热病机与阳分伏热区别',
  },
  {
    title: '方剂同名药鉴别',
    question: '半夏厚朴汤和厚朴温中汤有什么区别？',
    tag: '方剂学 · 高频考点',
    desc: '从组成、君臣配伍、主治病证梅核气与脘腹胀满对比',
  },
  {
    title: '气血相互化生',
    question: '为什么补气能生血？当归补血汤里黄芪用量为什么是当归五倍？',
    tag: '中基/方剂 · 跨课整合',
    desc: '理解“气能生血”的生理基础与经典方剂配伍剂量奥秘',
  },
];

export const KNOWLEDGE_GRAPH_NODES = [
  {
    id: 'k1',
    name: '阴虚潮热',
    course: '中医诊断学',
    category: '症状病机',
    mastery: 'learning',
    description: '午后或入夜发热，热自骨髓深处透出，伴五心烦热、盗汗、舌红少苔、脉细数。',
    relations: [
      { targetId: 'k2', targetName: '肾阴亏虚', strength: 0.94, course: '中医基础理论', type: '理论病因' },
      { targetId: 'k3', targetName: '六味地黄丸', strength: 0.92, course: '方剂学', type: '经典治法方剂' },
      { targetId: 'k4', targetName: '熟地黄/知母/黄柏', strength: 0.88, course: '中药学', type: '核心药组' },
      { targetId: 'k5', targetName: '阳明潮热', strength: 0.85, course: '中医诊断学', type: '横向鉴别' },
      { targetId: 'k6', targetName: '阳分伏热/夜热早凉', strength: 0.68, course: '温病学', type: '弱关联拓展' },
    ],
  },
  {
    id: 'k2',
    name: '肾阴亏虚',
    course: '中医基础理论',
    category: '脏腑病机',
    mastery: 'mastered',
    description: '肾脏阴液不足，滋养、濡润、成形及制约阳热功能减退所表现的虚热证候。',
    relations: [
      { targetId: 'k1', targetName: '阴虚潮热', strength: 0.94, course: '中医诊断学', type: '症状表现' },
      { targetId: 'k3', targetName: '六味地黄丸', strength: 0.96, course: '方剂学', type: '主治方剂' },
      { targetId: 'k7', targetName: '水火既济失调', strength: 0.75, course: '中医基础理论', type: '病理演变' },
    ],
  },
  {
    id: 'k3',
    name: '六味地黄丸',
    course: '方剂学',
    category: '补益剂',
    mastery: 'mastered',
    description: '三补三泻配伍典范：熟地、山萸肉、山药（三补）配合泽泻、丹皮、茯苓（三泻）。',
    relations: [
      { targetId: 'k1', targetName: '阴虚潮热', strength: 0.92, course: '中医诊断学', type: '主治证候' },
      { targetId: 'k4', targetName: '知柏地黄丸', strength: 0.91, course: '方剂学', type: '加味衍化' },
      { targetId: 'k8', targetName: '金匮肾气丸', strength: 0.86, course: '方剂学', type: '阴阳配伍对比' },
    ],
  },
  {
    id: 'k5',
    name: '阳明潮热',
    course: '中医诊断学',
    category: '实热证候',
    mastery: 'unlearned',
    description: '日晡所发热，大热大汗大渴，腹满便秘，脉沉实有力，属里实热证。',
    relations: [
      { targetId: 'k1', targetName: '阴虚潮热', strength: 0.85, course: '中医诊断学', type: '虚实鉴别' },
      { targetId: 'k9', targetName: '大承气汤', strength: 0.95, course: '方剂学', type: '对应泻下剂' },
    ],
  },
  {
    id: 'k6',
    name: '青蒿鳖甲汤与透热转气',
    course: '温病学',
    category: '温病治法',
    mastery: 'learning',
    description: '吴鞠通《温病条辨》名方，夜热早凉，热退无汗，热自阴分透出阳分。',
    relations: [
      { targetId: 'k1', targetName: '阴虚潮热', strength: 0.68, course: '中医诊断学', type: '跨学科弱关联' },
      { targetId: 'k3', targetName: '六味地黄丸', strength: 0.62, course: '方剂学', type: '滋阴透热协同' },
    ],
  },
];

export const MINDMAP_DATA: MindMapNode[] = [
  {
    id: 'm1',
    label: '中医诊断学 · 问诊八纲',
    course: '中医诊断学',
    mastery: 'learning',
    keyTerms: ['问诊', '八纲辨证', '寒热虚实'],
    fullText: '问诊是中医四诊的核心，通过询问患者病史与自述症状，以八纲（表里、寒热、虚实、阴阳）统领全篇。',
    maskedText: '【问诊】是中医四诊的核心，通过询问患者病史与自述症状，以【八纲辨证】（表里、【寒热虚实】、阴阳）统领全篇。',
    relatedIds: ['m2', 'm3'],
    children: [
      {
        id: 'm2',
        label: '问寒热 · 潮热分类',
        course: '中医诊断学',
        mastery: 'learning',
        keyTerms: ['阴虚潮热', '阳明潮热', '湿温潮热'],
        fullText: '潮热是指发热如潮水一般定时而发。主要分为阴虚潮热（五心烦热盗汗）、阳明潮热（日晡热甚便秘）、湿温潮热（身热不扬头重）。',
        maskedText: '潮热是指发热如潮水一般定时而发。主要分为【阴虚潮热】（五心烦热盗汗）、【阳明潮热】（日晡热甚便秘）、【湿温潮热】（身热不扬头重）。',
        relatedIds: ['k1', 'k5'],
      },
      {
        id: 'm3',
        label: '问汗 · 自汗与盗汗',
        course: '中医诊断学',
        mastery: 'mastered',
        keyTerms: ['自汗', '盗汗', '气虚', '阴虚'],
        fullText: '自汗常因气虚卫外不固，动则益甚；盗汗因阴虚阳浮，入睡则出，醒后汗止。',
        maskedText: '【自汗】常因【气虚】卫外不固，动则益甚；【盗汗】因【阴虚】阳浮，入睡则出，醒后汗止。',
        relatedIds: ['k1'],
      },
    ],
  },
  {
    id: 'm4',
    label: '方剂学 · 理气剂',
    course: '方剂学',
    mastery: 'learning',
    keyTerms: ['半夏厚朴汤', '厚朴温中汤', '梅核气', '寒湿气滞'],
    fullText: '半夏厚朴汤主治痰气交阻之梅核气；厚朴温中汤主治脾胃虚寒、寒湿气滞之脘腹胀痛。',
    maskedText: '【半夏厚朴汤】主治痰气交阻之【梅核气】；【厚朴温中汤】主治脾胃虚寒、【寒湿气滞】之脘腹胀痛。',
    relatedIds: ['m1'],
  },
];
