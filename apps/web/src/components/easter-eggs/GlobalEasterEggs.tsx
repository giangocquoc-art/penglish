import { useEffect, useRef, useState } from 'react';
import { Box, Text, useMediaQuery } from '@chakra-ui/react';
import { DevToolsJokeModal } from './DevToolsJokeModal';

const SECRET_MESSAGE = 'Bạn vừa mở chế độ tò mò 😏 Poo chào bạn!';
const SECRET_SEQUENCE = 'poo';

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || target.isContentEditable;
}

function useConsoleWelcome() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const flag = '__penglish_console_welcome_logged__';
    const store = window as unknown as Record<string, unknown>;
    if (store[flag]) return;
    store[flag] = true;
    console.log('🐳 Poo bắt gặp bạn rồi nha.\nNếu bạn đang soi code vì thích PooEnglish,\ncứ học cùng Poo trước đã, rồi mình cùng build bản xịn hơn sau.\n→ /learning-path');
  }, []);
}

function SecretPooToast() {
  const [visible, setVisible] = useState(false);
  const bufferRef = useRef('');
  const hideTimerRef = useRef<number | null>(null);
  const [prefersReducedMotion] = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      if (event.key.length !== 1) return;
      bufferRef.current = `${bufferRef.current}${event.key.toLowerCase()}`.slice(-SECRET_SEQUENCE.length);
      if (bufferRef.current !== SECRET_SEQUENCE) return;
      setVisible(true);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = window.setTimeout(() => setVisible(false), 3600);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  return (
    <Box
      data-testid="secret-poo-toast"
      role="status"
      aria-live="polite"
      position="fixed"
      left="50%"
      bottom={{ base: 'calc(var(--penglish-mobile-safe-bottom) + 16px)', md: '28px' }}
      transform={visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(14px)'}
      opacity={visible ? 1 : 0}
      pointerEvents="none"
      zIndex="toast"
      maxW="min(92vw, 420px)"
      px="4"
      py="3"
      borderRadius="full"
      bg="rgba(15,42,67,0.90)"
      color="white"
      border="1px solid rgba(186,230,253,0.38)"
      boxShadow="0 18px 48px rgba(8,24,42,0.22)"
      backdropFilter="blur(16px)"
      transition={prefersReducedMotion ? 'opacity 120ms ease' : 'opacity 180ms ease, transform 180ms ease'}
    >
      <Text fontWeight="850" fontSize={{ base: 'sm', md: 'md' }} textAlign="center">
        {SECRET_MESSAGE}
      </Text>
    </Box>
  );
}

export function GlobalEasterEggs() {
  useConsoleWelcome();
  return (
    <>
      <DevToolsJokeModal />
      <SecretPooToast />
    </>
  );
}
