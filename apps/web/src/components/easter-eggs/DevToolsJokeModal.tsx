import { useEffect, useRef } from 'react';
import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  useDisclosure,
  useMediaQuery,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const SHORTCUT_COOLDOWN_MS = 1200;

function isDevToolsJokeShortcut(event: KeyboardEvent) {
  const key = event.key.toLowerCase();
  return event.key === 'F12'
    || (event.ctrlKey && event.shiftKey && (key === 'i' || key === 'j'))
    || (event.ctrlKey && key === 'u');
}

export function DevToolsJokeModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const lastOpenedAtRef = useRef(0);
  const [prefersReducedMotion] = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isDevToolsJokeShortcut(event)) return;
      event.preventDefault();
      const now = Date.now();
      if (now - lastOpenedAtRef.current < SHORTCUT_COOLDOWN_MS) return;
      lastOpenedAtRef.current = now;
      onOpen();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onOpen]);

  const goBackToLearning = () => {
    onClose();
    navigate('/learning-path');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset={prefersReducedMotion ? 'none' : 'scale'}>
      <ModalOverlay bg="rgba(8, 24, 42, 0.46)" backdropFilter="blur(10px)" />
      <ModalContent
        data-testid="devtools-joke-modal"
        role="dialog"
        aria-modal="true"
        mx="4"
        maxW="520px"
        borderRadius="34px"
        overflow="hidden"
        bg="linear-gradient(145deg, rgba(15,42,67,0.94), rgba(31,111,214,0.82))"
        color="white"
        border="1px solid rgba(186,230,253,0.34)"
        boxShadow="0 28px 90px rgba(8, 24, 42, 0.38)"
      >
        <ModalHeader px={{ base: '5', md: '7' }} pt={{ base: '6', md: '7' }} pb="2">
          <HStack gap="3" align="center">
            <Text fontSize="3xl" aria-hidden="true">🐳</Text>
            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" lineHeight="1.08">
              Ê khoan đã 😏
            </Text>
          </HStack>
        </ModalHeader>
        <ModalBody px={{ base: '5', md: '7' }} pb="2">
          <VStack align="stretch" gap="3">
            <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="800" lineHeight="1.7">
              Làm cái gì đấy? Tò mò cái gì vậy? Poo đang học tiếng Anh mà cũng bị soi code nữa hả?
            </Text>
            <Text color="rgba(221,245,255,0.88)" fontSize={{ base: 'sm', md: 'md' }} fontWeight="650" lineHeight="1.7">
              Nếu bạn thích cách PooEnglish hoạt động, cứ khám phá nhẹ thôi nha. Đừng làm Poo giật mình 🐳
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter px={{ base: '5', md: '7' }} pb={{ base: '5', md: '7' }} pt="4" gap="3" flexWrap="wrap">
          <Button data-testid="devtools-joke-close" borderRadius="full" bg="rgba(255,255,255,0.16)" color="white" _hover={{ bg: 'rgba(255,255,255,0.24)' }} onClick={onClose}>
            Thôi, em chỉ xem thôi 😅
          </Button>
          <Button data-testid="devtools-joke-learn" borderRadius="full" bg="#DDF5FF" color="#102A43" _hover={{ bg: '#AEE7FF' }} onClick={goBackToLearning}>
            Quay lại học với Poo
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
