import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Circle, Flex, HStack, Icon, Progress, Select, SimpleGrid, Tag, Text, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle2, Headphones, Mic2, RefreshCcw, RotateCcw, Sparkles, Volume2, Waves } from 'lucide-react';
import { createCardEntrance, killTimeline } from '../lib/animations/gsap-utils';
import { getSpeechLevels, getSpeechPrompts } from '../lib/p-english/speechAdapter';
import type { SpeechCefrLevel } from '../data/speech/speechTypes';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { OceanMascot } from '../components/p-english/OceanMascot';
import { OceanPageShell } from '../components/p-english/OceanPageShell';
import { recordLearningActivity } from '../lib/p-english/daily-rewards';

const COLORS = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  text: '#102A43',
  muted: '#52667A',
  softAqua: '#DDF5FF',
  softBlue: '#E8F4FF',
  oceanBlue: '#2F9EEB',
  deepBlue: '#1F6FD6',
  green: '#22C55E',
  amber: '#F59E0B',
  red: '#EF4444',
  border: '#D7E8F5',
  yellow: '#FFF3C4',
};

type SpeechLevelFilter = SpeechCefrLevel | 'all';

const RECORDED_FEEDBACK_MESSAGE = 'P-English đã ghi âm câu đọc của bạn. Chấm phát âm chi tiết sẽ được mở ở bản sau.';

const LEVEL_LABELS: Record<SpeechLevelFilter, string> = {
  all: 'Tất cả cấp độ',
  A1: 'A1 · câu ngắn',
  A2: 'A2 · tình huống quen',
  B1: 'B1 · câu dài hơn',
  B2: 'B2 · trình bày rõ ý',
};

function speakEnglish(text: string, slow = false) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = slow ? 0.68 : 0.86;
  window.speechSynthesis.speak(utterance);
}

function readSpeechProgress() {
  if (typeof window === 'undefined') return { attempts: 0, bestScore: 0, completed: 0 };
  try {
    const parsed = JSON.parse(window.localStorage.getItem('p-english:speech-progress') ?? '{}');
    return {
      attempts: Number(parsed.attempts ?? 0),
      bestScore: Number(parsed.bestScore ?? 0),
      completed: Number(parsed.completed ?? 0),
    };
  } catch {
    return { attempts: 0, bestScore: 0, completed: 0 };
  }
}

function saveLocalRecordingProgress() {
  if (typeof window === 'undefined') return;
  try {
    const current = readSpeechProgress();
    window.localStorage.setItem('p-english:speech-progress', JSON.stringify({
      ...current,
      attempts: current.attempts + 1,
      lastPlayedAt: new Date().toISOString(),
      lastRecordingMode: 'local-media-recorder',
    }));

    const missions = JSON.parse(window.localStorage.getItem('p-english:today-missions') ?? '{}');
    window.localStorage.setItem('p-english:today-missions', JSON.stringify({ ...missions, speedGames: Math.max(Number(missions.speedGames ?? 0), 1) }));
    window.dispatchEvent(new Event('p-english:local-progress-updated'));
  } catch {
    // Pronunciation practice stays usable even if local storage is unavailable.
  }
}

function nextPromptIndex(current: number, total: number) {
  return total ? (current + 1) % total : 0;
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function EnglishSpeedPage() {
  const reducedMotion = useReducedMotion();
  const levels: SpeechLevelFilter[] = ['all', ...getSpeechLevels()];
  const [level, setLevel] = useState<SpeechLevelFilter>('A1');
  const prompts = useMemo(() => (level === 'all' ? getSpeechPrompts() : getSpeechPrompts(level)), [level]);
  const [promptIndex, setPromptIndex] = useState(0);
  const [progress, setProgress] = useState(() => readSpeechProgress());
  const prompt = prompts[promptIndex] ?? prompts[0];
  const cardRef = useRef<HTMLDivElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const savedRecordingRef = useRef('');
  const {
    state: recorderState,
    errorMessage,
    audioUrl,
    durationSeconds,
    startRecording,
    stopRecording,
    resetRecording,
    isSupported: recordingSupported,
  } = useAudioRecorder();
  const isRecording = recorderState === 'recording';
  const isRequestingPermission = recorderState === 'requesting';
  const hasRecordedAudio = recorderState === 'recorded' && Boolean(audioUrl);

  useEffect(() => {
    setPromptIndex(0);
  }, [level]);

  useEffect(() => {
    resetRecording();
    savedRecordingRef.current = '';
  }, [prompt?.id, resetRecording]);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const timeline = createCardEntrance(cardRef.current, { y: 18, duration: 0.42 });
    return () => killTimeline(timeline);
  }, [prompt?.id, reducedMotion]);

  useEffect(() => () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
  }, []);

  useEffect(() => {
    if (!hasRecordedAudio || !audioUrl || savedRecordingRef.current === audioUrl) return;
    savedRecordingRef.current = audioUrl;
    saveLocalRecordingProgress();
    recordLearningActivity('english-speed', prompt?.id ?? 'local-recording');
    setProgress(readSpeechProgress());
    if (!reducedMotion) {
      const timeline = createCardEntrance(resultRef.current, { y: 14, duration: 0.36 });
      return () => killTimeline(timeline);
    }
    return undefined;
  }, [audioUrl, hasRecordedAudio, reducedMotion]);

  const handleRecordAction = () => {
    if (isRecording) stopRecording();
    else void startRecording();
  };

  const goNext = () => {
    if (isRecording) stopRecording();
    resetRecording();
    savedRecordingRef.current = '';
    setPromptIndex((value) => nextPromptIndex(value, prompts.length));
  };

  const retry = () => {
    resetRecording();
    savedRecordingRef.current = '';
  };

  const playRecording = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    void audioRef.current.play();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === 'INPUT' || target?.tagName === 'SELECT' || target?.tagName === 'TEXTAREA';
      if (isTyping) return;
      if (event.key.toLowerCase() === 'r') {
        event.preventDefault();
        retry();
      }
      if (event.key.toLowerCase() === 'n') {
        event.preventDefault();
        goNext();
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        if (hasRecordedAudio) goNext();
        else handleRecordAction();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasRecordedAudio, prompts.length, isRecording, recordingSupported, prompt?.id]);

  const sessionProgress = prompts.length ? ((promptIndex + 1) / prompts.length) * 100 : 0;
  const recordButtonLabel = isRecording ? 'Dừng ghi âm' : 'Ghi âm câu đọc';
  const bestScoreText = progress.bestScore > 0 ? String(progress.bestScore) : '—';
  const micStat = !recordingSupported
    ? { value: 'Không hỗ trợ', tone: 'red' as const }
    : isRequestingPermission
      ? { value: 'Đang xin quyền', tone: 'amber' as const }
      : isRecording
        ? { value: formatDuration(durationSeconds), tone: 'red' as const }
        : hasRecordedAudio
          ? { value: 'Đã ghi', tone: 'green' as const }
          : { value: 'Sẵn sàng', tone: 'green' as const };

  return (
    <OceanPageShell data-testid="speed-mobile-root" variant="speed" overlayStrength="medium" minH="calc(100vh - 68px)" px={{ base: 3, md: 5 }} py={{ base: 2, md: 5 }} pb={{ base: 'calc(var(--penglish-mobile-safe-bottom) + 132px)', lg: 8 }} sx={{ scrollPaddingBottom: 'calc(var(--penglish-mobile-safe-bottom) + 144px)' }}>
      <Box maxW="1120px" mx="auto" minW="0" pb={{ base: '164px', lg: '0' }}>
        <HStack mb={{ base: '2', md: '4' }} justify="space-between" align="center" wrap="wrap" gap="3">
          <Button as={Link} to="/learning-path" leftIcon={<Icon as={ArrowLeft} />} variant="ghost" color={COLORS.deepBlue} borderRadius="full">
            Về lộ trình
          </Button>
          <Tag data-testid="english-speed-mode-badge" size="lg" borderRadius="full" bg="rgba(255,255,255,0.78)" border="1px solid" borderColor="#BAE6FD" color={COLORS.text} px="4" py="2">
            <Icon as={Mic2} boxSize="4" mr="2" color={COLORS.deepBlue} /> Chế độ phát âm nhanh
          </Tag>
        </HStack>

        <Flex className="penglish-glass-card" bg="rgba(255,255,255,0.78)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: 2.5, md: 5 }} boxShadow="0 14px 34px rgba(31, 111, 214, 0.07)" gap={{ base: '2', md: '4' }} direction={{ base: 'column', lg: 'row' }} align="center" backdropFilter="blur(14px) saturate(1.1)">
          <Box flex="1" minW="0">
            <HStack gap="2" mb={{ base: '1.5', md: '3' }} wrap="wrap" display={{ base: 'none', sm: 'flex' }}>
              <Tag borderRadius="full" bg={COLORS.softAqua} color={COLORS.deepBlue}><Icon as={Waves} boxSize="4" mr="1.5" /> App-native</Tag>
              <Tag borderRadius="full" bg="#F0FDF4" color="#166534"><Icon as={Mic2} boxSize="4" mr="1.5" /> Local audio</Tag>
            </HStack>
            <Text as="h1" fontSize={{ base: 'xl', sm: '2xl', md: '4xl', xl: '5xl' }} lineHeight="0.98" fontWeight="950" color={COLORS.text}>English Speed</Text>
            <Text mt={{ base: '1', md: '3' }} fontSize={{ base: 'xs', sm: 'sm', md: 'md', xl: 'lg' }} color={COLORS.muted} maxW="640px" lineHeight={{ base: '1.35', md: '1.5' }} noOfLines={{ base: 2, md: undefined }}>
              Một phòng phát âm gọn: nghe mẫu, nghe chậm, ghi âm câu đọc và nghe lại ngay trên thiết bị của bạn.
            </Text>
          </Box>
          <HStack gap={{ base: '2', md: '4' }} align="center" w={{ base: '100%', lg: 'auto' }}>
            <Box display={{ base: 'none', md: 'block' }} pointerEvents="none">
              <OceanMascot mascot="caNguaToc" pose="dash" size="lg" decorative motion="swim" />
            </Box>
            <SimpleGrid data-testid="english-speed-stat-grid" columns={{ base: 2, md: 4 }} gap={{ base: '2', md: '3' }} w={{ base: '100%', lg: '520px' }} minW={{ lg: '500px' }}>
              <StatCard label="PROMPT" value={prompts.length.toString()} tone="blue" />
              <StatCard label="ĐÃ LUYỆN" value={progress.attempts.toString()} tone="green" />
              <StatCard label="BEST" value={bestScoreText} tone="amber" />
              <StatCard label="MIC" value={micStat.value} tone={micStat.tone} />
            </SimpleGrid>
          </HStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, lg: 12 }} gap={{ base: '3', md: '4' }} mt={{ base: '3', md: '5' }} alignItems="start">
          <Box data-testid="speed-current-prompt" ref={cardRef} className="penglish-glass-card" bg="rgba(255,255,255,0.78)" backdropFilter="blur(14px) saturate(1.1)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: 3, md: 5 }} gridColumn={{ lg: 'span 8' }} boxShadow="0 14px 34px rgba(31, 111, 214, 0.07)" scrollMarginBottom="calc(var(--penglish-mobile-safe-bottom) + 160px)">
            <HStack justify="space-between" align="start" wrap="wrap" gap="4">
              <Box minW="0">
                <HStack gap="2" wrap="wrap">
                  <Tag borderRadius="full" bg={COLORS.softBlue} color={COLORS.deepBlue}>{prompt?.level}</Tag>
                  <Tag borderRadius="full" bg="#F0FDF4" color="#166534">{prompt?.type}</Tag>
                </HStack>
                <Text mt={{ base: '2', md: '3' }} fontSize={{ base: 'lg', md: '2xl' }} fontWeight="950" color={COLORS.text}>{prompt?.titleVi}</Text>
                <Text mt="1" color={COLORS.muted} fontWeight="700" fontSize={{ base: 'sm', md: 'md' }} noOfLines={{ base: 1, md: undefined }}>{prompt?.vietnameseMeaning}</Text>
              </Box>
              <Select aria-label="Chọn cấp độ luyện phát âm" maxW={{ base: '100%', sm: '210px' }} value={level} onChange={(event) => setLevel(event.target.value as SpeechLevelFilter)} bg="white" borderColor={COLORS.border} borderRadius="2xl" h="46px">
                {levels.map((item) => <option key={item} value={item}>{LEVEL_LABELS[item]}</option>)}
              </Select>
            </HStack>

            <Box mt={{ base: '2', md: '4' }} p={{ base: 3, md: 5 }} borderRadius="3xl" bg="linear-gradient(135deg, rgba(248,252,255,0.72) 0%, rgba(255,255,255,0.82) 100%)" border="1px solid" borderColor="#BAE6FD" scrollMarginBottom="calc(var(--penglish-mobile-safe-bottom) + 160px)">
              <Text fontSize="sm" color={COLORS.muted} fontWeight="900">Câu luyện {promptIndex + 1}/{prompts.length}</Text>
              <Text mt={{ base: '2', md: '3' }} fontSize={{ base: 'xl', md: '3xl', xl: '4xl' }} fontWeight="950" color={COLORS.text} lineHeight="1.16">{prompt?.promptText}</Text>
              <Text mt="2" color={COLORS.deepBlue} fontWeight="800" fontSize={{ base: 'sm', md: 'md' }} noOfLines={{ base: 2, md: undefined }}>{prompt?.slowHintVi}</Text>
              <Progress mt={{ base: '3', md: '4' }} value={sessionProgress} colorScheme="blue" borderRadius="full" h="8px" bg={COLORS.softBlue} />

              <HStack mt={{ base: '3', md: '4' }} gap={{ base: '2', md: '3' }} wrap="wrap" scrollMarginBottom="calc(var(--penglish-mobile-safe-bottom) + 160px)">
                <Button borderRadius="full" leftIcon={<Icon as={Volume2} />} bg={COLORS.deepBlue} color="white" _hover={{ bg: '#1557B8' }} onClick={() => prompt && speakEnglish(prompt.promptText)}>
                  Nghe mẫu
                </Button>
                <Button borderRadius="full" leftIcon={<Icon as={Headphones} />} variant="outline" borderColor={COLORS.border} bg="white" onClick={() => prompt && speakEnglish(prompt.promptText, true)}>
                  Nghe chậm
                </Button>
                <Button data-testid="speed-record-button" borderRadius="full" leftIcon={<Icon as={Mic2} />} bg={isRecording ? COLORS.red : COLORS.oceanBlue} color="white" _hover={{ bg: isRecording ? '#DC2626' : COLORS.deepBlue }} aria-label={isRecording ? 'Dừng ghi âm' : 'Bắt đầu ghi âm câu đọc'} aria-pressed={isRecording} onClick={handleRecordAction} isDisabled={!recordingSupported || isRequestingPermission} isLoading={isRequestingPermission} loadingText="Đang xin quyền micro" flex={{ base: '1 1 100%', sm: '0 0 auto' }}>
                  {recordButtonLabel}
                </Button>
              </HStack>

              <Box data-testid="english-speed-recording-status" mt="4" p={{ base: '3', md: '4' }} borderRadius="2xl" bg={isRecording ? '#FEF2F2' : hasRecordedAudio ? '#F0FDF4' : 'rgba(232,244,255,0.62)'} border="1px solid" borderColor={isRecording ? '#FECACA' : hasRecordedAudio ? '#BBF7D0' : COLORS.border} role="status" aria-live="polite" display={{ base: isRecording || isRequestingPermission || hasRecordedAudio ? 'block' : 'none', md: 'block' }}>
                <HStack align="start" gap="3">
                  <Circle size="28px" bg="white" color={isRecording ? COLORS.red : hasRecordedAudio ? '#166534' : COLORS.deepBlue} flexShrink="0"><Icon as={isRecording ? Waves : Mic2} boxSize="4" /></Circle>
                  <Box>
                    <Text fontWeight="950" color={COLORS.text}>
                      {isRecording ? `Đang ghi âm câu đọc... ${formatDuration(durationSeconds)}` : isRequestingPermission ? 'Đang xin quyền micro...' : hasRecordedAudio ? `Đã ghi âm ${formatDuration(durationSeconds)}` : 'Quy trình luyện phát âm'}
                    </Text>
                    <Text mt="1" color={COLORS.muted} fontWeight="700" noOfLines={{ base: 2, md: undefined }}>
                      {hasRecordedAudio ? RECORDED_FEEDBACK_MESSAGE : 'Nghe mẫu → bấm ghi âm → đọc trọn câu → dừng ghi âm → nghe lại bản đọc ngay trên trình duyệt.'}
                    </Text>
                  </Box>
                </HStack>
              </Box>

              {errorMessage ? (
                <Box data-testid="english-speed-recording-error" mt="4" p="4" borderRadius="2xl" bg="#FFFBEB" border="1px solid #FDE68A" color="#9A3412" fontWeight="700" role="status" aria-live="polite">
                  <HStack align="start" gap="3">
                    <Icon as={AlertCircle} boxSize="5" />
                    <Text>{errorMessage}</Text>
                  </HStack>
                </Box>
              ) : null}

              <HStack mt="4" gap="3" wrap="wrap" display={{ base: hasRecordedAudio ? 'flex' : 'none', md: 'flex' }} scrollMarginBottom="calc(var(--penglish-mobile-safe-bottom) + 160px)">
                {audioUrl ? <audio ref={audioRef} src={audioUrl} preload="metadata" /> : null}
                {hasRecordedAudio ? (
                  <Button data-testid="english-speed-replay" borderRadius="full" leftIcon={<Icon as={Headphones} />} bg={COLORS.deepBlue} color="white" _hover={{ bg: '#1557B8' }} onClick={playRecording}>Nghe lại bài đọc của tôi</Button>
                ) : null}
                <Button data-testid="english-speed-retry" borderRadius="full" leftIcon={<Icon as={RotateCcw} />} variant="outline" borderColor={COLORS.border} bg="white" onClick={retry}>Ghi lại</Button>
                <Button data-testid="english-speed-next" borderRadius="full" leftIcon={<Icon as={RefreshCcw} />} variant="ghost" color={COLORS.deepBlue} onClick={goNext}>Câu tiếp theo</Button>
              </HStack>
            </Box>
          </Box>

          <VStack align="stretch" gap="3" gridColumn={{ lg: 'span 4' }} order={{ base: 2, lg: 0 }}>
            <Box as="details" className="penglish-glass-card" bg="rgba(255,255,255,0.76)" backdropFilter="blur(14px) saturate(1.1)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p="4" boxShadow="0 10px 24px rgba(31, 111, 214, 0.05)">
              <Box as="summary" cursor="pointer" fontWeight="950" color={COLORS.text}><HStack gap="3" align="center" display="inline-flex"><OceanMascot mascot="caNguaToc" pose="coach" size="sm" decorative motion="pulse" /><Text fontSize="lg" fontWeight="950" color={COLORS.text}>Huấn luyện viên tốc độ</Text></HStack></Box>
              <VStack align="stretch" mt="3" gap="2">
                {prompt?.whaleCoachLines.slice(0, 2).map((line) => <Tip key={line} text={line} />)}
              </VStack>
            </Box>
            <Box as="details" className="penglish-glass-card" bg="rgba(248,252,255,0.72)" backdropFilter="blur(14px) saturate(1.1)" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p="4" boxShadow="0 10px 24px rgba(31, 111, 214, 0.045)">
              <Box as="summary" cursor="pointer" fontSize="lg" fontWeight="950" color={COLORS.text}>Tập trung âm</Box>
              <HStack mt="3" wrap="wrap" gap="2">{prompt?.focusSounds.map((sound) => <Tag key={sound} borderRadius="full" bg={COLORS.softAqua} color={COLORS.deepBlue}>{sound}</Tag>)}</HStack>
              <VStack align="stretch" mt="3" gap="2">{prompt?.retryTipsVi.slice(0, 2).map((tip) => <Tip key={tip} text={tip} />)}</VStack>
            </Box>
          </VStack>
        </SimpleGrid>

        {hasRecordedAudio && (
          <Box data-testid="speed-feedback-panel" ref={resultRef} className="penglish-glass-card" mt="6" bg="rgba(255,255,255,0.78)" backdropFilter="blur(14px) saturate(1.1)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: 4, md: 6 }} boxShadow="0 14px 34px rgba(31, 111, 214, 0.07)" role="status" aria-live="polite">
            <HStack justify="space-between" align="start" wrap="wrap" gap="4">
              <Box>
                <HStack gap="2" wrap="wrap"><Icon as={Sparkles} color={COLORS.oceanBlue} /><Text fontSize="2xl" fontWeight="950" color={COLORS.text}>Bản ghi của bạn đã sẵn sàng</Text></HStack>
                <Text mt="2" color={COLORS.muted} fontWeight="700">{RECORDED_FEEDBACK_MESSAGE}</Text>
                <Text mt="2" color={COLORS.deepBlue} fontWeight="800">Âm thanh được giữ trong trạng thái trình duyệt của phiên này, không gửi lên máy chủ.</Text>
              </Box>
              <Circle size="92px" bg="#F0FDF4" color="#166534" fontWeight="950" fontSize="lg">{formatDuration(durationSeconds)}</Circle>
            </HStack>
          </Box>
        )}
      </Box>
    </OceanPageShell>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: 'blue' | 'green' | 'amber' | 'red' }) {
  const palette = {
    blue: { bg: COLORS.softBlue, color: COLORS.deepBlue, icon: Waves },
    green: { bg: '#F0FDF4', color: '#166534', icon: CheckCircle2 },
    amber: { bg: '#FFF7ED', color: '#9A3412', icon: Sparkles },
    red: { bg: '#FEF2F2', color: '#991B1B', icon: AlertCircle },
  }[tone];
  return (
    <Box data-testid={`english-speed-stat-${label.toLowerCase().replace(/\s+/g, '-')}`} bg={palette.bg} color={palette.color} border="1px solid rgba(255,255,255,0.72)" borderRadius="2xl" p={{ base: '1.5', sm: '2', md: '3' }} minH={{ base: '58px', sm: '64px', md: '78px' }} minW="0" overflow="visible">
      <HStack justify="space-between" align="start" gap={{ base: '1.5', md: '2' }} h="100%">
        <Box minW="0" flex="1">
          <Text fontSize={{ base: '9px', sm: '10px', md: 'xs' }} fontWeight="900" textTransform="uppercase" opacity="0.78" letterSpacing={{ base: '0.01em', md: '0.04em' }} lineHeight="1.1" whiteSpace="nowrap" wordBreak="normal">{label}</Text>
          <Text mt="1" fontSize={{ base: 'xs', sm: 'sm', md: 'lg', lg: 'xl' }} fontWeight="950" lineHeight="1.12" whiteSpace={value.length <= 10 ? 'nowrap' : 'normal'} overflowWrap="normal">{value}</Text>
        </Box>
        <Icon as={palette.icon} boxSize="5" flexShrink="0" display="none" />
      </HStack>
    </Box>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <HStack align="start" gap="3" p="3" borderRadius="2xl" bg="rgba(232,244,255,0.62)" border="1px solid" borderColor={COLORS.border}>
      <Circle size="24px" bg="white" color={COLORS.deepBlue} flexShrink="0"><Icon as={CheckCircle2} boxSize="4" /></Circle>
      <Text color={COLORS.text} fontWeight="650">{text}</Text>
    </HStack>
  );
}
