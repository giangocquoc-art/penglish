import { useEffect, useState } from 'react';
import { Box, Button, HStack, Icon, Tag, Text, VStack } from '@chakra-ui/react';
import { Mic2, RotateCcw, Volume2 } from 'lucide-react';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { requestShadowingFeedback, type ShadowingApiResult } from '../../lib/p-english/shadowingApiClient';

export type InteractiveShadowingStep = {
  id: string;
  prompt?: string;
  answer?: string;
  vietnamese?: string;
};

type Props = {
  step: InteractiveShadowingStep;
  lessonTitle: string;
  level: string;
  onComplete: () => void;
  onPlayModel: (text: string) => void;
};

const COLORS = { text: '#0F172A', muted: '#64748B', blue: '#1F6FD6', red: '#EF4444' };

export function InteractiveShadowingChallenge({ step, lessonTitle, level, onComplete, onPlayModel }: Props) {
  const [recordingResult, setRecordingResult] = useState<ShadowingApiResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modelPlayed, setModelPlayed] = useState(false);
  const [scriptRevealed, setScriptRevealed] = useState(false);
  const { status, errorMessage, audioBlob, audioUrl, isSupported, startRecording, stopRecording, resetRecording } = useAudioRecorder();
  const isRecording = status === 'recording';
  const isRequesting = status === 'requesting';

  useEffect(() => {
    setRecordingResult(null);
    setIsSubmitting(false);
    setModelPlayed(false);
    setScriptRevealed(false);
    resetRecording();
  }, [step.id, resetRecording]);

  const playModel = () => {
    if (step.answer) onPlayModel(step.answer);
    setModelPlayed(true);
  };

  const submitRecording = async () => {
    if (!audioBlob) return;
    setIsSubmitting(true);
    setRecordingResult(null);
    const result = await requestShadowingFeedback({
      audio: audioBlob,
      targetText: step.answer ?? '',
      translation: step.vietnamese,
      lessonTitle,
      level,
    });
    setRecordingResult(result);
    setIsSubmitting(false);
  };

  const retry = () => {
    setRecordingResult(null);
    resetRecording();
  };

  return (
    <VStack align="stretch" gap="4" data-testid="interactive-shadowing">
      <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900" color={COLORS.text}>{step.prompt}</Text>
      <HStack wrap="wrap" gap="3">
        <Button data-testid="interactive-shadowing-model" minH="44px" borderRadius="full" leftIcon={<Icon as={Volume2} />} onClick={playModel}>Nghe mẫu chậm</Button>
        {step.answer ? <Button minH="44px" borderRadius="full" variant="ghost" onClick={() => setScriptRevealed((value) => !value)}>{scriptRevealed ? 'Ẩn câu mẫu' : 'Hiện câu mẫu'}</Button> : null}
      </HStack>
      {scriptRevealed ? <Box p="4" borderRadius="2xl" bg="white" border="1px solid #BAE6FD"><Text fontSize="lg" fontWeight="900" color={COLORS.blue}>{step.answer}</Text></Box> : null}
      {isSupported ? (
        <VStack align="stretch" gap="3" p="4" borderRadius="2xl" bg={isRecording ? '#FEF2F2' : '#F8FCFF'} border="1px solid" borderColor={isRecording ? '#FECACA' : '#D7E8F5'}>
          <HStack justify="space-between" gap="3" wrap="wrap">
            <Text fontWeight="850" color={isRecording ? '#991B1B' : COLORS.text} role="status" aria-live="polite">
              {isRequesting ? 'Đang xin quyền micro…' : isRecording ? 'Poo đang nghe lượt nói của bạn' : audioBlob ? 'Đã ghi âm · hãy nghe lại trước khi gửi' : 'Bấm ghi âm sau khi nghe câu mẫu'}
            </Text>
            <Button data-testid="interactive-shadowing-record" minH="44px" borderRadius="full" bg={isRecording ? COLORS.red : COLORS.blue} color="white" isLoading={isRequesting} isDisabled={isSubmitting} onClick={() => isRecording ? stopRecording() : void startRecording()}>
              <Icon as={Mic2} mr="2" />{isRecording ? 'Dừng ghi âm' : 'Ghi âm lượt nói'}
            </Button>
          </HStack>
          {errorMessage ? <Text color="#9A3412" fontSize="sm" role="alert">{errorMessage} Bạn vẫn có thể tự đối chiếu và hoàn thành bước này.</Text> : null}
          {audioUrl ? <audio data-testid="interactive-shadowing-playback" controls src={audioUrl} preload="metadata" aria-label="Nghe lại lượt ghi âm của bạn" /> : null}
          {audioBlob ? <Button data-testid="interactive-shadowing-compare" minH="44px" alignSelf="start" borderRadius="full" bg="#0F766E" color="white" isLoading={isSubmitting} loadingText="Poo đang đối chiếu…" onClick={() => void submitRecording()}>So sánh với câu mẫu</Button> : null}
        </VStack>
      ) : (
        <Text p="3" borderRadius="xl" bg="#FFFBEB" color="#92400E" fontSize="sm" fontWeight="700" role="status">Trình duyệt chưa hỗ trợ ghi âm. Bạn nghe mẫu, tự nói theo rồi đánh dấu hoàn thành nhé.</Text>
      )}
      {recordingResult?.ok ? (
        <Box p="4" borderRadius="2xl" bg={recordingResult.allowContinue ? '#F0FDF4' : '#FFF7ED'} border="1px solid" borderColor={recordingResult.allowContinue ? '#86EFAC' : '#FDBA74'} data-testid="interactive-shadowing-result">
          <HStack justify="space-between" wrap="wrap" gap="2"><Text fontWeight="950" color={recordingResult.allowContinue ? '#166534' : '#9A3412'}>{recordingResult.allowContinue ? 'Đã đối chiếu xong' : 'Thử chậm hơn một lượt nhé'}</Text><Tag borderRadius="full" bg="white" fontWeight="900">Ước lượng {recordingResult.score}%</Tag></HStack>
          <Text mt="2" color={COLORS.text} fontSize="sm"><b>Poo nghe được:</b> {recordingResult.transcript || 'Chưa nhận ra lời nói rõ ràng.'}</Text>
          {recordingResult.missingWords.length ? <Text mt="1" color={COLORS.muted} fontSize="sm"><b>Nghe lại cụm còn thiếu:</b> {recordingResult.missingWords.join(', ')}</Text> : null}
          <Text mt="2" color={COLORS.muted} fontSize="sm">{recordingResult.coachMessage}</Text>
          {recordingResult.pronunciationTips.slice(0, 2).map((tip) => <Text key={tip} mt="1" color={COLORS.muted} fontSize="sm">• {tip}</Text>)}
        </Box>
      ) : recordingResult ? (
        <Text p="3" borderRadius="xl" bg="#FFFBEB" color="#92400E" fontSize="sm" fontWeight="700" role="status" data-testid="interactive-shadowing-fallback">{recordingResult.message} Bạn có thể nghe lại lượt ghi âm và tự đối chiếu với câu mẫu.</Text>
      ) : null}
      <HStack wrap="wrap" gap="3">
        {audioBlob ? <Button minH="44px" borderRadius="full" variant="outline" onClick={retry}><Icon as={RotateCcw} mr="2" />Thử ghi lại</Button> : null}
        <Button data-testid="interactive-shadowing-self-check" minH="44px" borderRadius="full" bg={COLORS.blue} color="white" isDisabled={!modelPlayed || isRecording || isRequesting || isSubmitting} onClick={onComplete} _hover={{ bg: '#185BB2' }}>Mình đã nói theo và tự đối chiếu</Button>
      </HStack>
    </VStack>
  );
}
