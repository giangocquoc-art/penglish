import { useEffect, useRef, useState } from 'react';

type GlobalLoadingBarState = {
  visible: boolean;
  exiting: boolean;
  progress: number;
};

type GlobalLoadingBarOptions = {
  delayMs?: number;
  finishMs?: number;
};

function clearTimer(timer: ReturnType<typeof setTimeout> | undefined) {
  if (timer) clearTimeout(timer);
}

function clearIntervalTimer(timer: ReturnType<typeof setInterval> | undefined) {
  if (timer) clearInterval(timer);
}

export function useGlobalLoadingBar(active: boolean, options: GlobalLoadingBarOptions = {}): GlobalLoadingBarState {
  const delayMs = options.delayMs ?? 180;
  const finishMs = options.finishMs ?? 280;
  const [state, setState] = useState<GlobalLoadingBarState>({ visible: false, exiting: false, progress: 0 });
  const delayTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const finishTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const progressTimerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    clearTimer(delayTimerRef.current);
    clearTimer(finishTimerRef.current);

    if (active) {
      setState((current) => current.visible ? { ...current, exiting: false, progress: Math.max(current.progress, 18) } : current);
      delayTimerRef.current = setTimeout(() => {
        setState({ visible: true, exiting: false, progress: 18 });
      }, delayMs);
      return () => clearTimer(delayTimerRef.current);
    }

    setState((current) => {
      if (!current.visible) return current;
      return { visible: true, exiting: false, progress: 100 };
    });

    finishTimerRef.current = setTimeout(() => {
      setState((current) => current.visible ? { ...current, exiting: true, progress: 100 } : current);
      finishTimerRef.current = setTimeout(() => {
        setState({ visible: false, exiting: false, progress: 0 });
      }, finishMs);
    }, 170);

    return () => {
      clearTimer(delayTimerRef.current);
      clearTimer(finishTimerRef.current);
    };
  }, [active, delayMs, finishMs]);

  useEffect(() => {
    clearIntervalTimer(progressTimerRef.current);

    if (!active || !state.visible || state.exiting) return undefined;

    progressTimerRef.current = setInterval(() => {
      setState((current) => {
        if (!current.visible || current.exiting) return current;
        const ceiling = current.progress < 70 ? 72 : 90;
        const increment = current.progress < 45 ? 8 : current.progress < 70 ? 4 : 1.5;
        return { ...current, progress: Math.min(ceiling, current.progress + increment) };
      });
    }, 240);

    return () => clearIntervalTimer(progressTimerRef.current);
  }, [active, state.exiting, state.visible]);

  useEffect(() => () => {
    clearTimer(delayTimerRef.current);
    clearTimer(finishTimerRef.current);
    clearIntervalTimer(progressTimerRef.current);
  }, []);

  return state;
}
