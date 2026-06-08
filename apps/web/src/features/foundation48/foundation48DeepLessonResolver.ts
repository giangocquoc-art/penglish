import { foundation48DeepLessons } from './foundation48DeepLessons';
import type { Foundation48DeepLesson } from './foundation48DeepLessons';

const stage3LazyDayRange = { start: 13, end: 17 } as const;
const stage4LazyDayRange = { start: 18, end: 21 } as const;
const stage5LazyDayRange = { start: 22, end: 28 } as const;
const stage6LazyDayRange = { start: 29, end: 34 } as const;
const stage7LazyDayRange = { start: 35, end: 38 } as const;
const stage8LazyDayRange = { start: 39, end: 48 } as const;
let stage3LazyPromise: Promise<Record<number, Foundation48DeepLesson>> | null = null;
let stage4LazyPromise: Promise<Record<number, Foundation48DeepLesson>> | null = null;
let stage5LazyPromise: Promise<Record<number, Foundation48DeepLesson>> | null = null;
let stage6LazyPromise: Promise<Record<number, Foundation48DeepLesson>> | null = null;
let stage7LazyPromise: Promise<Record<number, Foundation48DeepLesson>> | null = null;
let stage8LazyPromise: Promise<Record<number, Foundation48DeepLesson>> | null = null;
const lessonCache = new Map<number, Foundation48DeepLesson>();

function getStaticFoundation48DeepLesson(dayNumber: number) {
  return foundation48DeepLessons[dayNumber];
}

function canLoadStage3LazyLesson(dayNumber: number) {
  return dayNumber >= stage3LazyDayRange.start && dayNumber <= stage3LazyDayRange.end;
}

function canLoadStage4LazyLesson(dayNumber: number) {
  return dayNumber >= stage4LazyDayRange.start && dayNumber <= stage4LazyDayRange.end;
}

function canLoadStage5LazyLesson(dayNumber: number) {
  return dayNumber >= stage5LazyDayRange.start && dayNumber <= stage5LazyDayRange.end;
}

function canLoadStage6LazyLesson(dayNumber: number) {
  return dayNumber >= stage6LazyDayRange.start && dayNumber <= stage6LazyDayRange.end;
}

function canLoadStage7LazyLesson(dayNumber: number) {
  return dayNumber >= stage7LazyDayRange.start && dayNumber <= stage7LazyDayRange.end;
}

function canLoadStage8LazyLesson(dayNumber: number) {
  return dayNumber >= stage8LazyDayRange.start && dayNumber <= stage8LazyDayRange.end;
}

async function loadStage3LazyLessons() {
  if (!stage3LazyPromise) {
    stage3LazyPromise = import('./foundation48DeepLessons.stage3.lazy').then((module) => module.foundation48Stage3LazyDeepLessons);
  }
  return stage3LazyPromise;
}

async function loadStage4LazyLessons() {
  if (!stage4LazyPromise) {
    stage4LazyPromise = import('./foundation48DeepLessons.stage4.lazy').then((module) => module.foundation48Stage4LazyDeepLessons);
  }
  return stage4LazyPromise;
}

async function loadStage5LazyLessons() {
  if (!stage5LazyPromise) {
    stage5LazyPromise = import('./foundation48DeepLessons.stage5.lazy').then((module) => module.foundation48Stage5LazyDeepLessons);
  }
  return stage5LazyPromise;
}

async function loadStage6LazyLessons() {
  if (!stage6LazyPromise) {
    stage6LazyPromise = import('./foundation48DeepLessons.stage6.lazy').then((module) => module.foundation48Stage6LazyDeepLessons);
  }
  return stage6LazyPromise;
}

async function loadStage7LazyLessons() {
  if (!stage7LazyPromise) {
    stage7LazyPromise = import('./foundation48DeepLessons.stage7.lazy').then((module) => module.foundation48Stage7LazyDeepLessons);
  }
  return stage7LazyPromise;
}

async function loadStage8LazyLessons() {
  if (!stage8LazyPromise) {
    stage8LazyPromise = import('./foundation48DeepLessons.stage8.lazy').then((module) => module.foundation48Stage8LazyDeepLessons);
  }
  return stage8LazyPromise;
}

function cacheLazyLessons(lazyLessons: Record<number, Foundation48DeepLesson>) {
  Object.entries(lazyLessons).forEach(([day, lesson]) => lessonCache.set(Number(day), lesson));
}

export function getFoundation48CachedDeepLesson(dayNumber: number): Foundation48DeepLesson | undefined {
  return getStaticFoundation48DeepLesson(dayNumber) ?? lessonCache.get(dayNumber);
}

export async function getFoundation48DeepLesson(dayNumber: number): Promise<Foundation48DeepLesson | undefined> {
  const staticLesson = getStaticFoundation48DeepLesson(dayNumber);
  if (staticLesson) return staticLesson;

  const cached = lessonCache.get(dayNumber);
  if (cached) return cached;

  if (canLoadStage3LazyLesson(dayNumber)) {
    cacheLazyLessons(await loadStage3LazyLessons());
    return lessonCache.get(dayNumber);
  }

  if (canLoadStage4LazyLesson(dayNumber)) {
    cacheLazyLessons(await loadStage4LazyLessons());
    return lessonCache.get(dayNumber);
  }

  if (canLoadStage5LazyLesson(dayNumber)) {
    cacheLazyLessons(await loadStage5LazyLessons());
    return lessonCache.get(dayNumber);
  }

  if (canLoadStage6LazyLesson(dayNumber)) {
    cacheLazyLessons(await loadStage6LazyLessons());
    return lessonCache.get(dayNumber);
  }

  if (canLoadStage7LazyLesson(dayNumber)) {
    cacheLazyLessons(await loadStage7LazyLessons());
    return lessonCache.get(dayNumber);
  }

  if (canLoadStage8LazyLesson(dayNumber)) {
    cacheLazyLessons(await loadStage8LazyLessons());
    return lessonCache.get(dayNumber);
  }

  return undefined;
}

export async function preloadFoundation48DeepLesson(dayNumber: number): Promise<void> {
  await getFoundation48DeepLesson(dayNumber);
}

export async function getFoundation48DeepLessonVocabulary(dayNumber: number) {
  const lesson = await getFoundation48DeepLesson(dayNumber);
  return lesson?.vocabulary ?? [];
}
