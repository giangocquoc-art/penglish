import type { LessonProgressMode } from './lesson-progress';

const STORAGE_KEY = 'p-english:local-skill-memory:v1';

export type PracticeSkillArea =
  | 'vocabulary'
  | 'grammar'
  | 'reading'
  | 'listening'
  | 'speaking'
  | 'typing'
  | 'review'
  | 'speed';

export type LocalSkillMemorySession = {
  id: string;
  lessonId: string;
  lessonTitleVi: string;
  mode: LessonProgressMode;
  skillArea: PracticeSkillArea;
  total: number;
  correct: number;
  wrong: number;
  percentage: number;
  weakItemIds: string[];
  completedAt: string;
};

export type LocalSkillMemory = {
  version: 1;
  updatedAt: string;
  sessions: LocalSkillMemorySession[];
  byMode: Partial<Record<LessonProgressMode, {
    attempts: number;
    averagePercentage: number;
    lastPercentage: number;
    weakItemCount: number;
    lastPracticedAt: string;
  }>>;
  bySkill: Partial<Record<PracticeSkillArea, {
    attempts: number;
    averagePercentage: number;
    lastPercentage: number;
    weakItemCount: number;
    lastPracticedAt: string;
  }>>;
};

const EMPTY_MEMORY: LocalSkillMemory = {
  version: 1,
  updatedAt: '',
  sessions: [],
  byMode: {},
  bySkill: {},
};

function safeParseMemory(raw: string | null): LocalSkillMemory {
  if (!raw) return { ...EMPTY_MEMORY, sessions: [], byMode: {}, bySkill: {} };

  try {
    const parsed = JSON.parse(raw) as Partial<LocalSkillMemory>;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.sessions)) {
      return { ...EMPTY_MEMORY, sessions: [], byMode: {}, bySkill: {} };
    }

    return {
      version: 1,
      updatedAt: parsed.updatedAt ?? '',
      sessions: parsed.sessions.slice(-80),
      byMode: parsed.byMode ?? {},
      bySkill: parsed.bySkill ?? {},
    };
  } catch {
    return { ...EMPTY_MEMORY, sessions: [], byMode: {}, bySkill: {} };
  }
}

function roundAverage(previousAverage: number, attempts: number, nextPercentage: number) {
  if (attempts <= 0) return nextPercentage;
  return Math.round(((previousAverage * attempts) + nextPercentage) / (attempts + 1));
}

export function readLocalSkillMemory(): LocalSkillMemory {
  if (typeof window === 'undefined') return { ...EMPTY_MEMORY, sessions: [], byMode: {}, bySkill: {} };
  return safeParseMemory(window.localStorage.getItem(STORAGE_KEY));
}

export function clearLocalSkillMemory() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function inferPracticeSkillArea(mode: LessonProgressMode): PracticeSkillArea {
  if (mode === 'flashcard' || mode === 'match') return 'vocabulary';
  if (mode === 'quiz') return 'grammar';
  if (mode === 'listen') return 'listening';
  if (mode === 'reflex') return 'speaking';
  if (mode === 'type') return 'typing';
  if (mode === 'speed') return 'speed';
  return 'review';
}

export function recordPracticeSessionMemory(input: Omit<LocalSkillMemorySession, 'id' | 'completedAt' | 'skillArea'> & { skillArea?: PracticeSkillArea }): LocalSkillMemory {
  const completedAt = new Date().toISOString();
  const skillArea = input.skillArea ?? inferPracticeSkillArea(input.mode);
  const session: LocalSkillMemorySession = {
    ...input,
    id: `${input.lessonId}:${input.mode}:${completedAt}`,
    skillArea,
    completedAt,
    weakItemIds: Array.from(new Set(input.weakItemIds)).slice(0, 30),
  };

  const current = readLocalSkillMemory();
  const previousMode = current.byMode[input.mode];
  const previousSkill = current.bySkill[skillArea];

  const next: LocalSkillMemory = {
    version: 1,
    updatedAt: completedAt,
    sessions: [...current.sessions, session].slice(-80),
    byMode: {
      ...current.byMode,
      [input.mode]: {
        attempts: (previousMode?.attempts ?? 0) + 1,
        averagePercentage: roundAverage(previousMode?.averagePercentage ?? 0, previousMode?.attempts ?? 0, input.percentage),
        lastPercentage: input.percentage,
        weakItemCount: session.weakItemIds.length,
        lastPracticedAt: completedAt,
      },
    },
    bySkill: {
      ...current.bySkill,
      [skillArea]: {
        attempts: (previousSkill?.attempts ?? 0) + 1,
        averagePercentage: roundAverage(previousSkill?.averagePercentage ?? 0, previousSkill?.attempts ?? 0, input.percentage),
        lastPercentage: input.percentage,
        weakItemCount: session.weakItemIds.length,
        lastPracticedAt: completedAt,
      },
    },
  };

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Learning still works if localStorage is unavailable.
    }
  }

  return next;
}

export function getRecentPracticeSessions(limit = 5) {
  return readLocalSkillMemory().sessions.slice(-limit).reverse();
}
