import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent, type SyntheticEvent } from 'react';
import { Box, Button, Flex, FormControl, FormLabel, HStack, Icon, Input, SimpleGrid, Tag, TagLabel, Text, Textarea, VStack, useToast } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { CheckCircle2, FileVideo, Headphones, Keyboard, Mic, Play, Sparkles, Upload, Video, Waves } from 'lucide-react';
import { OceanPageShell } from '../components/p-english/OceanPageShell';
import { GlassPanel } from '../components/p-english/OceanBackdrop';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { compareTypedAnswer, getYouTubeVideoIdFromUrl, splitTranscriptIntoSegments, type ComparedWord, type VideoLesson, type VideoSegment } from '../lib/video-lab';

const COLORS = {
  softAqua: '#DDF5FF',
  softBlue: '#E8F4FF',
  oceanBlue: '#2F9EEB',
  deepBlue: '#1F6FD6',
  text: '#102A43',
  muted: '#52667A',
  border: '#BAE6FD',
  green: '#22C55E',
  coral: '#F97366',
  yellow: '#FFF3C4',
};

const PIXEL_ASSETS = {
  microNormal: '/assets/shadowing-pixel/micro-normal.png',
  microListening: '/assets/shadowing-pixel/micro-listening.png',
  pooNeutral: '/assets/shadowing-pixel/poo-neutral.png',
  pooListening: '/assets/shadowing-pixel/poo-listening.png',
  pooHappy: '/assets/shadowing-pixel/poo-happy.png',
  bubbleCorner: '/assets/shadowing-pixel/bubble-corner.png',
  waveDivider: '/assets/shadowing-pixel/wave-divider.png',
};

const SAMPLE_TRANSCRIPT = `Welcome to my morning routine.
I drink a glass of water first.
Then I write down three small goals.
I open my window and take a deep breath.
After that, I review five new English words.
I practice one short sentence out loud.
Finally, I start my day with a calm mind.`;

const LinkedGlassPanel = GlassPanel as any;

type SourceType = 'youtube' | 'upload' | 'manual';
type LabMode = 'speak' | 'type';
type FallbackChoice = 'upload' | 'manual' | 'subtitle' | 'sample' | null;
type TypingStats = {
  correctWords: number;
  wrongWords: number;
  score: number;
  encouragement: string;
};

type YouTubeTranscriptFailureReason = 'NO_TRANSCRIPT' | 'VIDEO_ID_INVALID' | 'PACKAGE_ERROR' | 'RATE_LIMIT_OR_BLOCKED' | 'METHOD_NOT_ALLOWED';

type YouTubeTranscriptResponse = {
  ok: boolean;
  source?: 'youtube_caption';
  title?: string;
  packageName?: string;
  language?: string;
  segments?: Array<{
    index: number;
    startTime: number;
    endTime: number;
    text: string;
  }>;
  transcript?: string;
  reason?: YouTubeTranscriptFailureReason;
  message?: string;
};

type SourceCardProps = {
  active: boolean;
  description: string;
  icon: any;
  label: string;
  onClick: () => void;
};

function SourceCard({ active, description, icon, label, onClick }: SourceCardProps) {
  return (
    <Button
      onClick={onClick}
      h="auto"
      minH="108px"
      p="4"
      borderRadius="3xl"
      border="1px solid"
      borderColor={active ? COLORS.oceanBlue : COLORS.border}
      bg={active ? 'rgba(221,245,255,0.92)' : 'rgba(255,255,255,0.72)'}
      color={COLORS.text}
      justifyContent="flex-start"
      _hover={{ bg: COLORS.softBlue, borderColor: COLORS.oceanBlue }}
      whiteSpace="normal"
      textAlign="left"
      data-testid={`video-lab-source-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <HStack align="start" gap="3" w="100%">
        <Flex w="42px" h="42px" borderRadius="2xl" bg="white" color={COLORS.deepBlue} align="center" justify="center" flexShrink={0}>
          <Icon as={icon} boxSize="5" />
        </Flex>
        <Box minW="0">
          <Text fontWeight="950" color={COLORS.text}>{label}</Text>
          <Text mt="1" fontSize="sm" color={COLORS.muted} fontWeight="750" lineHeight="1.45">{description}</Text>
        </Box>
      </HStack>
    </Button>
  );
}

function difficultyLabel(difficulty?: VideoSegment['difficulty']) {
  if (difficulty === 'hard') return 'Khó';
  if (difficulty === 'medium') return 'Vừa';
  return 'Dễ';
}

function formatTime(seconds?: number) {
  if (typeof seconds !== 'number' || Number.isNaN(seconds)) return '';
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

function WordChip({ word }: { word: ComparedWord }) {
  const palette = word.status === 'correct'
    ? { bg: '#DCFCE7', border: '#BBF7D0', color: '#166534' }
    : word.status === 'wrong'
      ? { bg: '#FFF1F2', border: '#FECDD3', color: '#B91C1C' }
      : { bg: COLORS.yellow, border: '#FDE68A', color: '#92400E' };
  return (
    <Box as="span" display="inline-block" px="2.5" py="1.5" mr="1.5" mb="1.5" borderRadius="xl" bg={palette.bg} border="1px solid" borderColor={palette.border} color={palette.color} fontWeight="900" fontSize="sm">
      {word.status === 'wrong' && word.actual ? `${word.actual} → ${word.expected}` : word.expected}
    </Box>
  );
}

function buildLesson(sourceType: SourceType, title: string, sourceUrl: string, videoUrl: string, transcript: string): VideoLesson {
  const segments = splitTranscriptIntoSegments(transcript);
  return {
    id: `video-lab-${Date.now()}`,
    title: title.trim() || (sourceType === 'youtube' ? 'Bài học từ YouTube' : sourceType === 'upload' ? 'Bài học từ clip tải lên' : 'Bài học từ transcript'),
    sourceType,
    sourceUrl: sourceUrl.trim() || undefined,
    videoUrl: videoUrl || undefined,
    transcript,
    segments,
  };
}

function wordsFromText(text: string) {
  return text.split(/\s+/).filter(Boolean);
}

function getYouTubeTranscriptFailureMessage(reason?: YouTubeTranscriptFailureReason) {
  if (reason === 'VIDEO_ID_INVALID') return 'Poo chưa đọc được link YouTube này. Bạn kiểm tra lại link nhé.';
  if (reason === 'NO_TRANSCRIPT') return 'Video này chưa có phụ đề tiếng Anh hoặc Poo chưa lấy được lời thoại. Bạn có thể dán transcript hoặc upload phụ đề .srt/.vtt nhé.';
  if (reason === 'RATE_LIMIT_OR_BLOCKED') return 'YouTube đang chặn hoặc giới hạn lấy caption lúc này. Bạn thử lại sau, hoặc dán transcript/upload phụ đề .srt/.vtt nhé.';
  if (reason === 'PACKAGE_ERROR') return 'Poo gặp lỗi khi đọc caption từ YouTube. Bạn thử lại hoặc dán transcript thủ công nhé.';
  return 'Poo chưa lấy được lời thoại từ video này. Bạn có thể dán transcript hoặc upload phụ đề .srt/.vtt nhé.';
}

function buildTypingStats(comparison: ComparedWord[], hintCount: number, replayCount: number): TypingStats {
  const correctWords = comparison.filter((word) => word.status === 'correct').length;
  const wrongWords = comparison.filter((word) => word.status !== 'correct').length;
  const replayPenalty = Math.max(0, replayCount - 2);
  const score = (correctWords * 10) - (wrongWords * 2) - (hintCount * 3) - replayPenalty;
  const encouragement = score >= comparison.length * 8
    ? 'Poo vỗ tay bong bóng! Câu này rất chắc rồi đó.'
    : correctWords >= Math.max(1, Math.ceil(comparison.length / 2))
      ? 'Poo thấy bạn nghe được nhiều chữ rồi. Thêm một lượt nữa là mượt hơn.'
      : 'Không sao nha, Poo bơi cùng bạn. Nghe chậm lại rồi thử câu tiếp theo.';
  return { correctWords, wrongWords, score, encouragement };
}

export function VideoLabPage() {
  const toast = useToast();
  const [sourceType, setSourceType] = useState<SourceType>('youtube');
  const [title, setTitle] = useState('Video Lab cùng Poo');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState('');
  const [uploadedVideoName, setUploadedVideoName] = useState('');
  const [transcript, setTranscript] = useState('');
  const [transcriptError, setTranscriptError] = useState('');
  const [youtubeTranscriptStatus, setYoutubeTranscriptStatus] = useState('');
  const [isFetchingYouTubeTranscript, setIsFetchingYouTubeTranscript] = useState(false);
  const [showManualTranscript, setShowManualTranscript] = useState(false);
  const [showYoutubeFallbackCard, setShowYoutubeFallbackCard] = useState(false);
  const [fallbackChoice, setFallbackChoice] = useState<FallbackChoice>(null);
  const [youtubeToastMessage, setYoutubeToastMessage] = useState('');
  const [lesson, setLesson] = useState<VideoLesson | null>(null);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [mode, setMode] = useState<LabMode>('speak');
  const [typedAnswer, setTypedAnswer] = useState('');
  const [typedAnswersBySegment, setTypedAnswersBySegment] = useState<Record<string, string>>({});
  const [checkedSegments, setCheckedSegments] = useState<Record<string, boolean>>({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [typingHintCounts, setTypingHintCounts] = useState<Record<string, number>>({});
  const [typingReplayCounts, setTypingReplayCounts] = useState<Record<string, number>>({});
  const [speakMessage, setSpeakMessage] = useState('Chọn một câu, nghe đoạn mẫu nếu có thời gian, rồi Poo sẽ bật nút ghi âm.');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const uploadedVideoUrlRef = useRef('');
  const recordButtonGuardRef = useRef(0);
  const segmentListRef = useRef<HTMLDivElement | null>(null);
  const recorder = useAudioRecorder();

  const youtubeVideoId = useMemo(() => getYouTubeVideoIdFromUrl(youtubeUrl), [youtubeUrl]);
  const youtubeEmbedUrl = youtubeVideoId ? `https://www.youtube.com/embed/${youtubeVideoId}` : '';
  const activeSegment = lesson?.segments[activeSegmentIndex] ?? null;
  const activeSegmentId = activeSegment?.id ?? '';
  const typingChecked = activeSegmentId ? Boolean(checkedSegments[activeSegmentId]) : false;
  const hintCount = activeSegmentId ? typingHintCounts[activeSegmentId] ?? 0 : 0;
  const replayCount = activeSegmentId ? typingReplayCounts[activeSegmentId] ?? 0 : 0;
  const typedComparison = useMemo(() => activeSegment ? compareTypedAnswer(activeSegment.text, typedAnswer) : [], [activeSegment, typedAnswer]);
  const typingStats = useMemo(() => buildTypingStats(typedComparison, hintCount, replayCount), [typedComparison, hintCount, replayCount]);
  const hintedText = useMemo(() => activeSegment?.text.split(/\s+/).slice(0, hintCount).join(' ') ?? '', [activeSegment?.text, hintCount]);
  const hasTranscript = transcript.trim().length > 0;
  const shouldShowUploadFallback = fallbackChoice === 'upload';
  const shouldShowManualTextarea = fallbackChoice === 'manual' || fallbackChoice === 'sample';
  const shouldShowSubtitleUpload = fallbackChoice === 'subtitle';
  const shouldShowCreateFromTranscript = shouldShowUploadFallback || shouldShowManualTextarea || shouldShowSubtitleUpload;
  const canCreateLesson = shouldShowCreateFromTranscript
    ? hasTranscript
    : Boolean(youtubeVideoId) && !isFetchingYouTubeTranscript;

  useEffect(() => {
    uploadedVideoUrlRef.current = uploadedVideoUrl;
  }, [uploadedVideoUrl]);

  useEffect(() => {
    return () => {
      if (uploadedVideoUrlRef.current) URL.revokeObjectURL(uploadedVideoUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (!youtubeToastMessage) return;
    toast({
      title: youtubeToastMessage,
      status: 'success',
      duration: 3600,
      isClosable: true,
      position: 'top',
    });
  }, [toast, youtubeToastMessage]);

  const resetLessonPracticeState = () => {
    setActiveSegmentIndex(0);
    setTypedAnswer('');
    setTypedAnswersBySegment({});
    setCheckedSegments({});
    setShowAnswer(false);
    setTypingHintCounts({});
    setTypingReplayCounts({});
  };

  const scrollToSegments = () => {
    window.setTimeout(() => segmentListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const createManualLesson = () => {
    const nextLesson = buildLesson(sourceType, title, youtubeUrl, uploadedVideoUrl, transcript);
    if (!nextLesson.segments.length) {
      setTranscriptError('Poo chưa tách được câu nào. Bạn thử xuống dòng từng câu hoặc dán transcript rõ hơn nhé.');
      setLesson(null);
      return;
    }
    setTranscriptError('');
    setLesson(nextLesson);
    resetLessonPracticeState();
    setSpeakMessage(sourceType === 'upload' ? 'Clip đã sẵn sàng ở bản mock. Full auto transcription sẽ bật ở bước sau.' : 'Poo đã tách câu luyện từ transcript thủ công.');
    scrollToSegments();
  };

  const createYouTubeLessonFromCaptions = async () => {
    if (!youtubeVideoId) {
      setYoutubeTranscriptStatus('Poo chưa đọc được link YouTube này. Bạn kiểm tra lại link nhé.');
      setShowYoutubeFallbackCard(true);
      return;
    }

    setIsFetchingYouTubeTranscript(true);
    setYoutubeTranscriptStatus('Poo đang thử đọc lời thoại trong video...');
    setShowYoutubeFallbackCard(false);
    setFallbackChoice(null);
    setShowManualTranscript(false);
    setTranscriptError('');
    setLesson(null);

    try {
      const response = await fetch('/api/video-lab/youtube-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: youtubeUrl }),
      });
      const payload = await response.json() as YouTubeTranscriptResponse;
      const captionSegments = payload.segments ?? [];

      if (payload.ok && captionSegments.length) {
        const normalizedSegments: VideoSegment[] = captionSegments.map((segment, index) => ({
          id: `youtube-caption-${index + 1}`,
          index: index + 1,
          startTime: segment.startTime,
          endTime: segment.endTime,
          text: segment.text,
          difficulty: segment.text.split(/\s+/).filter(Boolean).length >= 16 ? 'hard' : segment.text.split(/\s+/).filter(Boolean).length >= 10 ? 'medium' : 'easy',
        }));
        setLesson({
          id: `video-lab-youtube-${Date.now()}`,
          title: title.trim() || payload.title || 'Bài học từ YouTube',
          sourceType: 'youtube',
          sourceUrl: youtubeUrl.trim(),
          transcript: payload.transcript ?? normalizedSegments.map((segment) => segment.text).join('\n'),
          segments: normalizedSegments,
        });
        resetLessonPracticeState();
        setShowManualTranscript(false);
        setShowYoutubeFallbackCard(false);
        setFallbackChoice(null);
        setYoutubeTranscriptStatus(`Poo đã tách được ${normalizedSegments.length} câu từ video này rồi!`);
        setYoutubeToastMessage(`Poo đã tách được ${normalizedSegments.length} câu từ video này rồi!`);
        setSpeakMessage('YouTube đã có caption để luyện. Hãy chọn một câu rồi luyện nói hoặc gõ theo câu.');
        scrollToSegments();
        return;
      }

      setShowYoutubeFallbackCard(true);
      setYoutubeTranscriptStatus(getYouTubeTranscriptFailureMessage(payload.reason));
    } catch {
      setShowYoutubeFallbackCard(true);
      setYoutubeTranscriptStatus('Poo chưa đọc được lời thoại từ video này. Có thể video chưa bật phụ đề hoặc YouTube không cho lấy caption.');
    } finally {
      setIsFetchingYouTubeTranscript(false);
    }
  };

  const createLesson = () => {
    if (!shouldShowCreateFromTranscript) {
      void createYouTubeLessonFromCaptions();
      return;
    }
    createManualLesson();
  };

  const useSampleTranscript = () => {
    setTranscript(SAMPLE_TRANSCRIPT);
    setTranscriptError('');
    setFallbackChoice('sample');
    setSourceType('manual');
    setShowManualTranscript(true);
  };

  const chooseFallback = (choice: Exclude<FallbackChoice, null>) => {
    setFallbackChoice(choice);
    setTranscriptError('');
    setShowManualTranscript(choice === 'manual' || choice === 'sample');
    if (choice === 'upload') setSourceType('upload');
    if (choice === 'manual' || choice === 'subtitle' || choice === 'sample') setSourceType('manual');
    if (choice === 'sample') setTranscript(SAMPLE_TRANSCRIPT);
  };

  const handleVideoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (uploadedVideoUrl) URL.revokeObjectURL(uploadedVideoUrl);
    setUploadedVideoName(file.name);
    setUploadedVideoUrl(URL.createObjectURL(file));
    setSourceType('upload');
    setSpeakMessage('Poo đã nhận clip. Giai đoạn này xử lý transcript đang ở mock; hãy dán hoặc upload phụ đề để tạo câu.');
  };

  const handleSubtitleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    void file.text().then((content) => {
      setTranscript(content);
      setTranscriptError('');
      setFallbackChoice('subtitle');
      setSourceType('manual');
      setShowManualTranscript(false);
    });
  };

  const playActiveSegment = async () => {
    if (!activeSegment) return;
    recorder.resetRecording();
    if (sourceType === 'upload' && videoRef.current && typeof activeSegment.startTime === 'number') {
      videoRef.current.currentTime = activeSegment.startTime;
      await videoRef.current.play().catch(() => undefined);
      if (typeof activeSegment.endTime === 'number') {
        const duration = Math.max(500, (activeSegment.endTime - activeSegment.startTime) * 1000);
        window.setTimeout(() => videoRef.current?.pause(), duration);
      }
      setSpeakMessage('Đã phát đoạn mẫu. Bấm ghi âm khi bạn sẵn sàng nói theo câu này.');
      return;
    }
    setSpeakMessage(sourceType === 'youtube' ? 'YouTube đang embed bên trái. Hãy tua video theo mốc, rồi bấm ghi âm để nói theo câu.' : 'Chưa có timestamp phát đoạn. Bạn đọc câu này rồi bấm ghi âm để luyện nói.');
  };

  const selectSegment = (index: number) => {
    const nextSegmentItem = lesson?.segments[index];
    setActiveSegmentIndex(index);
    setTypedAnswer(nextSegmentItem ? typedAnswersBySegment[nextSegmentItem.id] ?? '' : '');
    setShowAnswer(false);
    recorder.resetRecording();
    setSpeakMessage('Poo đã chọn câu mới. Nghe lại rồi luyện nói hoặc gõ theo câu.');
  };

  const nextSegment = () => {
    if (!lesson?.segments.length) return;
    selectSegment(Math.min(activeSegmentIndex + 1, lesson.segments.length - 1));
  };

  const updateTypedAnswer = (value: string) => {
    setTypedAnswer(value);
    if (!activeSegment) return;
    setTypedAnswersBySegment((current) => ({ ...current, [activeSegment.id]: value }));
    setCheckedSegments((current) => ({ ...current, [activeSegment.id]: false }));
  };

  const checkTypingAnswer = () => {
    if (!activeSegment) return;
    setCheckedSegments((current) => ({ ...current, [activeSegment.id]: true }));
  };

  const handleTypingKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    if (typingChecked) {
      if (lesson && activeSegmentIndex < lesson.segments.length - 1) nextSegment();
      return;
    }
    checkTypingAnswer();
  };

  const listenForTyping = async () => {
    if (!activeSegment) return;
    setTypingReplayCounts((current) => ({ ...current, [activeSegment.id]: (current[activeSegment.id] ?? 0) + 1 }));
    await playActiveSegment();
  };

  const revealHint = () => {
    if (!activeSegment) return;
    const targetWords = wordsFromText(activeSegment.text);
    const typedWords = wordsFromText(typedAnswer);
    const nextWord = targetWords[Math.min(typedWords.length, targetWords.length - 1)];
    if (!nextWord || typedWords.length >= targetWords.length) return;
    const nextAnswer = `${typedAnswer.trim() ? `${typedAnswer.trim()} ` : ''}${nextWord}`;
    setTypedAnswer(nextAnswer);
    setTypedAnswersBySegment((current) => ({ ...current, [activeSegment.id]: nextAnswer }));
    setCheckedSegments((current) => ({ ...current, [activeSegment.id]: false }));
    setTypingHintCounts((current) => ({ ...current, [activeSegment.id]: Math.min((current[activeSegment.id] ?? 0) + 1, targetWords.length) }));
  };

  const handleRecordButtonActivate = (event?: SyntheticEvent) => {
    event?.preventDefault();
    const now = Date.now();
    if (now - recordButtonGuardRef.current < 320) return;
    recordButtonGuardRef.current = now;
    if (recorder.isRecording) recorder.stopRecording();
    else void recorder.startRecording();
  };

  const recorderMessage = recorder.isRecording
    ? 'Poo đang nghe. Bấm Dừng thu để tắt micro ngay.'
    : recorder.audioBlob
      ? 'Poo đã nghe xong. Tính năng góp ý phát âm AI sẽ được bật ở bước sau.'
      : recorder.error || speakMessage;

  return (
    <OceanPageShell variant="shadowing" overlayStrength="medium" data-testid="video-lab-page" minH="calc(100vh - 68px)" px={{ base: '3', md: '5' }} pb={{ base: 'calc(var(--penglish-mobile-safe-bottom) + 96px)', lg: '10' }} pt={{ base: '3', md: 'calc(68px + 1.25rem)', lg: 'calc(72px + 1.5rem)' }} overflowX="hidden">
      <Box maxW="1180px" mx="auto" minW="0" pb={{ base: '128px', lg: '0' }}>
        <Flex className="penglish-glass-card" data-testid="video-lab-hero" mb={{ base: '3', md: '5' }} p={{ base: '3.5', md: '6' }} borderRadius="3xl" bg="rgba(255,255,255,0.78)" border="1px solid" borderColor={COLORS.border} boxShadow="0 18px 44px rgba(31,111,214,0.08)" direction={{ base: 'column', md: 'row' }} align={{ base: 'stretch', md: 'center' }} justify="space-between" gap="4" position="relative" overflow="hidden" backdropFilter="blur(14px) saturate(1.1)">
          <Box position="absolute" right="-58px" top="-64px" w="220px" h="220px" borderRadius="full" bg="rgba(221,245,255,0.78)" pointerEvents="none" />
          <Box minW="0" position="relative" flex="1">
            <HStack gap="2" wrap="wrap" mb="3">
              <Tag borderRadius="full" bg={COLORS.softBlue} color={COLORS.deepBlue}><TagLabel>Video Lab</TagLabel></Tag>
              <Tag borderRadius="full" bg="#F0FDF4" color="#15803D"><TagLabel>Nghe · Nói · Gõ theo câu</TagLabel></Tag>
            </HStack>
            <Text as="h1" fontSize={{ base: '2xl', md: '4xl' }} fontWeight="950" color={COLORS.text} lineHeight="1.06">Video Lab cùng Poo</Text>
            <Text mt="2" color={COLORS.muted} maxW="760px" fontSize={{ base: 'sm', md: 'md' }} fontWeight="750" lineHeight="1.7">Biến video tiếng Anh thành bài luyện nghe, nói và gõ theo từng câu. YouTube chỉ embed iframe; Poo sẽ tự thử lấy caption tiếng Anh nếu video có sẵn phụ đề.</Text>
          </Box>
          <Flex position="relative" align="center" justify="center" gap="3" flexShrink={0}>
            <Box as="img" src={PIXEL_ASSETS.pooNeutral} alt="Poo Video Lab" className="pooPixelMascot" w={{ base: '76px', md: '104px' }} h={{ base: '76px', md: '104px' }} />
            <Icon as={Video} boxSize={{ base: '10', md: '14' }} color={COLORS.deepBlue} />
          </Flex>
        </Flex>

        <SimpleGrid columns={{ base: 1, lg: lesson ? 2 : 1 }} gap={{ base: '3', md: '4' }} alignItems="start">
          <VStack align="stretch" gap="3">
            <GlassPanel data-testid="video-lab-source-panel" p={{ base: '3.5', md: '5' }} bg="rgba(255,255,255,0.76)" borderColor={COLORS.border} borderRadius="3xl">
              <HStack justify="space-between" align="start" mb="3" gap="3" wrap="wrap">
                <Box minW="0">
                  <Text fontWeight="950" color={COLORS.text} fontSize={{ base: 'lg', md: '2xl' }}>Tạo bài từ link YouTube</Text>
                  <Text mt="1" color={COLORS.muted} fontSize="sm" fontWeight="750">Dán link trước, Poo sẽ thử đọc phụ đề có sẵn. Nếu không được, bạn chọn fallback bên dưới.</Text>
                </Box>
                <Button as={Link} to="/shadowing" size="sm" borderRadius="full" bg="white" color={COLORS.deepBlue} border="1px solid" borderColor={COLORS.border} _hover={{ bg: COLORS.softBlue }}>Về Shadowing</Button>
              </HStack>

              <VStack align="stretch" gap="3">
                <FormControl>
                  <FormLabel fontWeight="900" color={COLORS.text}>Tên bài</FormLabel>
                  <Input value={title} onChange={(event) => setTitle(event.target.value)} bg="white" borderColor={COLORS.border} borderRadius="2xl" />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="900" color={COLORS.text}>YouTube link</FormLabel>
                  <Input value={youtubeUrl} onChange={(event) => { setYoutubeUrl(event.target.value); setYoutubeTranscriptStatus(''); setShowYoutubeFallbackCard(false); }} placeholder="https://www.youtube.com/watch?v=..." bg="white" borderColor={COLORS.border} borderRadius="2xl" />
                  <Text mt="1" color={youtubeUrl && !youtubeVideoId ? '#B45309' : COLORS.muted} fontSize="xs" fontWeight="800">Poo sẽ thử đọc phụ đề có sẵn. Nếu video không có phụ đề, bạn có thể upload clip hoặc dán transcript.</Text>
                  {youtubeTranscriptStatus && !showYoutubeFallbackCard ? (
                    <HStack mt="2" align="start" gap="2" p="3" borderRadius="2xl" bg={youtubeTranscriptStatus.startsWith('Poo đã tách') ? '#F0FDF4' : 'rgba(232,244,255,0.8)'} border="1px solid" borderColor={youtubeTranscriptStatus.startsWith('Poo đã tách') ? '#BBF7D0' : COLORS.border}>
                      <Box as="img" src={youtubeTranscriptStatus.startsWith('Poo đã tách') ? PIXEL_ASSETS.pooHappy : PIXEL_ASSETS.pooListening} alt="Poo trạng thái caption" className="pooPixelIcon" w="30px" h="30px" flexShrink={0} />
                      <Text color={youtubeTranscriptStatus.startsWith('Poo đã tách') ? '#166534' : COLORS.deepBlue} fontSize="sm" fontWeight="850" lineHeight="1.5">{youtubeTranscriptStatus}</Text>
                    </HStack>
                  ) : null}
                </FormControl>

                {!shouldShowCreateFromTranscript ? (
                  <Button onClick={createLesson} isDisabled={!canCreateLesson} isLoading={isFetchingYouTubeTranscript} loadingText="Poo đang thử đọc lời thoại trong video..." borderRadius="full" bg={COLORS.deepBlue} color="white" leftIcon={<Icon as={Sparkles} />} _hover={{ bg: COLORS.oceanBlue }} data-testid="video-lab-create-lesson">
                    Tạo bài học từ link
                  </Button>
                ) : null}

                {showYoutubeFallbackCard ? (
                  <Box p="3.5" borderRadius="3xl" bg="#FFFBEB" border="1px solid" borderColor="#FDE68A">
                    <HStack align="start" gap="3" mb="3">
                      <Box as="img" src={PIXEL_ASSETS.pooNeutral} alt="Poo fallback" className="pooPixelIcon" w="38px" h="38px" flexShrink={0} />
                      <Box minW="0">
                        <Text fontWeight="950" color={COLORS.text}>Poo chưa đọc được lời thoại từ video này.</Text>
                        <Text mt="1" color="#92400E" fontSize="sm" fontWeight="800" lineHeight="1.5">Có thể video chưa bật phụ đề hoặc YouTube không cho lấy caption.</Text>
                      </Box>
                    </HStack>
                    <SimpleGrid columns={{ base: 1, sm: 2 }} gap="2">
                      <Button justifyContent="flex-start" whiteSpace="normal" h="auto" py="3" borderRadius="2xl" bg={fallbackChoice === 'upload' ? COLORS.deepBlue : 'white'} color={fallbackChoice === 'upload' ? 'white' : COLORS.deepBlue} border="1px solid" borderColor={COLORS.border} leftIcon={<Icon as={FileVideo} />} onClick={() => chooseFallback('upload')}>Upload clip để Poo tự nghe</Button>
                      <Button justifyContent="flex-start" whiteSpace="normal" h="auto" py="3" borderRadius="2xl" bg={fallbackChoice === 'manual' ? COLORS.deepBlue : 'white'} color={fallbackChoice === 'manual' ? 'white' : COLORS.deepBlue} border="1px solid" borderColor={COLORS.border} leftIcon={<Icon as={Keyboard} />} onClick={() => chooseFallback('manual')}>Dán transcript thủ công</Button>
                      <Button justifyContent="flex-start" whiteSpace="normal" h="auto" py="3" borderRadius="2xl" bg={fallbackChoice === 'subtitle' ? COLORS.deepBlue : 'white'} color={fallbackChoice === 'subtitle' ? 'white' : COLORS.deepBlue} border="1px solid" borderColor={COLORS.border} leftIcon={<Icon as={Upload} />} onClick={() => chooseFallback('subtitle')}>Upload phụ đề .srt/.vtt</Button>
                      <Button justifyContent="flex-start" whiteSpace="normal" h="auto" py="3" borderRadius="2xl" bg={fallbackChoice === 'sample' ? COLORS.deepBlue : 'white'} color={fallbackChoice === 'sample' ? 'white' : COLORS.deepBlue} border="1px solid" borderColor={COLORS.border} leftIcon={<Icon as={Sparkles} />} onClick={useSampleTranscript}>Dùng transcript mẫu</Button>
                    </SimpleGrid>
                  </Box>
                ) : null}

                {shouldShowUploadFallback ? (
                  <FormControl>
                    <FormLabel fontWeight="900" color={COLORS.text}>Upload clip .mp4/.mov/.webm</FormLabel>
                    <Input type="file" accept="video/mp4,video/quicktime,video/webm" onChange={handleVideoUpload} bg="white" borderColor={COLORS.border} borderRadius="2xl" p="2" />
                    <Text mt="1" color={COLORS.muted} fontSize="xs" fontWeight="800">{uploadedVideoName ? `Đã chọn: ${uploadedVideoName}` : 'Cách này ổn định nhất vì Poo sẽ xử lý trực tiếp file của bạn.'}</Text>
                    <HStack mt="2" align="start" gap="2" p="3" borderRadius="2xl" bg="rgba(232,244,255,0.8)" border="1px solid" borderColor={COLORS.border}>
                      <Icon as={Upload} color={COLORS.deepBlue} />
                      <Text color={COLORS.deepBlue} fontSize="sm" fontWeight="850" lineHeight="1.5">Cách này ổn định nhất vì Poo sẽ xử lý trực tiếp file của bạn.</Text>
                    </HStack>
                  </FormControl>
                ) : null}

                {shouldShowSubtitleUpload ? (
                  <FormControl>
                    <FormLabel fontWeight="900" color={COLORS.text}>Upload phụ đề .srt/.vtt</FormLabel>
                    <Input type="file" accept=".srt,.vtt,text/vtt" onChange={handleSubtitleUpload} bg="white" borderColor={COLORS.border} borderRadius="2xl" p="2" />
                    <Text mt="1" color={COLORS.muted} fontSize="xs" fontWeight="800">Sau khi upload phụ đề, Poo sẽ tách từng câu để tạo bài luyện.</Text>
                    {transcriptError ? <Text mt="2" color="#B91C1C" fontSize="sm" fontWeight="850">{transcriptError}</Text> : null}
                  </FormControl>
                ) : null}

                {shouldShowManualTextarea ? (
                  <FormControl>
                    <FormLabel fontWeight="900" color={COLORS.text}>Transcript thủ công</FormLabel>
                    <Textarea value={transcript} onChange={(event) => { setTranscript(event.target.value); setTranscriptError(''); }} minH="180px" bg="white" borderColor={transcriptError ? '#FECACA' : COLORS.border} borderRadius="2xl" fontWeight="700" placeholder="Dán transcript hoặc nội dung SRT/VTT ở đây..." />
                    {transcriptError ? <Text mt="2" color="#B91C1C" fontSize="sm" fontWeight="850">{transcriptError}</Text> : null}
                  </FormControl>
                ) : null}

                {shouldShowCreateFromTranscript ? (
                  <Button onClick={createLesson} isDisabled={!canCreateLesson} borderRadius="full" bg={COLORS.deepBlue} color="white" leftIcon={<Icon as={Sparkles} />} _hover={{ bg: COLORS.oceanBlue }} data-testid="video-lab-create-lesson">
                    Tạo bài học
                  </Button>
                ) : null}
              </VStack>
            </GlassPanel>

            {lesson ? (
              <GlassPanel data-testid="video-lab-player" p={{ base: '3.5', md: '5' }} bg="rgba(255,255,255,0.76)" borderColor={COLORS.border} borderRadius="3xl">
                <HStack justify="space-between" mb="3" gap="3" wrap="wrap">
                  <Box minW="0">
                    <Text fontWeight="950" color={COLORS.text}>{lesson.title}</Text>
                    <Text color={COLORS.muted} fontSize="sm" fontWeight="750">{lesson.segments.length} câu luyện · {lesson.sourceType === 'youtube' ? 'YouTube embed' : lesson.sourceType === 'upload' ? 'Clip upload mock' : 'Transcript thủ công'}</Text>
                  </Box>
                  <Tag borderRadius="full" bg={COLORS.softBlue} color={COLORS.deepBlue}><TagLabel>{activeSegmentIndex + 1}/{lesson.segments.length}</TagLabel></Tag>
                </HStack>

                {lesson.sourceType === 'youtube' && youtubeEmbedUrl ? (
                  <Box as="iframe" title={lesson.title} src={youtubeEmbedUrl} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen w="100%" h={{ base: '210px', md: '320px' }} border="0" borderRadius="24px" bg="#102A43" />
                ) : lesson.sourceType === 'upload' && lesson.videoUrl ? (
                  <video ref={videoRef} src={lesson.videoUrl} controls style={{ width: '100%', borderRadius: 24, background: '#102A43', display: 'block' }} />
                ) : (
                  <Flex minH="210px" borderRadius="24px" bg="linear-gradient(135deg, #E8F4FF 0%, #F8FCFF 100%)" border="1px dashed" borderColor={COLORS.border} align="center" justify="center" textAlign="center" p="5" direction="column" gap="2">
                    <Icon as={Headphones} color={COLORS.deepBlue} boxSize="8" />
                    <Text fontWeight="900" color={COLORS.text}>Chưa có video phát trực tiếp</Text>
                    <Text color={COLORS.muted} fontSize="sm" fontWeight="750">Bạn vẫn có thể luyện nói và gõ theo transcript đã tách câu.</Text>
                  </Flex>
                )}
              </GlassPanel>
            ) : null}
          </VStack>

          {lesson ? (
            <VStack align="stretch" gap="3">
              <Box ref={segmentListRef}>
                <GlassPanel data-testid="video-lab-segments" p={{ base: '3.5', md: '4' }} bg="rgba(255,255,255,0.76)" borderColor={COLORS.border} borderRadius="3xl">
                <HStack justify="space-between" align="start" mb="3" gap="3">
                  <Box minW="0">
                    <Text fontWeight="950" color={COLORS.text}>Danh sách câu</Text>
                    <Text color={COLORS.muted} fontSize="sm" fontWeight="750">Bấm một câu để luyện nói hoặc gõ lại.</Text>
                  </Box>
                  <Box as="img" src={PIXEL_ASSETS.microNormal} alt="Micro" className="pooPixelIcon" w="36px" h="36px" />
                </HStack>
                <VStack align="stretch" gap="2" maxH={{ base: '260px', lg: '420px' }} overflowY="auto" pr="1">
                  {lesson.segments.map((segment, index) => {
                    const active = index === activeSegmentIndex;
                    return (
                      <Box key={segment.id} as="button" type="button" textAlign="left" onClick={() => selectSegment(index)} p="3" borderRadius="2xl" bg={active ? COLORS.softAqua : 'white'} border="1px solid" borderColor={active ? COLORS.oceanBlue : COLORS.border} w="100%" data-testid={`video-lab-segment-${segment.index}`}>
                        <HStack justify="space-between" gap="2" align="start">
                          <Box minW="0">
                            <Text fontWeight="950" color={COLORS.deepBlue} fontSize="xs">Câu {segment.index} {segment.startTime !== undefined ? `· ${formatTime(segment.startTime)}` : ''}</Text>
                            <Text mt="1" color={COLORS.text} fontWeight="850" lineHeight="1.45">{segment.text}</Text>
                          </Box>
                          <Tag size="sm" borderRadius="full" bg={segment.difficulty === 'hard' ? '#FFF1F2' : segment.difficulty === 'medium' ? COLORS.yellow : '#DCFCE7'} color={segment.difficulty === 'hard' ? '#B91C1C' : segment.difficulty === 'medium' ? '#92400E' : '#166534'}><TagLabel>{difficultyLabel(segment.difficulty)}</TagLabel></Tag>
                        </HStack>
                      </Box>
                    );
                  })}
                </VStack>
                </GlassPanel>
              </Box>

              {activeSegment ? (
                <GlassPanel data-testid="video-lab-lesson-mode" p={{ base: '3.5', md: '5' }} bg="rgba(255,255,255,0.78)" borderColor={COLORS.border} borderRadius="3xl" position="relative" overflow="hidden">
                  <Box as="img" src={PIXEL_ASSETS.bubbleCorner} alt="" className="pooPixelDecor" position="absolute" right="-8px" top="-8px" w="70px" opacity="0.18" />
                  <VStack align="stretch" gap="3" position="relative">
                    <HStack gap="2" wrap="wrap">
                      <Button size="sm" borderRadius="full" bg={mode === 'speak' ? COLORS.deepBlue : 'white'} color={mode === 'speak' ? 'white' : COLORS.deepBlue} border="1px solid" borderColor={COLORS.border} leftIcon={<Icon as={Mic} />} onClick={() => setMode('speak')}>Nói theo câu</Button>
                      <Button size="sm" borderRadius="full" bg={mode === 'type' ? COLORS.deepBlue : 'white'} color={mode === 'type' ? 'white' : COLORS.deepBlue} border="1px solid" borderColor={COLORS.border} leftIcon={<Icon as={Keyboard} />} onClick={() => setMode('type')}>Gõ theo câu</Button>
                    </HStack>

                    <Box p="3" borderRadius="2xl" bg="rgba(232,244,255,0.78)" border="1px solid" borderColor={COLORS.border}>
                      <Text fontSize="xs" color={COLORS.deepBlue} fontWeight="950">Câu {activeSegment.index}</Text>
                      <Text mt="1" color={COLORS.text} fontWeight="950" fontSize={{ base: 'lg', md: 'xl' }} lineHeight="1.35">{mode === 'type' && !showAnswer ? '••• ••• •••' : activeSegment.text}</Text>
                      {showAnswer && mode === 'type' ? <Text mt="1" color={COLORS.muted} fontWeight="750" fontSize="sm">Đáp án đã hiện để bạn đối chiếu.</Text> : null}
                    </Box>

                    {mode === 'speak' ? (
                      <VStack align="stretch" gap="3">
                        <HStack gap="2" wrap="wrap">
                          <Button borderRadius="full" bg="white" color={COLORS.deepBlue} border="1px solid" borderColor={COLORS.border} leftIcon={<Icon as={Play} />} onClick={() => void playActiveSegment()}>Nghe đoạn này</Button>
                          <Button className="shadowing-record-button" borderRadius="full" bg={recorder.isRecording ? '#EF4444' : COLORS.deepBlue} color="white" leftIcon={<Box as="img" src={recorder.isRecording ? PIXEL_ASSETS.microListening : PIXEL_ASSETS.microNormal} alt="Micro" className="pooPixelIcon" w="22px" h="22px" />} onClick={handleRecordButtonActivate} onPointerUp={handleRecordButtonActivate} onTouchEnd={handleRecordButtonActivate} _hover={{ bg: recorder.isRecording ? '#DC2626' : COLORS.oceanBlue }} aria-label={recorder.isRecording ? 'Dừng thu âm Video Lab' : 'Ghi âm Video Lab'} aria-pressed={recorder.isRecording} data-testid="video-lab-record-button">
                            {recorder.isRecording ? 'Dừng thu' : 'Ghi âm'}
                          </Button>
                        </HStack>
                        <HStack align="start" gap="3" p="3" borderRadius="2xl" bg={recorder.audioBlob ? '#F0FDF4' : recorder.isRecording ? '#FEF2F2' : 'rgba(255,255,255,0.72)'} border="1px solid" borderColor={recorder.audioBlob ? '#BBF7D0' : recorder.isRecording ? '#FECACA' : COLORS.border}>
                          <Box as="img" src={recorder.audioBlob ? PIXEL_ASSETS.pooHappy : recorder.isRecording ? PIXEL_ASSETS.pooListening : PIXEL_ASSETS.pooNeutral} alt="Poo nghe" className="pooPixelIcon" w="38px" h="38px" />
                          <Box minW="0">
                            <Text fontWeight="950" color={COLORS.text}>{recorder.audioBlob ? 'Poo đã nghe xong' : recorder.isRecording ? 'Đang thu âm' : 'Sẵn sàng nói theo câu'}</Text>
                            <Text mt="1" color={COLORS.muted} fontSize="sm" fontWeight="750" lineHeight="1.5">{recorderMessage}</Text>
                          </Box>
                        </HStack>
                      </VStack>
                    ) : (
                      <VStack align="stretch" gap="3">
                        <HStack gap="2" wrap="wrap" justify="space-between" align="center">
                          <Button borderRadius="full" bg="white" color={COLORS.deepBlue} border="1px solid" borderColor={COLORS.border} leftIcon={<Icon as={Headphones} />} onClick={() => void listenForTyping()}>Nghe lại</Button>
                          <Tag borderRadius="full" bg={replayCount > 2 ? '#FFFBEB' : COLORS.softBlue} color={replayCount > 2 ? '#92400E' : COLORS.deepBlue} border="1px solid" borderColor={replayCount > 2 ? '#FDE68A' : COLORS.border}>
                            <TagLabel>Đã nghe: {replayCount} lần</TagLabel>
                          </Tag>
                        </HStack>
                        {hintedText ? <Text color={COLORS.deepBlue} fontWeight="900" fontSize="sm">Gợi ý đã điền: {hintedText}</Text> : null}
                        <Textarea value={typedAnswer} onChange={(event) => updateTypedAnswer(event.target.value)} onKeyDown={handleTypingKeyDown} placeholder="Gõ câu bạn vừa nghe... Nhấn Enter để kiểm tra, Enter lần nữa để qua câu." bg="white" borderColor={typingChecked ? '#BBF7D0' : COLORS.border} borderRadius="2xl" minH="112px" fontWeight="800" />
                        <Box p="3" borderRadius="2xl" bg="rgba(248,252,255,0.9)" border="1px solid" borderColor={COLORS.border}>
                          <HStack mb="2" justify="space-between" gap="2" wrap="wrap">
                            <Text color={COLORS.text} fontWeight="950">So sánh từng chữ</Text>
                            <Text color={COLORS.muted} fontSize="xs" fontWeight="850">Enter: {typingChecked ? 'câu tiếp theo' : 'kiểm tra'}</Text>
                          </HStack>
                          {typingChecked ? typedComparison.map((word) => <WordChip key={word.id} word={word} />) : <Text color={COLORS.muted} fontSize="sm" fontWeight="750">Poo sẽ tô xanh chữ đúng, coral chữ sai, vàng chữ thiếu sau khi bạn kiểm tra.</Text>}
                        </Box>
                        {typingChecked ? (
                          <HStack align="start" gap="3" p="3" borderRadius="2xl" bg="#F0FDF4" border="1px solid" borderColor="#BBF7D0" wrap="wrap">
                            <Box as="img" src={PIXEL_ASSETS.pooHappy} alt="Poo cổ vũ" className="pooPixelIcon" w="40px" h="40px" flexShrink={0} />
                            <Box minW="0" flex="1">
                              <Text fontWeight="950" color={COLORS.text}>Kết quả câu này</Text>
                              <SimpleGrid columns={{ base: 1, sm: 3 }} gap="2" mt="2">
                                <Box p="2.5" bg="white" border="1px solid" borderColor="#BBF7D0" borderRadius="xl"><Text fontSize="xs" color={COLORS.muted} fontWeight="850">Đúng</Text><Text color="#166534" fontWeight="950">{typingStats.correctWords} từ</Text></Box>
                                <Box p="2.5" bg="white" border="1px solid" borderColor="#FECACA" borderRadius="xl"><Text fontSize="xs" color={COLORS.muted} fontWeight="850">Sai/thiếu</Text><Text color="#B91C1C" fontWeight="950">{typingStats.wrongWords} từ</Text></Box>
                                <Box p="2.5" bg="white" border="1px solid" borderColor={COLORS.border} borderRadius="xl"><Text fontSize="xs" color={COLORS.muted} fontWeight="850">Điểm</Text><Text color={COLORS.deepBlue} fontWeight="950">{typingStats.score}</Text></Box>
                              </SimpleGrid>
                              <Text mt="2" color={COLORS.muted} fontSize="sm" fontWeight="800" lineHeight="1.5">{typingStats.encouragement}</Text>
                            </Box>
                          </HStack>
                        ) : null}
                        <HStack gap="2" wrap="wrap">
                          <Button borderRadius="full" bg="white" color={COLORS.deepBlue} border="1px solid" borderColor={COLORS.border} onClick={revealHint}>Gợi ý 1 chữ (-3)</Button>
                          <Button borderRadius="full" bg="white" color={COLORS.deepBlue} border="1px solid" borderColor={COLORS.border} onClick={() => setShowAnswer(true)}>Hiện đáp án</Button>
                          <Button borderRadius="full" bg={typingChecked ? COLORS.deepBlue : COLORS.green} color="white" rightIcon={<Icon as={CheckCircle2} />} onClick={typingChecked ? nextSegment : checkTypingAnswer} isDisabled={typingChecked && activeSegmentIndex >= lesson.segments.length - 1}>{typingChecked ? 'Câu tiếp theo' : 'Kiểm tra đáp án'}</Button>
                        </HStack>
                      </VStack>
                    )}
                  </VStack>
                </GlassPanel>
              ) : null}
            </VStack>
          ) : null}
        </SimpleGrid>

        {!lesson ? (
          <LinkedGlassPanel mt="4" as={Link} to="/shadowing" p="4" bg="rgba(255,255,255,0.64)" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" display="block" _hover={{ bg: COLORS.softBlue }}>
            <HStack gap="3">
              <Icon as={Waves} color={COLORS.deepBlue} />
              <Box>
                <Text fontWeight="950" color={COLORS.text}>Muốn luyện ngay?</Text>
                <Text color={COLORS.muted} fontSize="sm" fontWeight="750">Quay lại Shadowing để luyện các bài có sẵn của Poo.</Text>
              </Box>
            </HStack>
          </LinkedGlassPanel>
        ) : null}
      </Box>
    </OceanPageShell>
  );
}
