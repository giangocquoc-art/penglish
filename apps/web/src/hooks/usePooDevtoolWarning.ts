import { createElement, useEffect, useRef, useState } from 'react';

const DEVTOOLS_THRESHOLD = 160;
const CHECK_INTERVAL_MS = 1200;
const VISIBLE_MS = 5200;

function isDevtoolsLikelyOpen() {
  if (typeof window === 'undefined') return false;
  const widthGap = Math.abs(window.outerWidth - window.innerWidth);
  const heightGap = Math.abs(window.outerHeight - window.innerHeight);
  return widthGap > DEVTOOLS_THRESHOLD || heightGap > DEVTOOLS_THRESHOLD;
}

export function usePooDevtoolWarning() {
  const [visible, setVisible] = useState(false);
  const wasOpenRef = useRef(false);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const clearHideTimer = () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };

    const showWarning = () => {
      clearHideTimer();
      setVisible(true);
      hideTimerRef.current = window.setTimeout(() => {
        setVisible(false);
        hideTimerRef.current = null;
      }, VISIBLE_MS);
    };

    const intervalId = window.setInterval(() => {
      const open = isDevtoolsLikelyOpen();
      if (open && !wasOpenRef.current) showWarning();
      wasOpenRef.current = open;
    }, CHECK_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      clearHideTimer();
    };
  }, []);

  if (!visible) return null;

  return createElement(
    'div',
    {
      role: 'status',
      'aria-live': 'polite',
      style: {
        position: 'fixed',
        right: 18,
        bottom: 18,
        zIndex: 2147483647,
        maxWidth: 'min(360px, calc(100vw - 32px))',
        padding: '14px 16px',
        borderRadius: 22,
        border: '1px solid rgba(186,230,253,0.92)',
        background: 'linear-gradient(145deg, rgba(255,255,255,0.96), rgba(221,245,255,0.94))',
        boxShadow: '0 18px 48px rgba(31,111,214,0.18)',
        color: '#102A43',
        pointerEvents: 'none',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      },
    },
    createElement('div', { style: { fontWeight: 950, fontSize: 15, marginBottom: 6 } }, 'Poo thấy bạn mở DevTools rồi nha 👀'),
    createElement('div', { style: { fontWeight: 800, fontSize: 13, lineHeight: 1.55, color: '#52667A' } }, 'Tò mò là tốt, nhưng học xong một bài rồi soi tiếp nha 🐳'),
  );
}
