import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, Center, HStack, SimpleGrid, Text, VStack, Wrap, WrapItem } from '@chakra-ui/react';
import { Mic, RotateCcw, Square } from 'lucide-react';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { requestSpeakingAssessment, type SpeakingAssessmentResult } from '../../lib/p-english/speakingCoachApiClient';
import { POO_SPEAKING_SPRITE_ASSETS, type PooSpeakingAssetId } from '../../data/pooSpeakingAssets';

const MAX_RECORDING_MS = 30_000;
const TARGET_TEXT = 'My name is Poo.';

function PooSpeakingSprite({
  id,
  size = 86,
  animated = true,
  label,
}: {
  id: PooSpeakingAssetId;
  size?: number;
  animated?: boolean;
  label?: string;
}) {
  const asset = POO_SPEAKING_SPRITE_ASSETS[id];
  return (
    <Box
      role="img"
      aria-label={label || asset.label}
      w={`${size}px`}
      h={`${size}px`}
      flexShrink={0}
      bgImage={`url(${asset.sheet})`}
      bgRepeat="no-repeat"
      bgSize={`${asset.columns * 100}% ${asset.rows * 100}%`}
      bgPosition="0 0"
      sx={{
        imageRendering: 'auto',
        animation: animated ? `pooSpeakingSpriteSteps 1.15s steps(${asset.frames}) infinite` : 'none',
        '@keyframes pooSpeakingSpriteSteps': {
          from: { backgroundPosition: '0 0' },
          to: { backgroundPosition: '100% 100%' },
        },
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
      }}
    />
  );
}

function ScoreBubble({ label, score }: { label: string; score: number }) {
  return (
    <VStack gap="1" p="3" borderRadius="2xl" bg="rgba(255,255,255,0.72)" border="1px solid rgba(186,230,253,0.88)">
      <PooSpeakingSprite id="poo-score-bubble" size={44} animated={false} />
      <Text fontSize="xl" fontWeight="950" color="#1F6FD6">{Math.round(score)}</Text>
      <Text fontSize="xs" fontWeight="800" color="#52667A" textAlign="center">{label}</Text>
    </VStack>
  );
}

export function SpeakingCoachCard() {
  const recorder = useAudioRecorder();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SpeakingAssessmentResult | null>(null);
  const [message, setMessage] = useState('Bấm bắt đầu, đọc câu mẫu thật tự nhiên nha.');
  const startedAtRef = useRef(0);
  const autoStopRef = useRef<number | null>(null);
  const submittedBlobRef = useRef<Blob | null>(null);

  const clearAutoStop = useCallback(() => {
    if (autoStopRef.current) window.clearTimeout(autoStopRef.current);
    autoStopRef.current = null;
  }, []);

  const submitBlob = useCallback(async (audio: Blob, recordedMs: number) => {
    if (submittedBlobRef.current === audio) return;
    submittedBlobRef.current = audio;
    setIsSubmitting(true);
    setMessage('Poo đang nghe và chấm phát âm nè...');
    const response = await requestSpeakingAssessment({
      audio,
      targetText: TARGET_TEXT,
      lessonId: 'speaking-coach-mvp',
      durationMs: recordedMs,
    });
    setIsSubmitting(false);
    if (response.ok) {
      setResult(response.result);
      setMessage(response.result.pooMessage || response.result.shortFeedback || 'Poo nghe xong rồi nè 🐳');
    } else {
      setResult(null);
      setMessage(response.message);
    }
  }, []);

  const stop = useCallback(() => {
    clearAutoStop();
    const recordedMs = startedAtRef.current ? Math.min(Date.now() - startedAtRef.current, MAX_RECORDING_MS) : durationMs;
    setDurationMs(recordedMs);
    recorder.stopRecording();
  }, [clearAutoStop, durationMs, recorder]);

  const start = useCallback(async () => {
    setResult(null);
    setDurationMs(0);
    submittedBlobRef.current = null;
    recorder.resetRecording();
    setMessage('Chuẩn bị nha...');
    for (const value of [3, 2, 1]) {
      setCountdown(value);
      await new Promise((resolve) => window.setTimeout(resolve, 650));
    }
    setCountdown(null);
    startedAtRef.current = Date.now();
    await recorder.startRecording();
    setMessage('Poo đang nghe bạn nói nè 🫧');
    autoStopRef.current = window.setTimeout(() => stop(), MAX_RECORDING_MS);
  }, [recorder, stop]);

  useEffect(() => {
    if (!recorder.isRecording) return undefined;
    const timer = window.setInterval(() => {
      setDurationMs(Math.min(Date.now() - startedAtRef.current, MAX_RECORDING_MS));
    }, 250);
    return () => window.clearInterval(timer);
  }, [recorder.isRecording]);

  useEffect(() => {
    if (recorder.audioBlob && !recorder.isRecording) {
      void submitBlob(recorder.audioBlob, durationMs || Math.min(Date.now() - startedAtRef.current, MAX_RECORDING_MS));
    }
  }, [durationMs, recorder.audioBlob, recorder.isRecording, submitBlob]);

  useEffect(() => () => clearAutoStop(), [clearAutoStop]);

  const recordingSeconds = Math.ceil((MAX_RECORDING_MS - durationMs) / 1000);
  const coachSprite: PooSpeakingAssetId = recorder.isRecording
    ? 'poo-speaking-headset'
    : isSubmitting
      ? 'poo-jelly-listening'
      : result
        ? (result.overallScore >= 80 ? 'poo-starfish-badge' : 'poo-octopus-feedback')
        : 'poo-shell-mic';

  return (
    <Box
      w="min(760px, 100%)"
      p={{ base: '5', md: '7' }}
      borderRadius={{ base: '30px', md: '38px' }}
      bg="linear-gradient(145deg, rgba(255,255,255,0.90), rgba(221,245,255,0.76))"
      border="1px solid rgba(186,230,253,0.90)"
      boxShadow="0 26px 72px rgba(31,111,214,0.14)"
      position="relative"
      overflow="hidden"
    >
      <Box aria-hidden="true" position="absolute" inset="0" pointerEvents="none">
        {[0, 1, 2, 3, 4].map((index) => (
          <Box
            key={index}
            position="absolute"
            left={["12%", "24%", "72%", "84%", "50%"][index]}
            bottom="-16px"
            boxSize={["10px", "7px", "12px", "8px", "6px"][index]}
            borderRadius="full"
            bg="rgba(255,255,255,0.78)"
            border="1px solid rgba(186,230,253,0.78)"
            sx={{
              animation: recorder.isRecording ? `speakingBubble ${[6, 7, 6.5, 8, 7.5][index]}s ease-in-out infinite` : 'none',
              animationDelay: `${index * 0.4}s`,
              '@keyframes speakingBubble': {
                '0%': { transform: 'translateY(18px) scale(.86)', opacity: 0 },
                '24%': { opacity: 0.75 },
                '100%': { transform: 'translateY(-180px) scale(1.08)', opacity: 0 },
              },
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }}
          />
        ))}
      </Box>

      <VStack gap="5" position="relative" zIndex={1} textAlign="center">
        <HStack gap="4" justify="center" align="center">
          <Box w="96px" h="96px" display="grid" placeItems="center" position="relative">
            <PooSpeakingSprite id={coachSprite} size={92} animated={recorder.isRecording || isSubmitting} />
          </Box>
          <VStack gap="1" align="start" textAlign="left">
            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="950" color="#102A43" lineHeight="1.1">Poo nghe bạn nói nè 🐳</Text>
            <Text color="#52667A" fontWeight="750" fontSize="sm">{isSubmitting ? 'Sứa Nghe đang phân tích...' : recorder.isRecording ? 'Poo đeo tai nghe rồi đó' : result ? 'Bạn xem góp ý nhẹ nha' : 'Vỏ sò mic đã sẵn sàng'}</Text>
          </VStack>
        </HStack>

        <Box w="100%" p="5" borderRadius="3xl" bg="rgba(255,255,255,0.76)" border="1px solid rgba(186,230,253,0.86)">
          <Text fontSize="xs" fontWeight="900" color="#1F6FD6" textTransform="uppercase" letterSpacing="0.12em">Câu mẫu</Text>
          <Text mt="2" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="950" color="#0F172A">{TARGET_TEXT}</Text>
        </Box>

        {countdown ? (
          <Center boxSize="96px" borderRadius="full" bg="#1F6FD6" color="white" fontSize="5xl" fontWeight="950" boxShadow="0 18px 44px rgba(31,111,214,0.26)">{countdown}</Center>
        ) : null}

        <Text minH="24px" color={recorder.error ? '#DC2626' : '#52667A'} fontWeight="800">{recorder.error || message}</Text>

        {recorder.isRecording ? (
          <VStack gap="3">
            <Text color="#1F6FD6" fontWeight="900">Còn khoảng {Math.max(0, recordingSeconds)} giây</Text>
            <Button leftIcon={<Square size={18} />} onClick={stop} borderRadius="full" bg="#EF4444" color="white" _hover={{ bg: '#DC2626' }}>Dừng và chấm</Button>
          </VStack>
        ) : (
          <Button leftIcon={<Mic size={18} />} onClick={() => void start()} isLoading={isSubmitting || countdown !== null} borderRadius="full" bg="#1F6FD6" color="white" px="7" py="6" _hover={{ bg: '#185BB2' }}>
            <HStack gap="2"><PooSpeakingSprite id="poo-shell-mic" size={34} animated={false} /><Text>Bắt đầu nói</Text></HStack>
          </Button>
        )}

        {result ? (
          <VStack w="100%" gap="4" align="stretch">
            <SimpleGrid columns={{ base: 2, md: 5 }} spacing="3">
              <VStack gap="1" p="3" borderRadius="2xl" bg="rgba(255,255,255,0.72)" border="1px solid rgba(186,230,253,0.88)">
                <PooSpeakingSprite id="poo-crab-score" size={44} animated={false} />
                <Text fontSize="xl" fontWeight="950" color="#1F6FD6">{Math.round(result.overallScore)}</Text>
                <Text fontSize="xs" fontWeight="800" color="#52667A" textAlign="center">Tổng</Text>
              </VStack>
              <ScoreBubble label="Phát âm" score={result.pronunciationScore} />
              <VStack gap="1" p="3" borderRadius="2xl" bg="rgba(255,255,255,0.72)" border="1px solid rgba(186,230,253,0.88)">
                <PooSpeakingSprite id="poo-seahorse-fluency" size={44} animated={false} />
                <Text fontSize="xl" fontWeight="950" color="#1F6FD6">{Math.round(result.fluencyScore)}</Text>
                <Text fontSize="xs" fontWeight="800" color="#52667A" textAlign="center">Độ trôi</Text>
              </VStack>
              <ScoreBubble label="Đúng câu" score={result.accuracyScore} />
              <ScoreBubble label="Đủ từ" score={result.completenessScore} />
            </SimpleGrid>

            <Box p="4" borderRadius="3xl" bg="rgba(255,255,255,0.72)" border="1px solid rgba(186,230,253,0.86)" textAlign="left">
              <HStack gap="3" align="center" mb="2">
                <PooSpeakingSprite id="poo-octopus-feedback" size={52} animated={false} />
                <Text fontWeight="950" color="#102A43">Poo góp ý:</Text>
              </HStack>
              <Text mt="1" color="#52667A" fontWeight="750" lineHeight="1.7">{result.pooMessage || result.shortFeedback || result.encouragement}</Text>
              {result.transcript ? <Text mt="3" fontSize="sm" color="#64748B" fontWeight="700">Poo nghe được: “{result.transcript}”</Text> : null}
            </Box>

            {result.pronunciationIssues.length ? (
              <Box textAlign="left">
                <Text fontWeight="950" color="#102A43" mb="2">Từ cần luyện nhẹ:</Text>
                <Wrap>
                  {result.pronunciationIssues.slice(0, 5).map((issue, index) => (
                    <WrapItem key={`${issue.word}-${index}`}>
                      <Box px="3" py="2" borderRadius="2xl" bg="#E8F4FF" color="#1F6FD6" fontWeight="850" fontSize="sm">
                        {issue.word || 'Âm'} — {issue.vietnameseTip || issue.problem}
                      </Box>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
            ) : null}

            <Button leftIcon={<RotateCcw size={18} />} onClick={() => { recorder.resetRecording(); setResult(null); setMessage('Mình nói lại cho mượt hơn nha.'); }} borderRadius="full" variant="outline" borderColor="#BAE6FD" color="#1F6FD6" py="6">
              <HStack gap="2"><PooSpeakingSprite id="poo-turtle-retry" size={34} animated={false} /><Text>Nói lại</Text></HStack>
            </Button>
          </VStack>
        ) : null}
      </VStack>
    </Box>
  );
}