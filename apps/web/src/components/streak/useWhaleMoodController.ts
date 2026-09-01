import { useCallback, useEffect, useRef, useState } from 'react';
import type { WhaleMood } from './AdaptiveWhaleStreak';

const TEMPORARY_MOODS = new Set<WhaleMood>(['correct', 'mistake', 'celebrate', 'encourage']);
const MOOD_DURATIONS: Record<WhaleMood, number> = {
  idle: 0,
  loading: 0,
  correct: 1400,
  mistake: 1500,
  encourage: 1300,
  celebrate: 2200,
};
const MOOD_PRIORITY: Record<WhaleMood, number> = {
  idle: 0,
  loading: 1,
  encourage: 2,
  mistake: 3,
  correct: 3,
  celebrate: 4,
};
const MIN_TRANSITION_MS = 220;

export function useWhaleMoodController(initialMood: WhaleMood = 'idle') {
  const [whaleMood, setWhaleMood] = useState<WhaleMood>(initialMood);
  const moodRef = useRef<WhaleMood>(initialMood);
  const lastChangeRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const clearMoodTimer = useCallback(() => {
    if (timerRef.current !== null && typeof window !== 'undefined') {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const setMoodSafely = useCallback((nextMood: WhaleMood) => {
    moodRef.current = nextMood;
    lastChangeRef.current = typeof performance !== 'undefined' ? performance.now() : Date.now();
    setWhaleMood(nextMood);
  }, []);

  const triggerWhaleMood = useCallback((nextMood: WhaleMood) => {
    if (typeof window === 'undefined') {
      setWhaleMood(nextMood);
      return;
    }

    const currentMood = moodRef.current;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const elapsed = now - lastChangeRef.current;

    if (nextMood === currentMood && TEMPORARY_MOODS.has(nextMood)) {
      clearMoodTimer();
    } else if (currentMood === 'celebrate' && nextMood !== 'celebrate' && nextMood !== 'idle') {
      return;
    } else if (elapsed < MIN_TRANSITION_MS && MOOD_PRIORITY[nextMood] < MOOD_PRIORITY[currentMood]) {
      return;
    } else {
      clearMoodTimer();
      setMoodSafely(nextMood);
    }

    if (TEMPORARY_MOODS.has(nextMood)) {
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        if (moodRef.current === nextMood) setMoodSafely('idle');
      }, MOOD_DURATIONS[nextMood]);
    }
  }, [clearMoodTimer, setMoodSafely]);

  useEffect(() => clearMoodTimer, [clearMoodTimer]);

  return { whaleMood, triggerWhaleMood };
}
