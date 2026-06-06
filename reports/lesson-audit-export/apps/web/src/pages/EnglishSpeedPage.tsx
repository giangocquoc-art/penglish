import { useEffect, useMemo, useRef, useState } from 'react';
import { saveEnglishSpeedAttempt } from '../lib/p-english/userDataAdapter';
import { Box, Button, Circle, Flex, HStack, Icon, Progress, Select, SimpleGrid, Tag, Text, Textarea, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Headphones, Keyboard, Mic2, RefreshCcw, RotateCcw, Sparkles, Volume2, Waves } from 'lucide-react';
import { createCardEntrance, createCorrectAnswerBurst, createWrongAnswerShake, killTimeline } from '../lib/animations/gsap-utils';
import { compareSpeechAttempt, createSpeechRecognizer, getSpeechLevels, getSpeechPrompts, isSpeechRecognitionSupported, type SpeechComparisonResult, type SpeechRecognizerController } from '../lib/p-english/speechAdapter';
import type { SpeechCefrLevel } from '../data/speech/speechTypes';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { OceanMascot } from '../components/p-english/OceanMascot';
import { OceanPageShell } from '../components/p-english/OceanPageShell';

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

function saveSpeechProgress(result: SpeechComparisonResult) {
  if (typeof window === 'undefined') return;
  try {
    const current = readSpeechProgress();
    window.localStorage.setItem('p-english:speech-progress', JSON.stringify({
      attempts: current.attempts + 1,
      bestScore: Math.max(current.bestScore, result.score),
      completed: current.completed + (result.score >= 68 ? 1 : 0),
      lastScore: result.score,
      lastPlayedAt: new Date().toISOString(),
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

export function EnglishSpeedPage() {
  const reducedMotion = useReducedMotion();
  const levels: SpeechLevelFilter[] = ['all', ...getSpeechLevels()];
  const [level, setLevel] = useState<SpeechLevelFilter>('A1');
  const prompts = useMemo(() => (level === 'all' ? getSpeechPrompts() : getSpeechPrompts(level)), [level]);
  const [promptIndex, setPromptIndex] = useState(0);
  const [manualText, setManualText] = useState('');
  const [heardText, setHeardText] = useState('');
  const [result, setResult] = useState<SpeechComparisonResult | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [recognitionMessage, setRecognitionMessage] = useState('');
  const [progress, setProgress] = useState(() => readSpeechProgress());
  const prompt = prompts[promptIndex] ?? prompts[0];
  const recognitionSupported = isSpeechRecognitionSupported();
  const recognizerRef = useRef<SpeechRecognizerController | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const manualInputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setPromptIndex(0);
    setManualText('');
    setHeardText('');
    setResult(null);
    setRecognitionMessage('');
  }, [level]);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const timeline = createCardEntrance(cardRef.current, { y: 18, duration: 0.42 });
    return () => killTimeline(timeline);
  }, [prompt?.id, reducedMotion]);

  useEffect(() => () => {
    recognizerRef.current?.abort();
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
  }, []);

  const evaluateAttempt = (text: string) => {
    if (!prompt || !text.trim()) return;
    const comparison = compareSpeechAttempt(prompt, text);
    setResult(comparison);
    saveSpeechProgress(comparison);
    saveEnglishSpeedAttempt({
      promptId: prompt.id,
      level: prompt.level,
      targetText: prompt.promptText,
      learnerText: text,
      score: comparison.score,
      feedbackJson: { matchedWords: comparison.matchedWords, missedWords: comparison.missingWords, extraWords: comparison.changedWords },
    }).catch(() => {});
    setProgress(readSpeechProgress());
    if (!reducedMotion) {
      killTimeline(comparison.score >= 68 ? createCorrectAnswerBurst(resultRef.current) : createWrongAnswerShake(resultRef.current));
    }
  };

  const startListening = () => {
    if (!prompt) return;
    setResult(null);
    setRecognitionMessage('');
    const recognizer = createSpeechRecognizer({
      lang: 'en-US',
      onStart: () => setIsListening(true),
      onEnd: () => setIsListening(false),
      onError: (message) => {
        setIsListening(false);
        setRecognitionMessage(`Trình duyệt chưa nghe được: ${message}. Bạn có thể nhập tay ở ô bên dưới.`);
      },
      onResult: (transcript) => {
        setHeardText(transcript);
        setManualText(transcript);
        evaluateAttempt(transcript);
      },
    });

    if (!recognizer) {
      setRecognitionMessage('Trình duyệt này chưa hỗ trợ nhận diện giọng nói. Hãy dùng chế độ nhập tay để so sánh câu đọc.');
      return;
    }

    recognizerRef.current = recognizer;
    try {
      recognizer.start();
    } catch {
      setIsListening(false);
      setRecognitionMessage('Micro chưa sẵn sàng. Hãy thử lại hoặc nhập tay câu bạn vừa nói.');
    }
  };

  const stopListening = () => {
    recognizerRef.current?.stop();
    setIsListening(false);
  };

  const goNext = () => {
    setPromptIndex((value) => nextPromptIndex(value, prompts.length));
    setManualText('');
    setHeardText('');
    setResult(null);
    setRecognitionMessage('');
    window.setTimeout(() => manualInputRef.current?.focus(), 0);
  };

  const retry = () => {
    setManualText('');
    setHeardText('');
    setResult(null);
    setRecognitionMessage('');
    window.setTimeout(() => manualInputRef.current?.focus(), 0);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === 'TEXTAREA' || target?.tagName === 'INPUT' || target?.tagName === 'SELECT';
      if (event.key === 'Enter' && !event.shiftKey && isTyping) {
        event.preventDefault();
        if (result) goNext();
        else evaluateAttempt(manualText);
        return;
      }
      if (isTyping) return;
      if (event.key.toLowerCase() === 'r') {
        event.preventDefault();
        retry();
      }
      if (event.key.toLowerCase() === 'n') {
        event.preventDefault();
        goNext();
      }
      if (event.key === 'Enter' && result) {
        event.preventDefault();
        goNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [manualText, result, prompts.length]);

  const sessionProgress = prompts.length ? ((promptIndex + 1) / prompts.length) * 100 : 0;

  return (
    <OceanPageShell variant="speed" overlayStrength="medium" minH="calc(100vh - 68px)" px={{ base: 4, md: 5 }} py={{ base: 5, md: 5 }} pb={{ base: 28, lg: 8 }}>
      <Box maxW="1080px" mx="auto">
        <HStack mb="4" justify="space-between" align="center" wrap="wrap" gap="3">
          <Button as={Link} to="/learning-path" leftIcon={<Icon as={ArrowLeft} />} variant="ghost" color={COLORS.deepBlue} borderRadius="full">
            Về lộ trình
          </Button>
          <Tag data-testid="english-speed-mode-badge" size="lg" borderRadius="full" bg="rgba(255,255,255,0.78)" border="1px solid" borderColor="#BAE6FD" color={COLORS.text} px="4" py="2">
            <Icon as={Mic2} boxSize="4" mr="2" color={COLORS.deepBlue} /> Chế độ phát âm nhanh
          </Tag>
        </HStack>

        <Flex bg="rgba(255,255,255,0.86)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: 5, md: 5 }} boxShadow="0 18px 46px rgba(31, 111, 214, 0.09)" gap="4" direction={{ base: 'column', lg: 'row' }} align="center" backdropFilter="blur(18px)">
          <Box flex="1" minW="0">
            <HStack gap="2" mb="3" wrap="wrap">
              <Tag borderRadius="full" bg={COLORS.softAqua} color={COLORS.deepBlue}><Icon as={Waves} boxSize="4" mr="1.5" /> App-native</Tag>
              <Tag borderRadius="full" bg="#FFF7ED" color="#9A3412"><Icon as={Keyboard} boxSize="4" mr="1.5" /> Micro không bắt buộc</Tag>
            </HStack>
            <Text as="h1" fontSize={{ base: '3xl', md: '4xl', xl: '5xl' }} lineHeight="1" fontWeight="950" color={COLORS.text}>English Speed</Text>
            <Text mt="3" fontSize={{ base: 'md', md: 'md', xl: 'lg' }} color={COLORS.muted} maxW="640px" lineHeight="1.6">
              Một phòng phát âm gọn: nghe mẫu, đọc theo, rồi nói bằng micro hoặc nhập tay để nhận phản hồi dễ hiểu.
            </Text>
          </Box>
          <HStack gap="4" align="center" w={{ base: '100%', lg: 'auto' }}>
            <Box display={{ base: 'none', md: 'block' }} pointerEvents="none">
              <OceanMascot mascot="caNguaToc" pose="dash" size="lg" decorative motion="swim" />
            </Box>
          <SimpleGrid columns={{ base: 2, md: 4 }} gap="3" w={{ base: '100%', lg: '390px' }}>
            <StatCard label="Prompt" value={prompts.length.toString()} tone="blue" />
            <StatCard label="Đã luyện" value={progress.attempts.toString()} tone="green" />
            <StatCard label="Best" value={progress.bestScore.toString()} tone="amber" />
            <StatCard label="Mic" value={recognitionSupported ? 'Có' : 'Nhập tay'} tone={recognitionSupported ? 'green' : 'red'} />
          </SimpleGrid>
          </HStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, lg: 12 }} gap="4" mt="5" alignItems="start">
          <Box ref={cardRef} bg="rgba(255,255,255,0.92)" backdropFilter="blur(16px)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: 5, md: 5 }} gridColumn={{ lg: 'span 8' }} boxShadow="0 16px 38px rgba(31, 111, 214, 0.08)">
            <HStack justify="space-between" align="start" wrap="wrap" gap="4">
              <Box minW="0">
                <HStack gap="2" wrap="wrap">
                  <Tag borderRadius="full" bg={COLORS.softBlue} color={COLORS.deepBlue}>{prompt?.level}</Tag>
                  <Tag borderRadius="full" bg="#F0FDF4" color="#166534">{prompt?.type}</Tag>
                </HStack>
                <Text mt="3" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="950" color={COLORS.text}>{prompt?.titleVi}</Text>
                <Text mt="1" color={COLORS.muted} fontWeight="700">{prompt?.vietnameseMeaning}</Text>
              </Box>
              <Select aria-label="Chọn cấp độ luyện phát âm" maxW={{ base: '100%', sm: '210px' }} value={level} onChange={(event) => setLevel(event.target.value as SpeechLevelFilter)} bg="white" borderColor={COLORS.border} borderRadius="2xl" h="46px">
                {levels.map((item) => <option key={item} value={item}>{LEVEL_LABELS[item]}</option>)}
              </Select>
            </HStack>

            <Box mt="4" p={{ base: 5, md: 5 }} borderRadius="3xl" bg="linear-gradient(135deg, #F8FCFF 0%, #FFFFFF 100%)" border="1px solid" borderColor="#BAE6FD">
              <Text fontSize="sm" color={COLORS.muted} fontWeight="900">Câu luyện {promptIndex + 1}/{prompts.length}</Text>
              <Text mt="3" fontSize={{ base: '2xl', md: '3xl', xl: '4xl' }} fontWeight="950" color={COLORS.text} lineHeight="1.16">{prompt?.promptText}</Text>
              <Text mt="3" color={COLORS.deepBlue} fontWeight="800">{prompt?.slowHintVi}</Text>
              <Progress mt="4" value={sessionProgress} colorScheme="blue" borderRadius="full" h="8px" bg={COLORS.softBlue} />

              <HStack mt="4" gap="3" wrap="wrap">
                <Button borderRadius="full" leftIcon={<Icon as={Volume2} />} bg={COLORS.deepBlue} color="white" _hover={{ bg: '#1557B8' }} onClick={() => prompt && speakEnglish(prompt.promptText)}>
                  Nghe mẫu
                </Button>
                <Button borderRadius="full" leftIcon={<Icon as={Headphones} />} variant="outline" borderColor={COLORS.border} bg="white" onClick={() => prompt && speakEnglish(prompt.promptText, true)}>
                  Nghe chậm
                </Button>
                <Button borderRadius="full" leftIcon={<Icon as={Mic2} />} bg={isListening ? COLORS.red : COLORS.oceanBlue} color="white" _hover={{ bg: isListening ? '#DC2626' : COLORS.deepBlue }} aria-label={isListening ? 'Dừng nghe bằng micro' : 'Bắt đầu nói bằng micro'} aria-pressed={isListening} onClick={isListening ? stopListening : startListening}>
                  {isListening ? 'Dừng nghe' : 'Nói bằng micro'}
                </Button>
              </HStack>

              {!recognitionSupported || recognitionMessage ? (
                <Box mt="4" p="4" borderRadius="2xl" bg="#FFF7ED" border="1px solid #FED7AA" color="#9A3412" fontWeight="700" role="status" aria-live="polite">
                  {recognitionMessage || 'Micro có thể không hoạt động trên trình duyệt này. Bạn vẫn học bình thường: nghe mẫu, đọc theo, rồi nhập tay câu vừa nói để so sánh.'}
                </Box>
              ) : null}

              {heardText ? <Text mt="4" color={COLORS.muted} fontWeight="700">Trình duyệt nghe được: <b>{heardText}</b></Text> : null}

              <Box mt="4" p="4" borderRadius="2xl" bg="rgba(232,244,255,0.62)" border="1px solid" borderColor={COLORS.border}>
                <Text fontSize="sm" fontWeight="900" color={COLORS.muted} mb="2">Nhập tay dự phòng · Enter kiểm tra · R thử lại · N câu tiếp</Text>
                <Textarea data-testid="english-speed-manual-textarea" ref={manualInputRef} value={manualText} onChange={(event) => setManualText(event.target.value)} placeholder="Gõ lại câu bạn vừa nói, ví dụ: Hello, my name is Anna." aria-label="Nhập câu trả lời thủ công" minH={{ base: '92px', md: '76px' }} borderRadius="2xl" borderColor={COLORS.border} bg="white" _focusVisible={{ outline: '3px solid', outlineColor: COLORS.oceanBlue, outlineOffset: '2px' }} />
                <HStack mt="3" gap="3" wrap="wrap">
                  <Button data-testid="english-speed-manual-check" borderRadius="full" leftIcon={<Icon as={CheckCircle2} />} bg={COLORS.green} color="white" _hover={{ bg: '#16A34A' }} onClick={() => evaluateAttempt(manualText)} isDisabled={!manualText.trim()}>
                    So sánh câu đọc
                  </Button>
                  <Button data-testid="english-speed-retry" borderRadius="full" leftIcon={<Icon as={RotateCcw} />} variant="outline" borderColor={COLORS.border} bg="white" onClick={retry}>Thử lại</Button>
                  <Button data-testid="english-speed-next" borderRadius="full" leftIcon={<Icon as={RefreshCcw} />} variant="ghost" color={COLORS.deepBlue} onClick={goNext}>Câu tiếp theo</Button>
                </HStack>
              </Box>
            </Box>
          </Box>

          <VStack align="stretch" gap="3" gridColumn={{ lg: 'span 4' }}>
            <Box bg="rgba(255,255,255,0.82)" backdropFilter="blur(16px)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p="4" boxShadow="0 12px 28px rgba(31, 111, 214, 0.06)">
              <HStack gap="3" align="center"><OceanMascot mascot="caNguaToc" pose="coach" size="sm" decorative motion="pulse" /><Text fontSize="lg" fontWeight="950" color={COLORS.text}>Huấn luyện viên tốc độ</Text></HStack>
              <VStack align="stretch" mt="3" gap="2">
                {prompt?.whaleCoachLines.slice(0, 2).map((line) => <Tip key={line} text={line} />)}
              </VStack>
            </Box>
            <Box bg="rgba(248,252,255,0.76)" backdropFilter="blur(16px)" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p="4" boxShadow="0 10px 24px rgba(31, 111, 214, 0.05)">
              <Text fontSize="lg" fontWeight="950" color={COLORS.text}>Tập trung âm</Text>
              <HStack mt="3" wrap="wrap" gap="2">{prompt?.focusSounds.map((sound) => <Tag key={sound} borderRadius="full" bg={COLORS.softAqua} color={COLORS.deepBlue}>{sound}</Tag>)}</HStack>
              <VStack align="stretch" mt="3" gap="2">{prompt?.retryTipsVi.slice(0, 2).map((tip) => <Tip key={tip} text={tip} />)}</VStack>
            </Box>
          </VStack>
        </SimpleGrid>

        {result && (
          <Box ref={resultRef} mt="6" bg="rgba(255,255,255,0.92)" backdropFilter="blur(16px)" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" p={{ base: 5, md: 6 }} boxShadow="0 16px 38px rgba(31, 111, 214, 0.08)" role="status" aria-live="polite">
            <HStack justify="space-between" align="start" wrap="wrap" gap="4">
              <Box>
                <HStack gap="2" wrap="wrap"><Icon as={Sparkles} color={COLORS.oceanBlue} /><Text fontSize="2xl" fontWeight="950" color={COLORS.text}>Phản hồi phát âm</Text></HStack>
                <Text mt="2" color={COLORS.muted} fontWeight="700">{result.feedbackVi}</Text>
              </Box>
              <Circle size="92px" bg={result.score >= 86 ? '#F0FDF4' : result.score >= 68 ? COLORS.yellow : '#FEF2F2'} color={result.score >= 86 ? '#166534' : result.score >= 68 ? '#9A3412' : '#991B1B'} fontWeight="950" fontSize="2xl">{result.score}</Circle>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} gap="3" mt="6">
              <WordPanel title="Từ khớp" words={result.matchedWords} tone="green" empty="Chưa khớp từ nào." />
              <WordPanel title="Từ còn thiếu" words={result.missingWords} tone="red" empty="Không thiếu từ chính." />
              <WordPanel title="Từ nghe/nhập lệch" words={result.changedWords} tone="amber" empty="Không có từ lệch đáng chú ý." />
            </SimpleGrid>
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
    red: { bg: '#FEF2F2', color: '#991B1B', icon: Keyboard },
  }[tone];
  return (
    <Box bg={palette.bg} color={palette.color} border="1px solid rgba(255,255,255,0.72)" borderRadius="2xl" p="3">
      <HStack justify="space-between" align="start"><Box><Text fontSize="xs" fontWeight="800" textTransform="uppercase" opacity="0.75">{label}</Text><Text fontSize="xl" fontWeight="950">{value}</Text></Box><Icon as={palette.icon} boxSize="5" /></HStack>
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

function WordPanel({ title, words, tone, empty }: { title: string; words: string[]; tone: 'green' | 'red' | 'amber'; empty: string }) {
  const palette = {
    green: { bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' },
    red: { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA' },
    amber: { bg: '#FFF7ED', color: '#9A3412', border: '#FED7AA' },
  }[tone];
  return (
    <Box p="4" borderRadius="2xl" bg={palette.bg} border="1px solid" borderColor={palette.border}>
      <Text fontWeight="950" color={palette.color}>{title}</Text>
      <HStack mt="3" wrap="wrap" gap="2">
        {words.length ? words.map((word) => <Tag key={word} borderRadius="full" bg="white" color={palette.color}>{word}</Tag>) : <Text color={palette.color} fontWeight="700">{empty}</Text>}
      </HStack>
    </Box>
  );
}
