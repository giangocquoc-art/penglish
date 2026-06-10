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

export function FooterEasterEggButton({ onNavigate }: { onNavigate?: () => void }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const [prefersReducedMotion] = useMediaQuery('(prefers-reduced-motion: reduce)');

  const goBackToLearning = () => {
    onClose();
    onNavigate?.();
    navigate('/learning-path');
  };

  return (
    <>
      <Button
        data-testid="footer-easter-egg-button"
        size="xs"
        borderRadius="full"
        variant="ghost"
        color="#1F6FD6"
        bg="rgba(221,245,255,0.48)"
        border="1px solid rgba(186,230,253,0.72)"
        fontWeight="850"
        _hover={{ bg: 'rgba(221,245,255,0.82)' }}
        onClick={onOpen}
      >
        Đừng bấm nút này
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset={prefersReducedMotion ? 'none' : 'scale'}>
        <ModalOverlay bg="rgba(8,24,42,0.42)" backdropFilter="blur(10px)" />
        <ModalContent
          data-testid="footer-easter-egg-modal"
          mx="4"
          maxW="520px"
          borderRadius="32px"
          bg="rgba(255,255,255,0.90)"
          border="1px solid rgba(186,230,253,0.82)"
          boxShadow="0 28px 76px rgba(31,111,214,0.18)"
          backdropFilter="blur(18px) saturate(1.08)"
        >
          <ModalHeader px={{ base: '5', md: '7' }} pt={{ base: '6', md: '7' }} pb="2">
            <HStack gap="3">
              <Text fontSize="3xl" aria-hidden="true">🐳</Text>
              <Text color="#102A43" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" lineHeight="1.08">
                Đã bảo đừng bấm rồi mà 😭
              </Text>
            </HStack>
          </ModalHeader>
          <ModalBody px={{ base: '5', md: '7' }} pb="2">
            <VStack align="stretch" gap="2">
              <Text color="#52667A" fontWeight="750" lineHeight="1.75">
                Nhưng vì bạn tò mò, Poo tặng bạn một lời nhắc: học 15 phút mỗi ngày còn hơn đợi có động lực mới học.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter px={{ base: '5', md: '7' }} pb={{ base: '5', md: '7' }} pt="4" gap="3" flexWrap="wrap">
            <Button data-testid="footer-easter-egg-learn" borderRadius="full" bg="#1F6FD6" color="white" _hover={{ bg: '#185BB2' }} onClick={goBackToLearning}>
              Quay lại học
            </Button>
            <Button data-testid="footer-easter-egg-close" borderRadius="full" variant="outline" borderColor="#BAE6FD" color="#102A43" onClick={onClose}>
              Đóng lại
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
