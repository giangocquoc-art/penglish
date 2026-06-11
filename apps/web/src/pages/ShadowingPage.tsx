import { useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { saveShadowingAttempt } from '../lib/p-english/userDataAdapter';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { Box, Button, Flex, FormControl, FormLabel, HStack, Icon, Input, SimpleGrid, Tag, TagLabel, Text, Textarea, VStack } from '@chakra-ui/react';
import { AlertCircle, CheckCircle2, Mic, PlusCircle, RotateCcw, Sparkles, Trash2, Upload, Video, Volume2, Waves } from 'lucide-react';
import { OceanMascot } from '../components/p-english/OceanMascot';
import { OceanPageShell } from '../components/p-english/OceanPageShell';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useShadowingProgress } from '../hooks/useShadowingProgress';
import { createBubbleLoop, createCardEntrance, createCorrectAnswerBurst, createTranscriptHighlight, safeGsapSet } from '../lib/animations/gsap-utils';
import { shadowingVideos, type ShadowingSentence, type ShadowingVideo } from '../lib/p-english/shadowing-data';
import { requestShadowingFeedback, type ShadowingApiFailure, type ShadowingApiResult, type ShadowingApiSuccess } from '../lib/p-english/shadowingApiClient';
import { recordLearningLoopActivity, recordLearningLoopMistake, resolveLearningLoopMistake } from '../lib/p-english/learning-loop';
import { normalizeSpeechTextForComparison } from '../lib/p-english/speechTextNormalizer';

if (typeof window !== 'undefined') gsap.registerPlugin(useGSAP);

const COLORS = {
  card: '#FFFFFF',
  softAqua: '#DDF5FF',
  softBlue: '#E8F4FF',
  oceanBlue: '#2F9EEB',
  deepBlue: '#1F6FD6',
  whaleBlue: '#5BBCEB',
  text: '#102A43',
  muted: '#52667A',
  border: '#D7E8F5',
  yellow: '#FFF3C4',
  green: '#22C55E',
};

const CUSTOM_SHADOWING_STORAGE_KEY = 'PooEnglish:custom-shadowing-item';
const DEFAULT_CUSTOM_VIDEO_URL = '';
const SHADOWING_WORKFLOW_STEPS = ['Nghe mẫu', 'Nói theo Poo', 'Xem góp ý'];
const SHADOWING_RECORDING_TIMEOUT_MS = 7000;
const MICROPHONE_PERMISSION_MESSAGE = 'Poo chưa được phép dùng micro. Hãy bật Microphone rồi thử lại nha.';
const SPEECH_UNCLEAR_MESSAGE = 'Poo chưa nghe rõ câu này, thử nói chậm hơn một chút nha.';
const SPEECH_RECOGNITION_FALLBACK_MESSAGE = 'Trình duyệt này chưa hỗ trợ nhận diện giọng nói. Ní thử Chrome để Poo chấm phát âm nha.';
const SHADOWING_PIXEL_ASSET_BASE = '/assets/shadowing-pixel';
const PIXEL_ASSETS = {
  speakerSample: `${SHADOWING_PIXEL_ASSET_BASE}/speaker-sample.png`,
  microNormal: `${SHADOWING_PIXEL_ASSET_BASE}/micro-normal.png`,
  microListening: `${SHADOWING_PIXEL_ASSET_BASE}/micro-listening.png`,
  microSuccess: `${SHADOWING_PIXEL_ASSET_BASE}/micro-success.png`,
  microError: `${SHADOWING_PIXEL_ASSET_BASE}/micro-error.png`,
  nextWave: `${SHADOWING_PIXEL_ASSET_BASE}/next-wave.png`,
  pooNeutral: `${SHADOWING_PIXEL_ASSET_BASE}/poo-neutral.png`,
  pooListening: `${SHADOWING_PIXEL_ASSET_BASE}/poo-listening.png`,
  pooHappy: `${SHADOWING_PIXEL_ASSET_BASE}/poo-happy.png`,
  pooConfused: `${SHADOWING_PIXEL_ASSET_BASE}/poo-confused.png`,
  bubbleCorner: `${SHADOWING_PIXEL_ASSET_BASE}/bubble-corner.png`,
  waveDivider: `${SHADOWING_PIXEL_ASSET_BASE}/wave-divider.png`,
  badgePracticed: `${SHADOWING_PIXEL_ASSET_BASE}/badge-practiced.png`,
  badgeHard: `${SHADOWING_PIXEL_ASSET_BASE}/badge-hard.png`,
  badgeRetry: `${SHADOWING_PIXEL_ASSET_BASE}/badge-retry.png`,
  badgeGreat: `${SHADOWING_PIXEL_ASSET_BASE}/badge-great.png`,
};

type RecordingStatus = 'idle' | 'recording' | 'transcribing' | 'analyzing' | 'result' | 'error';

function getStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

const YOUTUBE_EMBED_TIMEOUT_MS = 1800;
const YOUTUBE_FALLBACK_MESSAGE = 'Video này không phát trực tiếp trong web. Bạn vẫn có thể luyện bằng lời thoại bên dưới.';

function getYouTubeVideoId(video: Pick<ShadowingVideo, 'youtubeId' | 'videoUrl'> | null | undefined) {
  const explicitId = video?.youtubeId?.trim();
  if (explicitId) return explicitId;
  const trimmed = video?.videoUrl?.trim() ?? '';
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') return parsed.pathname.replace(/^\//, '').split('/')[0] ?? '';
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (parsed.pathname.startsWith('/shorts/')) return parsed.pathname.split('/')[2] ?? '';
      if (parsed.pathname.startsWith('/embed/')) return parsed.pathname.split('/')[2] ?? '';
      return parsed.searchParams.get('v') ?? '';
    }
  } catch {
    return '';
  }
  return '';
}

function getYouTubeEmbedUrl(video: ShadowingVideo | null | undefined) {
  if (!video?.embedAllowed) return '';
  const videoId = getYouTubeVideoId(video);
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1` : '';
}

function getYouTubeWatchUrl(video: ShadowingVideo | null | undefined) {
  const videoId = getYouTubeVideoId(video);
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : video?.videoUrl ?? '';
}

function createSegmentsFromTranscript(transcript: string): ShadowingSentence[] {
  return transcript
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((text, index) => ({
      id: `custom-s${index + 1}`,
      start: index * 4,
      end: index * 4 + 4,
      text,
      vi: 'Câu tự nhập - hãy nghe/đọc và luyện nói theo nhịp của bạn.',
    }));
}

function readCustomShadowingItem(): ShadowingVideo | null {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(CUSTOM_SHADOWING_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ShadowingVideo>;
    if (!parsed.title || !Array.isArray(parsed.transcript) || parsed.transcript.length === 0) return null;
    const transcript = parsed.transcript as ShadowingSentence[];
    const videoUrl = String(parsed.videoUrl || DEFAULT_CUSTOM_VIDEO_URL);

    return {
      id: 'custom-shadowing-local',
      title: String(parsed.title),
      level: String(parsed.level || 'Tự tạo'),
      topic: String(parsed.topic || 'Bài nói đuổi tự tạo'),
      duration: String(parsed.duration || `${transcript.length} câu`),
      videoUrl,
      description: String(parsed.description || 'Bài luyện nói đuổi do bạn tự nhập lời thoại.'),
      transcript,
      transcriptLines: parsed.transcriptLines ?? transcript,
      youtubeId: String(parsed.youtubeId || ''),
      embedAllowed: false,
      focusNotes: parsed.focusNotes ?? ['Lời thoại tự tạo: đọc chậm, rõ âm cuối và giữ nhịp tự nhiên.'],
      referenceVideoTitle: parsed.referenceVideoTitle,
      referenceVideoUrl: parsed.referenceVideoUrl ?? videoUrl,
    };
  } catch {
    return null;
  }
}

function writeCustomShadowingItem(item: ShadowingVideo) {
  const storage = getStorage();
  if (storage) storage.setItem(CUSTOM_SHADOWING_STORAGE_KEY, JSON.stringify(item));
}

function deleteCustomShadowingItem() {
  const storage = getStorage();
  if (storage) storage.removeItem(CUSTOM_SHADOWING_STORAGE_KEY);
}

function Chip({ children, tone = 'blue' }: { children: React.ReactNode; tone?: 'blue' | 'green' | 'amber' | 'gray' }) {
  const palette = {
    blue: { bg: COLORS.softAqua, color: COLORS.deepBlue, border: '#BAE6FD' },
    green: { bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' },
    amber: { bg: '#FFFBEB', color: '#92400E', border: '#FDE68A' },
    gray: { bg: '#F8FAFC', color: COLORS.muted, border: COLORS.border },
  }[tone];

  return (
    <Tag borderRadius="full" bg={palette.bg} color={palette.color} border="1px solid" borderColor={palette.border} px="3" py="1.5">
      <TagLabel>{children}</TagLabel>
    </Tag>
  );
}

function FeedbackWordBox({ title, empty, words, tone }: { title: string; empty: string; words: string[]; tone: 'blue' | 'amber' | 'gray' | 'red' | 'green' }) {
  const palette = {
    blue: { bg: COLORS.softBlue, color: COLORS.deepBlue, border: '#BAE6FD' },
    green: { bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' },
    amber: { bg: '#FFFBEB', color: '#92400E', border: '#FDE68A' },
    gray: { bg: '#F8FAFC', color: COLORS.text, border: COLORS.border },
    red: { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA' },
  }[tone];

  return (
    <Box p="3" borderRadius="2xl" bg={palette.bg} border="1px solid" borderColor={palette.border}>
      <Text fontSize="sm" fontWeight="700" color={palette.color}>{title}</Text>
      <HStack mt="2" gap="2" wrap="wrap">
        {words.length ? words.map((word) => <Tag key={`${title}-${word}`} borderRadius="full" bg="white" color={palette.color}>{word}</Tag>) : <Text fontSize="sm" color={COLORS.muted}>{empty}</Text>}
      </HStack>
    </Box>
  );
}

function formatTimer(seconds: number) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function getPreferredAudioMimeType() {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') return '';
  return ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((type) => MediaRecorder.isTypeSupported(type)) ?? '';
}

function getAttemptSource(result: ShadowingApiResult | null) {
  if (!result) return 'api-error';
  if (result.ok) return 'gemini';
  if (result.error === 'GEMINI_API_KEY_MISSING') return 'api-missing-key';
  return 'api-error';
}

function compareShadowingTranscript(targetText: string, attemptText: string): ShadowingApiSuccess {
  const normalizedTarget = normalizeSpeechTextForComparison(targetText);
  const normalizedTranscript = normalizeSpeechTextForComparison(attemptText);
  const targetWords = normalizedTarget.split(' ').filter(Boolean);
  const attemptWords = normalizedTranscript.split(' ').filter(Boolean);
  const attemptSet = new Set(attemptWords);
  const targetSet = new Set(targetWords);
  const matchedWords = targetWords.filter((word) => attemptSet.has(word));
  const missingWords = targetWords.filter((word) => !attemptSet.has(word));
  const extraWords = attemptWords.filter((word) => !targetSet.has(word));
  const score = targetWords.length ? Math.max(0, Math.round((matchedWords.length / Math.max(targetWords.length, attemptWords.length || 1)) * 100)) : 0;
  const pacingHint = attemptWords.length > targetWords.length + 3
    ? 'Bạn có thể đang nói thêm nhiều từ. Hãy đọc sát câu mẫu hơn.'
    : attemptWords.length < targetWords.length - 2
      ? 'Bạn có thể nói hơi thiếu từ. Hãy nghe lại rồi đọc chậm từng cụm.'
      : 'Nhịp nói khá sát. Giữ tốc độ đều và làm rõ âm cuối.';

  return {
    ok: true,
    source: 'gemini',
    score,
    confidence: 'medium',
    transcript: attemptText,
    normalizedTranscript,
    normalizedTarget,
    matchedWords: matchedWords.slice(0, 12),
    missingWords: missingWords.slice(0, 12),
    extraWords: extraWords.slice(0, 12),
    changedWords: [],
    pronunciationTips: missingWords.length ? [`Nghe lại và nhấn rõ: ${missingWords.slice(0, 4).join(', ')}.`] : ['Bạn đã giữ đủ từ chính. Luyện thêm âm cuối để câu tự nhiên hơn.'],
    rhythmTips: [pacingHint],
    nextDrill: 'Nghe mẫu một lần, nghỉ một nhịp, rồi nói lại câu này trước khi sang câu tiếp theo.',
    coachMessage: score >= 80 ? `Poo thấy khá ổn: ${score}% giống câu mẫu.` : `Poo so sánh được ${score}%. Hãy luyện lại những từ còn thiếu nhé.`,
  };
}

function syncShadowingLearningLoop(video: ShadowingVideo | undefined, sentence: ShadowingSentence | null, result: ShadowingApiResult | null) {
  if (!sentence || !result?.ok) return;

  const sourceId = `${video?.id ?? 'shadowing'}:${sentence.id}`;
  recordLearningLoopActivity('shadowing', sourceId, result.score >= 80 ? 8 : 5);
  const mistakeId = `shadowing:${sourceId}`;

  if (result.score >= 78) {
    resolveLearningLoopMistake(mistakeId);
    return;
  }

  const missing = result.missingWords?.length ? `Thiếu: ${result.missingWords.join(', ')}.` : '';
  const extra = result.extraWords?.length ? `Thừa: ${result.extraWords.join(', ')}.` : '';
  const rhythm = result.rhythmTips?.[0] ?? 'Nghe lại câu mẫu, nghỉ một nhịp rồi nói lại chậm hơn.';

  recordLearningLoopMistake({
    id: mistakeId,
    source: 'shadowing',
    sourceId,
    type: 'shadowing-low-similarity',
    prompt: sentence.text,
    correctAnswer: sentence.text,
    userAnswer: result.transcript || `Độ giống ${result.score}%`,
    explanation: [missing, extra, rhythm].filter(Boolean).join(' '),
    tags: ['shadowing', video?.level ?? 'A1', video?.topic ?? 'speaking'].filter(Boolean),
  });
}

export function ShadowingPracticePage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [customVideo, setCustomVideo] = useState<ShadowingVideo | null>(() => readCustomShadowingItem());
  const videos = useMemo(() => (customVideo ? [customVideo, ...shadowingVideos] : shadowingVideos), [customVideo]);
  const requestedVideo = useMemo(() => videos.find((item) => item.id === lessonId) ?? null, [lessonId, videos]);
  const fallbackVideo = videos[0] ?? null;
  const [selectedVideoId, setSelectedVideoId] = useState(requestedVideo?.id ?? fallbackVideo?.id ?? '');
  const selectedVideo = useMemo(() => videos.find((item) => item.id === selectedVideoId) ?? requestedVideo ?? fallbackVideo, [fallbackVideo, requestedVideo, selectedVideoId, videos]);
  const invalidLessonMessage = lessonId && !requestedVideo ? `Poo chưa tìm thấy bài "${lessonId}" nên mở bài đầu tiên để bạn luyện tiếp nha.` : '';
  const [customTitle, setCustomTitle] = useState(customVideo?.title ?? '');
  const [customUrl, setCustomUrl] = useState(customVideo?.videoUrl ?? '');
  const [customTranscript, setCustomTranscript] = useState(customVideo?.transcript.map((item) => item.text).join('\n') ?? '');
  const [customMessage, setCustomMessage] = useState(customVideo ? 'Poo đã mở bài nói đuổi bạn tự tạo.' : 'Dán mỗi câu trên một dòng để tạo bài luyện riêng.');
  const [speed, setSpeed] = useState(1);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [recordMessage, setRecordMessage] = useState('Poo sẽ nghe lượt nói và góp ý nhẹ về phát âm, nhịp, chỗ Poo nghe chưa rõ.');
  const [mediaMessage, setMediaMessage] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [youtubeFallbackVisible, setYoutubeFallbackVisible] = useState(false);
  const [apiFeedback, setApiFeedback] = useState<ShadowingApiSuccess | null>(null);
  const [apiError, setApiError] = useState<ShadowingApiFailure | null>(null);
  const [localTranscript, setLocalTranscript] = useState('');
  const [shadowingSyncStatus, setShadowingSyncStatus] = useState<'local' | 'synced' | 'failed'>('local');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const recordingTimeoutRef = useRef<number | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const recordingStatusRef = useRef(recordingStatus);
  const recordButtonGuardRef = useRef(0);
  const stoppingRecordingRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const recordPulseRef = useRef<HTMLDivElement | null>(null);
  const completionRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  const transcriptLineIds = useMemo(() => selectedVideo?.transcript.map((sentence) => sentence.id) ?? [], [selectedVideo]);
  const {
    currentLineIndex,
    practicedCount,
    difficultCount,
    setCurrentLineIndex,
    goNext,
    goPrevious,
    markPracticed,
    toggleDifficult,
    isPracticed,
    isDifficult,
  } = useShadowingProgress(selectedVideo?.id, transcriptLineIds);
  const selectedSentence = useMemo<ShadowingSentence | null>(() => selectedVideo?.transcript[currentLineIndex] ?? selectedVideo?.transcript[0] ?? null, [currentLineIndex, selectedVideo]);
  const selectedSentenceId = selectedSentence?.id ?? '';
  const transcriptLength = selectedVideo?.transcript.length ?? 0;
  const selectedSentenceIndex = selectedSentence ? currentLineIndex : -1;
  const completedCount = practicedCount;
  const allSentencesCompleted = transcriptLength > 0 && completedCount >= transcriptLength;
  const weakSentence = useMemo(() => selectedVideo?.transcript.find((sentence) => !isPracticed(sentence.id)) ?? selectedSentence, [isPracticed, selectedSentence, selectedVideo]);
  const selectedYouTubeId = getYouTubeVideoId(selectedVideo);
  const hasSelectedVideoUrl = Boolean(selectedVideo?.videoUrl?.trim() || selectedYouTubeId);
  const selectedYouTubeEmbedUrl = getYouTubeEmbedUrl(selectedVideo);
  const selectedYouTubeWatchUrl = getYouTubeWatchUrl(selectedVideo);
  const hasSelectedYouTubeVideo = Boolean(selectedYouTubeEmbedUrl);
  const shouldShowReferenceFallback = hasSelectedVideoUrl && !hasSelectedYouTubeVideo;
  const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  const speechRecognitionSupported = typeof window !== 'undefined' && Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  const isRecording = recordingStatus === 'recording';
  const isTranscribing = recordingStatus === 'transcribing';
  const isAnalyzing = recordingStatus === 'analyzing';
  const isProcessingRecording = isTranscribing || isAnalyzing;
  const processingMessage = isTranscribing ? 'Poo đang nghe lại giọng của bạn...' : isAnalyzing ? 'Poo đang góp ý cho bạn...' : '';
  const pooMoodLabel = isRecording ? 'Poo đang nghe…' : isProcessingRecording ? processingMessage : apiFeedback ? 'Poo đã có góp ý cho lượt nói này' : apiError ? 'Poo cần bạn thử lại một chút' : 'Poo sẵn sàng nghe bạn nói';
  const selectedSentencePracticed = selectedSentence ? isPracticed(selectedSentence.id) : false;
  const selectedSentenceDifficult = selectedSentence ? isDifficult(selectedSentence.id) : false;
  const isGoodSpeaking = Boolean(apiFeedback && apiFeedback.score >= 80);
  const micPixelSrc = isRecording
    ? PIXEL_ASSETS.microListening
    : apiFeedback
      ? PIXEL_ASSETS.microSuccess
      : apiError || recordingStatus === 'error'
        ? PIXEL_ASSETS.microError
        : PIXEL_ASSETS.microNormal;
  const feedbackMascotSrc = isRecording || isProcessingRecording
    ? PIXEL_ASSETS.pooListening
    : isGoodSpeaking
      ? PIXEL_ASSETS.pooHappy
      : apiError
        ? PIXEL_ASSETS.pooConfused
        : PIXEL_ASSETS.pooNeutral;

  useEffect(() => {
    recordingStatusRef.current = recordingStatus;
  }, [recordingStatus]);

  useEffect(() => {
    const nextVideoId = requestedVideo?.id ?? fallbackVideo?.id ?? '';
    setSelectedVideoId(nextVideoId);
  }, [fallbackVideo?.id, requestedVideo?.id]);

  useEffect(() => {
    setYoutubeFallbackVisible(false);
    setMediaMessage(selectedVideo?.videoUrl?.trim() ? 'Lời thoại là phần luyện chính. Video tham khảo chỉ phát được khi nền tảng cho phép.' : 'Bài này luyện bằng lời thoại. Nút nghe dùng giọng đọc mẫu nếu trình duyệt hỗ trợ.');
    setApiFeedback(null);
    setApiError(null);
    setLocalTranscript('');
    setRecordingStatus('idle');
    setElapsedSeconds(0);
    setRecordMessage('Poo sẽ nghe lượt nói và góp ý nhẹ về phát âm, nhịp, chỗ Poo nghe chưa rõ.');
    setShadowingSyncStatus('local');
  }, [selectedVideo?.id, selectedVideo?.videoUrl]);

  useEffect(() => {
    setApiFeedback(null);
    setApiError(null);
    setLocalTranscript('');
    setRecordingStatus('idle');
    setElapsedSeconds(0);
    setRecordMessage('Poo sẽ nghe lượt nói và góp ý nhẹ về phát âm, nhịp, chỗ Poo nghe chưa rõ.');
    setShadowingSyncStatus('local');
  }, [selectedSentence?.id]);

  useEffect(() => {
    if (!hasSelectedYouTubeVideo) {
      setYoutubeFallbackVisible(Boolean(shouldShowReferenceFallback));
      return undefined;
    }

    setYoutubeFallbackVisible(false);
    const timer = window.setTimeout(() => {
      setYoutubeFallbackVisible(true);
      setMediaMessage(YOUTUBE_FALLBACK_MESSAGE);
    }, YOUTUBE_EMBED_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [hasSelectedYouTubeVideo, selectedYouTubeEmbedUrl, shouldShowReferenceFallback]);

  useEffect(() => {
    if (!isRecording) return;
    const startedAt = Date.now() - elapsedSeconds * 1000;
    const timer = window.setInterval(() => setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000)), 250);
    return () => window.clearInterval(timer);
  }, [isRecording]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    const cleanupRecording = () => {
      stopAndSendRecording('cleanup');
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') cleanupRecording();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', cleanupRecording);
    window.addEventListener('beforeunload', cleanupRecording);

    return () => {
      cleanupRecording();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', cleanupRecording);
      window.removeEventListener('beforeunload', cleanupRecording);
    };
  }, []);

  useGSAP(() => {
    const root = rootRef.current;
    if (!root) return;
    const hero = root.querySelector('.shadowing-hero');
    const cards = root.querySelectorAll('.shadowing-practice-card, .shadowing-feedback-panel, .shadowing-video-card, .shadowing-custom-card, .shadowing-transcript-panel, .shadowing-weak-card');
    const bubbles = root.querySelectorAll('.shadowing-ocean-bubble');
    if (reducedMotion) {
      safeGsapSet([hero, cards, bubbles], { autoAlpha: 1, x: 0, y: 0, scale: 1, rotate: 0 });
      return;
    }
    if (hero) gsap.fromTo(hero, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.42, ease: 'power2.out', force3D: true });
    if (cards.length) createCardEntrance(cards, { y: 14, duration: 0.42, delay: 0.06, stagger: 0.045 });
    if (bubbles.length) createBubbleLoop(bubbles, { y: -10, x: 3, duration: 7.2, stagger: 0.22, scale: 1.04 });
  }, { scope: rootRef, dependencies: [selectedVideoId, reducedMotion], revertOnUpdate: true });

  useGSAP(() => {
    const root = rootRef.current;
    if (!root) return;
    const activeCard = root.querySelector(`[data-shadowing-sentence-id="${selectedSentenceId}"]`);
    if (reducedMotion) {
      safeGsapSet(activeCard, { autoAlpha: 1, x: 0, y: 0, scale: 1 });
      return;
    }
    if (activeCard) {
      createTranscriptHighlight(activeCard, { scale: 1.015, duration: 0.16 });
      activeCard.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, { scope: rootRef, dependencies: [selectedSentenceId, reducedMotion], revertOnUpdate: true });

  useGSAP(() => {
    const pulse = recordPulseRef.current;
    if (!pulse) return;
    if (reducedMotion || !isRecording) {
      safeGsapSet(pulse, { autoAlpha: isRecording ? 0.2 : 0, scale: 1 });
      return;
    }
    gsap.fromTo(pulse, { autoAlpha: 0.24, scale: 0.94 }, { autoAlpha: 0, scale: 1.26, duration: 1.18, repeat: -1, ease: 'sine.out', force3D: true });
  }, { scope: rootRef, dependencies: [isRecording, reducedMotion], revertOnUpdate: true });

  useGSAP(() => {
    const completion = completionRef.current;
    if (!completion || !allSentencesCompleted) return;
    if (reducedMotion) {
      safeGsapSet(completion, { autoAlpha: 1, y: 0, scale: 1 });
      return;
    }
    createCorrectAnswerBurst(completion, { scale: 1.018, duration: 0.24 });
  }, { scope: rootRef, dependencies: [allSentencesCompleted, reducedMotion], revertOnUpdate: true });

  const markSentenceCompleted = (sentenceId?: string) => {
    markPracticed(sentenceId);
  };

  const goToPreviousSentence = () => {
    if (!selectedVideo?.transcript.length) return;
    goPrevious();
  };

  const saveAttempt = (result: ShadowingApiResult | null) => {
    syncShadowingLearningLoop(selectedVideo, selectedSentence, result);
    saveShadowingAttempt({
      itemId: selectedVideo?.id,
      lessonId: selectedVideo?.id,
      level: selectedVideo?.level,
      targetText: selectedSentence?.text ?? '',
      learnerText: result?.ok ? result.transcript : '',
      feedbackSource: getAttemptSource(result),
      feedbackJson: result ? { ...result } : { ok: false, error: 'UNKNOWN_API_ERROR' },
    })
      .then((saveResult) => setShadowingSyncStatus(saveResult.mode === 'supabase' && saveResult.ok ? 'synced' : 'local'))
      .catch(() => setShadowingSyncStatus('failed'));
  };

  const listenSentence = () => {
    if (!selectedSentence) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      setMediaMessage('Trình duyệt chưa hỗ trợ giọng đọc mẫu. Hãy đọc câu mẫu, nói thử một lượt, rồi để Poo góp ý nhẹ.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(selectedSentence.text);
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find((voice) => voice.lang?.toLowerCase().startsWith('en'));
    if (englishVoice) utterance.voice = englishVoice;
    utterance.lang = englishVoice?.lang || 'en-US';
    utterance.rate = speed;
    utterance.onerror = () => setMediaMessage('Poo chưa phát được giọng mẫu. Bạn thử bấm lại hoặc kiểm tra âm lượng nha.');
    utterance.onend = () => setMediaMessage(`Đã phát câu mẫu ở tốc độ ${speed}x.`);
    window.speechSynthesis.speak(utterance);
    setMediaMessage(`Đang phát câu mẫu ở tốc độ ${speed}x.`);
  };

  const replaySentence = async () => {
    if (!selectedSentence) return;
    if (!videoRef.current || !selectedVideo?.videoUrl?.trim()) {
      listenSentence();
      setRecordMessage('Không có video mẫu thu sẵn. Poo dùng giọng đọc mẫu nếu có; sau đó bạn nói thử để Poo góp ý.');
      return;
    }

    videoRef.current.currentTime = selectedSentence.start;
    videoRef.current.playbackRate = speed;
    await videoRef.current.play().catch(() => {
      setMediaMessage('Video không phát được. Bạn vẫn có thể luyện bằng lời thoại, giọng đọc mẫu và lượt nói của mình.');
    });
  };

  const sendRecordingForFeedback = async (blob: Blob) => {
    setRecordingStatus('transcribing');
    setRecordMessage('Poo đang nghe lại giọng của bạn...');
    const result = await requestShadowingFeedback({
      audio: blob,
      targetText: selectedSentence?.text ?? '',
      translation: selectedSentence?.vi ?? '',
      lessonTitle: selectedVideo?.title,
      level: 'beginner',
      sentenceIndex: selectedSentenceIndex + 1,
      onTranscribed: () => {
        setRecordingStatus('analyzing');
        setRecordMessage('Poo đang góp ý cho bạn...');
      },
    });

    if (result.ok) {
      setApiFeedback(result);
      setApiError(null);
      setRecordingStatus('result');
      setRecordMessage(result.score < 78 ? `${result.coachMessage} Poo đã giữ câu này ở phần ôn cùng Poo để bạn quay lại nhẹ nhàng.` : result.coachMessage);
      markSentenceCompleted(selectedSentence?.id);
    } else {
      const fallback = localTranscript.trim()
        ? compareShadowingTranscript(selectedSentence?.text ?? '', localTranscript.trim())
        : null;
      if (fallback) {
        setApiFeedback(fallback);
        setApiError(null);
        setRecordingStatus('result');
        setRecordMessage(`${fallback.coachMessage} Poo góp ý từ câu bạn nhập.${fallback.score < 78 ? ' Poo đã lưu câu này vào phần Ôn tập để bạn luyện lại.' : ''}`);
        markSentenceCompleted(selectedSentence?.id);
        saveAttempt(fallback);
        return;
      }
      setApiFeedback(null);
      setApiError(result);
      setRecordingStatus('error');
      setRecordMessage('Poo chưa nghe rõ. Bạn thử nói lại chậm hơn một chút nhé.');
    }
    saveAttempt(result);
  };

  const finishSpeechTranscript = (transcript: string) => {
    const cleaned = transcript.trim();
    if (!cleaned) {
      const failure: ShadowingApiFailure = { ok: false, error: 'NO_AUDIO', message: SPEECH_UNCLEAR_MESSAGE };
      setApiFeedback(null);
      setApiError(failure);
      setRecordingStatus('error');
      setRecordMessage(SPEECH_UNCLEAR_MESSAGE);
      saveAttempt(failure);
      return;
    }

    const result = compareShadowingTranscript(selectedSentence?.text ?? '', cleaned);
    setLocalTranscript(cleaned);
    setApiFeedback(result);
    setApiError(null);
    setRecordingStatus('result');
    setRecordMessage(`Nghe được: ${cleaned}. ${result.coachMessage}`);
    markSentenceCompleted(selectedSentence?.id);
    saveAttempt(result);
  };

  const clearRecordingTimeout = () => {
    if (recordingTimeoutRef.current && typeof window !== 'undefined') {
      window.clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
  };

  const stopMicrophoneTracks = () => {
    const stream = activeStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    activeStreamRef.current = null;
  };

  const startRecording = async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      const failure: ShadowingApiFailure = { ok: false, error: 'NO_AUDIO', message: MICROPHONE_PERMISSION_MESSAGE };
      setApiFeedback(null);
      setApiError(failure);
      setRecordingStatus('error');
      setRecordMessage(failure.message);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      activeStreamRef.current = stream;
      stoppingRecordingRef.current = false;
      chunksRef.current = [];
      setElapsedSeconds(0);
      setApiFeedback(null);
      setApiError(null);
      setLocalTranscript('');
      setRecordingStatus('recording');
      setRecordMessage('Đang nghe...');

      const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionCtor) {
        const recognition = new SpeechRecognitionCtor();
        let finalTranscript = '';
        speechRecognitionRef.current = recognition;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onresult = (event: any) => {
          finalTranscript = Array.from(event.results ?? [])
            .map((result: any) => result?.[0]?.transcript ?? '')
            .join(' ')
            .trim();
        };
        recognition.onerror = () => {
          finalTranscript = '';
        };
        recognition.onend = () => {
          clearRecordingTimeout();
          stopMicrophoneTracks();
          speechRecognitionRef.current = null;
          stoppingRecordingRef.current = false;
          finishSpeechTranscript(finalTranscript);
        };
        recognition.start();
        recordingTimeoutRef.current = window.setTimeout(() => {
          try { recognition.stop(); } catch { finishSpeechTranscript(finalTranscript); }
        }, SHADOWING_RECORDING_TIMEOUT_MS);
        return;
      }

      if (!('MediaRecorder' in window)) {
        stopMicrophoneTracks();
        const failure: ShadowingApiFailure = { ok: false, error: 'NO_AUDIO', message: SPEECH_RECOGNITION_FALLBACK_MESSAGE };
        setApiFeedback(null);
        setApiError(failure);
        setRecordingStatus('error');
        setRecordMessage(failure.message);
        saveAttempt(failure);
        return;
      }

      setRecordMessage(`Đang nghe... ${SPEECH_RECOGNITION_FALLBACK_MESSAGE}`);
      const preferredMimeType = getPreferredAudioMimeType();
      const recorder = preferredMimeType ? new MediaRecorder(stream, { mimeType: preferredMimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        clearRecordingTimeout();
        stopMicrophoneTracks();
        mediaRecorderRef.current = null;
        stoppingRecordingRef.current = false;
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || preferredMimeType || 'audio/webm' });
        markSentenceCompleted(selectedSentence?.id);
        const failure: ShadowingApiFailure = { ok: false, error: blob.size > 0 ? 'API_ERROR' : 'EMPTY_AUDIO', message: SPEECH_RECOGNITION_FALLBACK_MESSAGE };
        setApiFeedback(null);
        setApiError(failure);
        setRecordingStatus('error');
        setRecordMessage(failure.message);
        saveAttempt(failure);
      };
      recorder.start(250);
      recordingTimeoutRef.current = window.setTimeout(() => stopAndSendRecording('timeout'), SHADOWING_RECORDING_TIMEOUT_MS);
    } catch {
      const failure: ShadowingApiFailure = { ok: false, error: 'NO_AUDIO', message: MICROPHONE_PERMISSION_MESSAGE };
      setApiFeedback(null);
      setApiError(failure);
      setRecordingStatus('error');
      setRecordMessage(failure.message);
      stopMicrophoneTracks();
    }
  };

  const stopAndSendRecording = (reason: 'manual' | 'timeout' | 'cleanup' = 'manual') => {
    clearRecordingTimeout();

    const recognition = speechRecognitionRef.current;
    const recorder = mediaRecorderRef.current;
    const stream = activeStreamRef.current;

    if (!recognition && !recorder && !stream) {
      stoppingRecordingRef.current = false;
      if (recordingStatusRef.current === 'recording') setRecordingStatus('idle');
      return;
    }

    if (stoppingRecordingRef.current && !stream) return;
    stoppingRecordingRef.current = true;

    if (recognition) {
      speechRecognitionRef.current = null;
      try {
        recognition.stop();
      } catch {
        finishSpeechTranscript('');
        stoppingRecordingRef.current = false;
      }
      stopMicrophoneTracks();
      if (reason === 'cleanup' || recordingStatusRef.current === 'recording') setRecordingStatus('idle');
      return;
    }

    if (recorder) {
      mediaRecorderRef.current = null;
      if (recorder.state !== 'inactive') {
        try {
          recorder.stop();
        } catch {
          stoppingRecordingRef.current = false;
        }
      } else {
        stoppingRecordingRef.current = false;
      }
      stopMicrophoneTracks();
      if (reason === 'cleanup' || recordingStatusRef.current === 'recording') setRecordingStatus('idle');
      return;
    }

    stopMicrophoneTracks();
    stoppingRecordingRef.current = false;
    if (recordingStatusRef.current === 'recording') setRecordingStatus('idle');
  };

  const handleRecordAction = () => {
    if (recordingStatusRef.current === 'recording' || mediaRecorderRef.current || speechRecognitionRef.current || activeStreamRef.current) {
      stopAndSendRecording();
      return;
    }
    void startRecording();
  };

  const handleRecordButtonActivate = (event?: SyntheticEvent) => {
    event?.preventDefault();
    const now = Date.now();
    if (now - recordButtonGuardRef.current < 320) return;
    recordButtonGuardRef.current = now;
    handleRecordAction();
  };

  const retryRecording = () => {
    setApiFeedback(null);
    setApiError(null);
    setLocalTranscript('');
    setRecordingStatus('idle');
    setElapsedSeconds(0);
    setRecordMessage('Poo sẽ nghe lượt nói và góp ý nhẹ về phát âm, nhịp, chỗ Poo nghe chưa rõ.');
  };

  const goToNextSentence = () => {
    if (!selectedVideo?.transcript.length) return;
    goNext();
  };

  const createCustomPractice = () => {
    const transcript = createSegmentsFromTranscript(customTranscript);
    if (transcript.length === 0) {
      setCustomMessage('Bạn cần nhập ít nhất một câu luyện để tạo bài.');
      return;
    }

    const next: ShadowingVideo = {
      id: 'custom-shadowing-local',
      title: customTitle.trim() || 'Bài nói đuổi tự tạo',
      level: 'Tự tạo',
      topic: 'Lời thoại tự nhập',
      duration: `${transcript.length} câu`,
      videoUrl: customUrl.trim(),
      description: 'Bài luyện nói đuổi được tạo từ lời thoại bạn nhập, Poo đang giữ để bạn luyện tiếp.',
      transcript,
      transcriptLines: transcript,
      youtubeId: '',
      embedAllowed: false,
      focusNotes: ['Lời thoại tự tạo: đọc chậm, rõ âm cuối và giữ nhịp tự nhiên.'],
      referenceVideoUrl: customUrl.trim(),
    };

    writeCustomShadowingItem(next);
    setCustomVideo(next);
    setSelectedVideoId(next.id);
    setCurrentLineIndex(0);
    setCustomMessage(`Đã tạo bài luyện với ${transcript.length} câu. Bấm từng câu trong lời thoại để luyện.`);
    navigate(`/shadowing/practice/${next.id}`);
  };

  const removeCustomPractice = () => {
    deleteCustomShadowingItem();
    setCustomVideo(null);
    setSelectedVideoId(shadowingVideos[0]?.id ?? '');
    setCustomMessage('Poo đã cất bài tự tạo khỏi danh sách luyện.');
  };

  const feedbackPanel = (
    <Box data-testid="shadowing-feedback-panel" className="shadowing-feedback-panel penglish-glass-card" p={{ base: '4', md: '5' }} borderRadius="3xl" bg="rgba(255,255,255,0.78)" border="1px solid" borderColor="#BAE6FD" boxShadow="0 14px 34px rgba(31, 111, 214, 0.07)" backdropFilter="blur(14px) saturate(1.1)" position="relative" overflow="hidden">
      <Box as="img" className="pooPixelDecor" src={PIXEL_ASSETS.bubbleCorner} alt="" loading="lazy" position="absolute" right="-6px" top="-6px" w="76px" opacity="0.22" />
      <Flex mb="4" justify="space-between" align={{ base: 'start', md: 'center' }} gap="4" direction={{ base: 'column', md: 'row' }}>
        <HStack align="center" gap="3" minW="0">
          <Box data-testid="poo-shadowing-coach" position="relative" w="92px" flexShrink={0} pointerEvents="none" overflow="visible">
            <Box as="img" className="pooPixelMascot" src={feedbackMascotSrc} alt="Poo góp ý phát âm" loading="lazy" w={{ base: '78px', md: '92px' }} h={{ base: '78px', md: '92px' }} />
          </Box>
          <Box minW="0">
            <Text as="h2" fontWeight="700" color={COLORS.text}>Poo góp ý cách nói</Text>
            <Text mt="1" fontSize="sm" color={COLORS.muted} fontWeight="700">{pooMoodLabel}</Text>
          </Box>
        </HStack>
        <VStack align={{ base: 'start', md: 'end' }} gap="2">
          <HStack gap="2" wrap="wrap" justify={{ base: 'start', md: 'end' }}>
            <Chip tone={apiFeedback ? 'green' : apiError ? 'amber' : 'blue'}>{apiFeedback ? 'Góp ý sẵn sàng' : apiError ? 'Cần thử lại' : 'Poo góp ý'}</Chip>
            {isGoodSpeaking ? <Box as="img" className="pooPixelBadge" src={PIXEL_ASSETS.badgeGreat} alt="Huy hiệu nói tốt" loading="lazy" w="42px" h="42px" /> : null}
            {apiError ? <Box as="img" className="pooPixelBadge" src={PIXEL_ASSETS.badgeRetry} alt="Huy hiệu thử lại" loading="lazy" w="42px" h="42px" /> : null}
            {selectedSentenceDifficult ? <Box as="img" className="pooPixelBadge" src={PIXEL_ASSETS.badgeHard} alt="Huy hiệu câu khó" loading="lazy" w="42px" h="42px" /> : null}
            {selectedSentencePracticed ? <Box as="img" className="pooPixelBadge" src={PIXEL_ASSETS.badgePracticed} alt="Huy hiệu đã luyện" loading="lazy" w="42px" h="42px" /> : null}
          </HStack>
          <Text data-testid="shadowing-sync-status" fontSize="xs" color={shadowingSyncStatus === 'synced' ? '#166534' : shadowingSyncStatus === 'failed' ? '#92400E' : COLORS.muted} fontWeight="700" role="status" aria-live="polite">
            {shadowingSyncStatus === 'synced' ? 'Poo đã giữ lượt luyện' : shadowingSyncStatus === 'failed' ? 'Poo sẽ lưu lên tài khoản khi mạng ổn hơn' : 'Tiến độ của bạn vẫn an toàn'}
          </Text>
        </VStack>
      </Flex>

      {apiFeedback ? (
        <>
          <Box mb="4" p="3" borderRadius="2xl" bg="rgba(232,244,255,0.72)" border="1px solid" borderColor="#BAE6FD">
            <Text fontWeight="700" color={COLORS.text}>{apiFeedback.coachMessage}</Text>
            <Text mt="1" fontSize="sm" color={COLORS.muted} fontWeight="700">Mức rõ của câu: {apiFeedback.score}/100 · Poo nghe chắc chưa: {apiFeedback.confidence}</Text>
          </Box>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
            <Box p="3" borderRadius="2xl" bg="rgba(221,245,255,0.62)" border="1px solid" borderColor="#BAE6FD">
              <Text fontSize="sm" fontWeight="700" color={COLORS.deepBlue}>Poo nghe được</Text>
              <Text mt="2" color={COLORS.text} fontWeight="700">{apiFeedback.transcript || 'Âm thanh chưa đủ rõ để Poo ghi lại chắc chắn.'}</Text>
            </Box>
            <Box p="3" borderRadius="2xl" bg="#F0FDF4" border="1px solid" borderColor="#BBF7D0">
              <Text fontSize="sm" fontWeight="700" color="#166534">Bài luyện tiếp theo</Text>
              <Text mt="2" color={COLORS.muted} fontSize="sm">{apiFeedback.nextDrill || 'Đọc chậm câu mẫu, nghỉ một nhịp, rồi nói lại lần nữa.'}</Text>
            </Box>
            <FeedbackWordBox title="Từ bạn nói tốt" empty="Poo chưa nghe rõ từ nào chắc chắn, mình thử chậm hơn nhé." tone="green" words={apiFeedback.matchedWords} />
            <FeedbackWordBox title="Từ Poo chưa nghe rõ" empty="Poo chưa thấy chỗ nào bị hụt rõ ràng." tone="amber" words={apiFeedback.missingWords} />
            <FeedbackWordBox title="Từ Poo nghe hơi khác" empty="Poo chưa nghe thấy chỗ nào lệch rõ ràng." tone="red" words={[...apiFeedback.extraWords, ...apiFeedback.changedWords]} />
            <Box p="3" borderRadius="2xl" bg="rgba(221,245,255,0.62)" border="1px solid" borderColor="#BAE6FD">
              <Text fontSize="sm" fontWeight="700" color={COLORS.deepBlue}>Gợi ý phát âm</Text>
              <VStack mt="2" align="stretch" gap="1">
                {(apiFeedback.pronunciationTips.length ? apiFeedback.pronunciationTips : ['Nói chậm hơn và làm rõ âm cuối của từ chính.']).map((tip) => <Text key={tip} fontSize="sm" color={COLORS.muted}>• {tip}</Text>)}
              </VStack>
            </Box>
            <Box p="3" borderRadius="2xl" bg="rgba(248,252,255,0.78)" border="1px solid" borderColor={COLORS.border}>
              <Text fontSize="sm" fontWeight="700" color={COLORS.text}>Nhịp nói</Text>
              <VStack mt="2" align="stretch" gap="1">
                {(apiFeedback.rhythmTips.length ? apiFeedback.rhythmTips : ['Đọc theo cụm 2–4 từ, nghỉ rất nhẹ giữa các cụm.']).map((tip) => <Text key={tip} fontSize="sm" color={COLORS.muted}>• {tip}</Text>)}
              </VStack>
            </Box>
          </SimpleGrid>
          <HStack mt="4" gap="2" wrap="wrap">
            <Button data-testid="shadowing-record-again-button" leftIcon={<Box as="img" className="pooPixelIcon" src={PIXEL_ASSETS.microNormal} alt="Micro luyện nói" w="22px" h="22px" />} borderRadius="full" variant="outline" colorScheme="blue" onClick={retryRecording}>Nói lại lần nữa</Button>
            <Button data-testid="shadowing-next-sentence-button" leftIcon={<Box as="img" className="pooPixelIcon" src={PIXEL_ASSETS.nextWave} alt="Sóng chuyển câu" w="22px" h="22px" />} borderRadius="full" bg={COLORS.deepBlue} color="white" _hover={{ bg: COLORS.oceanBlue }} onClick={goToNextSentence} isDisabled={selectedSentenceIndex >= transcriptLength - 1}>Câu tiếp theo</Button>
          </HStack>
        </>
      ) : apiError ? (
        <Box data-testid="shadowing-api-error" p="4" borderRadius="2xl" bg="#FFFBEB" border="1px solid" borderColor="#FDE68A">
          <HStack align="start" gap="3">
            <Icon as={AlertCircle} color="#92400E" />
            <Box>
              <Text fontWeight="700" color={COLORS.text}>{apiError.message}</Text>
              <Text mt="1" fontSize="sm" color={COLORS.muted}>Poo chưa nghe rõ lượt này. Bạn có thể nói lại lần nữa, hoặc nhập câu mình vừa nói ở phần nâng cao để Poo nghe cùng bạn.</Text>
            </Box>
          </HStack>
          <VStack align="stretch" gap="3" mt="4">
            <Textarea data-testid="shadowing-local-transcript-input" value={localTranscript} onChange={(event) => setLocalTranscript(event.target.value)} placeholder="Nhập câu bạn vừa nói, ví dụ: I am learning English every day." bg="white" borderRadius="2xl" minH="96px" />
            <HStack wrap="wrap" gap="2">
              <Button data-testid="shadowing-local-compare-button" leftIcon={<Icon as={Sparkles} />} borderRadius="full" bg={COLORS.deepBlue} color="white" _hover={{ bg: COLORS.oceanBlue }} onClick={() => {
                const fallback = compareShadowingTranscript(selectedSentence?.text ?? '', localTranscript.trim());
                setApiFeedback(fallback);
                setApiError(null);
                setRecordingStatus('result');
                setRecordMessage(`${fallback.coachMessage} Poo góp ý nhẹ từ câu bạn vừa nhập.`);
                markSentenceCompleted(selectedSentence?.id);
                saveAttempt(fallback);
              }} isDisabled={!localTranscript.trim()}>Nhờ Poo nghe thử</Button>
              <Button data-testid="shadowing-record-retry-button" leftIcon={<Box as="img" className="pooPixelIcon" src={PIXEL_ASSETS.microNormal} alt="Micro luyện nói" w="22px" h="22px" />} borderRadius="full" variant="outline" colorScheme="blue" onClick={retryRecording}>Nói lại lần nữa</Button>
            </HStack>
          </VStack>
        </Box>
      ) : (
        <Box p="4" borderRadius="2xl" bg="rgba(232,244,255,0.7)" border="1px solid" borderColor="#BAE6FD">
          <Text fontWeight="700" color={COLORS.text}>Poo sẽ chỉ ra chỗ cần luyện thêm.</Text>
          <Text mt="1" fontSize="sm" color={COLORS.muted} lineHeight="1.7">Nghe trước một lần, nói lại theo nhịp, rồi xem từ còn thiếu, gợi ý phát âm và nhịp nói để thử lại nhẹ nhàng.</Text>
        </Box>
      )}
    </Box>
  );

  return (
    <OceanPageShell variant="shadowing" overlayStrength="medium" data-testid="shadowing-mobile-root" ref={rootRef} minH="calc(100vh - 68px)" px={{ base: '3', md: '5' }} pb={{ base: 'calc(var(--penglish-mobile-safe-bottom) + 80px)', lg: '10' }} pt={{ base: '3', md: 'calc(68px + 1.25rem)', lg: 'calc(72px + 1.5rem)' }} overflowX="hidden" scrollMarginTop="96px" sx={{ scrollPaddingTop: '96px', scrollPaddingBottom: 'calc(var(--penglish-mobile-safe-bottom) + 96px)' }}>
      <Box maxW="1180px" mx="auto" minW="0" pb={{ base: '128px', lg: '0' }}>
        <Flex data-testid="shadowing-hero" className="shadowing-hero penglish-glass-card" mb={{ base: '2', md: '5' }} p={{ base: '3', md: '6' }} borderRadius="3xl" bg="rgba(255,255,255,0.78)" border="1px solid" borderColor="#BAE6FD" boxShadow="0 14px 34px rgba(31, 111, 214, 0.07)" direction={{ base: 'column', lg: 'row' }} justify="space-between" gap={{ base: '2', md: '5' }} position="relative" overflow="hidden" willChange="transform, opacity" backdropFilter="blur(14px) saturate(1.1)">
          <Box className="shadowing-ocean-bubble" position="absolute" right="-58px" top="-64px" w="220px" h="220px" borderRadius="full" bg="rgba(221,245,255,0.78)" pointerEvents="none" />
          <Box className="shadowing-ocean-bubble" position="absolute" left="42%" bottom="-96px" w="180px" h="180px" borderRadius="full" bg="rgba(186,230,253,0.36)" pointerEvents="none" />
          <Box position="relative" minW="0" flex="1">
            <HStack mb={{ base: '2', md: '3' }} gap="2" wrap="wrap" display={{ base: 'none', sm: 'flex' }}>
              <Chip tone="blue">Nghe trước một lần</Chip>
              <Chip tone="green">Nói lại theo nhịp</Chip>
              <Chip tone="amber">Poo góp ý</Chip>
            </HStack>
            <Text as="h1" fontSize={{ base: 'xl', md: '4xl' }} fontWeight="800" color={COLORS.text} lineHeight="1.08">Nói đuổi cùng Poo</Text>
            <Text mt={{ base: '1.5', md: '3' }} color={COLORS.muted} maxW="800px" fontSize={{ base: 'sm', md: 'md' }} fontWeight="700" lineHeight={{ base: '1.4', md: '1.7' }} noOfLines={{ base: 3, md: undefined }}>Không cần nói hoàn hảo. Mục tiêu là nghe rõ hơn và nói tự nhiên hơn mỗi ngày: nghe mẫu, nói lại, rồi để Poo chỉ ra chỗ cần luyện thêm.</Text>
            {invalidLessonMessage ? <Text mt="2" color="#B45309" fontSize="sm" fontWeight="850" role="status">{invalidLessonMessage}</Text> : null}
            <HStack mt="4" gap="2" wrap="wrap">
              <Button as={Link} to="/shadowing" size="sm" borderRadius="full" bg="white" color={COLORS.deepBlue} border="1px solid" borderColor="#BAE6FD" _hover={{ bg: COLORS.softBlue }}>Về Shadowing</Button>
            </HStack>
            <HStack mt="3" gap="2" wrap="wrap" display={{ base: 'none', md: 'flex' }}>
              {SHADOWING_WORKFLOW_STEPS.map((step) => <Tag key={step} size="sm" borderRadius="full" bg="white" color={COLORS.deepBlue} border="1px solid" borderColor="#BAE6FD"><TagLabel>{step}</TagLabel></Tag>)}
            </HStack>
          </Box>
          <Flex position="relative" align="center" justify="center" minW={{ base: '100%', lg: '180px' }} pointerEvents="none" aria-hidden="true">
            <Box display={{ base: 'none', md: 'block' }} position="relative" w="150px">
              <OceanMascot mascot="suaNghe" pose="listen" size="lg" decorative motion="float" />
            </Box>
          </Flex>
        </Flex>

        <Flex direction={{ base: 'column', lg: 'row' }} gap={{ base: '3', md: '5' }} minW="0" align="start">
          <VStack align="stretch" gap={{ base: '3', md: '4' }} minW="0" flex="1">
            <Box data-testid="shadowing-practice-card" className="shadowing-practice-card penglish-glass-card" p={{ base: '3', md: '4' }} borderRadius="3xl" bg="rgba(255,255,255,0.78)" border="1px solid" borderColor="#BAE6FD" boxShadow="0 14px 34px rgba(31, 111, 214, 0.07)" minW="0" willChange="transform, opacity" backdropFilter="blur(14px) saturate(1.1)" position="relative" overflow="hidden">
              <Box as="img" className="pooPixelDecor" src={PIXEL_ASSETS.bubbleCorner} alt="" loading="lazy" position="absolute" right="-8px" top="-8px" w="72px" opacity="0.20" />
              <HStack justify="space-between" align="start" gap="3" wrap="wrap" mb="3">
                <Box minW="0" flex="1">
                  <Text fontSize="sm" color={COLORS.muted} fontWeight="700">Bài đang luyện</Text>
                  <Text mt="1" fontSize={{ base: 'lg', md: '2xl' }} color={COLORS.text} fontWeight="800" lineHeight="1.18" noOfLines={{ base: 2, md: 1 }}>{selectedVideo?.title}</Text>
                  <Text mt="1" color={COLORS.muted} fontSize="sm" fontWeight="700" noOfLines={1}>{selectedVideo?.level} · {selectedVideo?.duration} · {selectedVideo?.topic}</Text>
                </Box>
                <HStack gap="2" wrap="wrap" justify="end">
                  <Chip tone={speechSupported ? 'green' : 'amber'}>{speechSupported ? `Giọng mẫu ${speed}x` : 'Chưa có giọng đọc'}</Chip>
                  <Chip tone={speechRecognitionSupported ? 'green' : 'amber'}>{speechRecognitionSupported ? 'Chrome chấm nói' : 'Ghi âm dự phòng'}</Chip>
                </HStack>
              </HStack>

              <Box data-testid="shadowing-current-sentence" p={{ base: '3', md: '4' }} borderRadius="3xl" bg="linear-gradient(135deg, rgba(221,245,255,0.82), rgba(248,252,255,0.92))" border="1px solid" borderColor="#BAE6FD" minW="0" scrollMarginBottom="calc(var(--penglish-mobile-safe-bottom) + 112px)" position="relative" overflow="hidden">
                <HStack justify="space-between" align="start" gap="3" wrap="wrap">
                  <Box minW="0">
                    <Text fontSize="sm" color={COLORS.deepBlue} fontWeight="900">Câu đang luyện</Text>
                    <Text data-testid="shadowing-current-line-count" mt="1" fontSize="xs" color={COLORS.muted} fontWeight="800">Câu {selectedSentenceIndex >= 0 ? selectedSentenceIndex + 1 : 0}/{transcriptLength}</Text>
                  </Box>
                  <HStack gap="2" wrap="wrap">
                    {selectedSentencePracticed ? <Box as="img" className="pooPixelBadge" src={PIXEL_ASSETS.badgePracticed} alt="Đã luyện" loading="lazy" w="34px" h="34px" /> : null}
                    {selectedSentencePracticed ? <Chip tone="green">Đã luyện</Chip> : null}
                    {selectedSentenceDifficult ? <Box as="img" className="pooPixelBadge" src={PIXEL_ASSETS.badgeHard} alt="Câu khó" loading="lazy" w="34px" h="34px" /> : null}
                    {selectedSentenceDifficult ? <Chip tone="amber">Câu còn vấp</Chip> : null}
                  </HStack>
                </HStack>

                <Text mt="3" fontSize={{ base: 'xl', md: '3xl' }} color={COLORS.text} fontWeight="900" lineHeight="1.18">{selectedSentence?.text ?? 'Chọn một câu trong lời thoại để bắt đầu.'}</Text>
                {selectedSentence?.vi ? <Text mt="1.5" color={COLORS.muted} fontSize={{ base: 'sm', md: 'md' }} fontWeight="700" lineHeight="1.45">{selectedSentence.vi}</Text> : null}
                {selectedSentence?.focusNotes?.length ? <Text mt="2" color={COLORS.deepBlue} fontSize="sm" fontWeight="800" lineHeight="1.4" noOfLines={{ base: 2, md: undefined }}>Poo nhắc: {selectedSentence.focusNotes.slice(0, 2).join(' · ')}</Text> : null}

                <HStack mt="3" gap="2" wrap="wrap">
                  {[0.75, 1, 1.25].map((value) => (
                    <Button key={value} size="sm" borderRadius="full" colorScheme={speed === value ? 'blue' : 'gray'} aria-pressed={speed === value} onClick={() => setSpeed(value)} isDisabled={isProcessingRecording}>{value}x</Button>
                  ))}
                  <Button data-testid="shadowing-listen-button" size={{ base: 'sm', md: 'md' }} leftIcon={<Box as="img" className="pooPixelIcon" src={PIXEL_ASSETS.speakerSample} alt="Loa nghe mẫu" w="24px" h="24px" />} borderRadius="full" bg="white" color={COLORS.deepBlue} border="1px solid" borderColor="#BAE6FD" _hover={{ bg: COLORS.softBlue }} onClick={listenSentence} isDisabled={isProcessingRecording}>Nghe mẫu</Button>
                  <Button className="shadowing-record-button" data-testid="shadowing-record-button" size={{ base: 'sm', md: 'md' }} leftIcon={<Box as="img" className="pooPixelIcon" src={micPixelSrc} alt={isRecording ? 'Micro đang nghe' : apiFeedback ? 'Micro nghe thành công' : apiError ? 'Micro gặp lỗi' : 'Micro luyện nói'} w="24px" h="24px" />} borderRadius="full" bg={isRecording ? '#EF4444' : COLORS.deepBlue} color="white" _hover={{ bg: isRecording ? '#DC2626' : COLORS.oceanBlue }} aria-label={isRecording ? 'Dừng thu âm' : 'Nói theo Poo'} aria-pressed={isRecording} onClick={handleRecordButtonActivate} onPointerUp={handleRecordButtonActivate} onTouchEnd={handleRecordButtonActivate} isDisabled={isProcessingRecording} isLoading={isProcessingRecording} loadingText={processingMessage || 'Poo đang góp ý cho bạn...'}>
                    {isRecording ? 'Dừng thu' : 'Nói theo Poo'}
                  </Button>
                  <Button data-testid="shadowing-next-button" size={{ base: 'sm', md: 'md' }} leftIcon={<Box as="img" className="pooPixelIcon" src={PIXEL_ASSETS.nextWave} alt="Sóng chuyển câu" w="24px" h="24px" />} borderRadius="full" variant="outline" colorScheme="blue" onClick={goToNextSentence} isDisabled={selectedSentenceIndex >= transcriptLength - 1 || isProcessingRecording}>Câu tiếp theo</Button>
                </HStack>

                <Box as="img" className="pooPixelDecor" src={PIXEL_ASSETS.waveDivider} alt="" loading="lazy" mt="3" w="100%" maxH="18px" opacity="0.34" />

                <Box mt="3" position="relative" p="3" borderRadius="2xl" bg={isRecording ? '#FEF2F2' : isProcessingRecording ? 'rgba(232,244,255,0.9)' : 'rgba(255,255,255,0.74)'} border="1px solid" borderColor={isRecording ? '#FECACA' : '#BAE6FD'} overflow="hidden">
                  <Box ref={recordPulseRef} position="absolute" inset="10px" borderRadius="3xl" bg="rgba(239,68,68,0.18)" pointerEvents="none" />
                  <HStack position="relative" justify="space-between" gap="3" wrap="wrap">
                    <HStack gap="3" minW="0">
                      <Flex w="40px" h="40px" borderRadius="full" bg={isRecording ? '#FEE2E2' : COLORS.softAqua} align="center" justify="center" flexShrink={0}>
                        <Box as="img" className="pooPixelIcon" src={micPixelSrc} alt={isRecording ? 'Micro đang nghe' : apiFeedback ? 'Micro nghe thành công' : apiError ? 'Micro gặp lỗi' : 'Micro sẵn sàng'} w="26px" h="26px" />
                      </Flex>
                      <Box minW="0">
                        <Text fontWeight="800" color={COLORS.text}>{isRecording ? 'Đang nghe...' : isProcessingRecording ? processingMessage : apiFeedback ? 'Đã có góp ý' : apiError ? 'Poo nghe chưa rõ' : 'Sẵn sàng nói thử'}</Text>
                        <Text fontSize="sm" color={COLORS.muted} fontWeight="700" noOfLines={{ base: 3, md: 2 }}>{isRecording ? `Tự dừng sau ${formatTimer(Math.max(0, Math.ceil(SHADOWING_RECORDING_TIMEOUT_MS / 1000) - elapsedSeconds))}` : recordMessage}</Text>
                      </Box>
                    </HStack>
                    {isRecording ? <Text fontSize="lg" fontWeight="900" color="#991B1B">{formatTimer(elapsedSeconds)}</Text> : null}
                  </HStack>
                </Box>

                {mediaMessage ? <Text mt="2" fontSize="sm" color={COLORS.deepBlue} fontWeight="800" role="status" aria-live="polite">{mediaMessage}</Text> : null}
              </Box>

              {hasSelectedVideoUrl ? (
                <Box data-testid="shadowing-video-reference-details" as="details" mt="3" border="1px solid" borderColor="#BAE6FD" borderRadius="2xl" bg="rgba(248,252,255,0.72)" overflow="hidden">
                  <Box as="summary" cursor="pointer" px="4" py="3" fontWeight="800" color={COLORS.deepBlue}>Video tham khảo nếu cần</Box>
                  <Box px="4" pb="4">
                    {hasSelectedYouTubeVideo && !youtubeFallbackVisible ? (
                      <Box as="iframe" title={selectedVideo?.referenceVideoTitle ?? selectedVideo?.title ?? 'Video tham khảo cho bài nói đuổi'} src={selectedYouTubeEmbedUrl} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen w="100%" h={{ base: '180px', md: '220px' }} maxH="220px" border="0" borderRadius="22px" bg="#E8F4FF" onError={() => { setYoutubeFallbackVisible(true); setMediaMessage(YOUTUBE_FALLBACK_MESSAGE); }} onLoad={() => setMediaMessage('Video tham khảo; lời thoại bên dưới vẫn là phần luyện chính.')} />
                    ) : (youtubeFallbackVisible || shouldShowReferenceFallback) ? (
                      <Flex data-testid="shadowing-video-fallback" borderRadius="22px" minH="140px" bg="linear-gradient(135deg, #E8F4FF 0%, #F8FCFF 100%)" color={COLORS.text} align="center" justify="center" textAlign="center" p="4" direction="column" gap="2" border="1px solid" borderColor="#BAE6FD" overflow="hidden">
                        <Text maxW="640px" fontSize="sm" fontWeight="800" lineHeight="1.5">{YOUTUBE_FALLBACK_MESSAGE}</Text>
                        {selectedYouTubeWatchUrl ? <Button size="sm" as="a" href={selectedYouTubeWatchUrl} target="_blank" rel="noopener noreferrer" leftIcon={<Icon as={Video} />} borderRadius="full" bg={COLORS.deepBlue} color="white" _hover={{ bg: COLORS.oceanBlue }}>Mở trên YouTube</Button> : null}
                      </Flex>
                    ) : (
                      <video ref={videoRef} src={selectedVideo?.videoUrl} controls onLoadedData={() => setMediaMessage('')} onError={() => setMediaMessage('Video không tải được. Chuyển sang luyện bằng lời thoại và nói thử cùng Poo để không gián đoạn bài học.')} style={{ width: '100%', borderRadius: 22, background: '#102A43', display: 'block' }} />
                    )}
                  </Box>
                </Box>
              ) : null}
            </Box>

            {(apiFeedback || apiError || isProcessingRecording) ? feedbackPanel : null}

            <SimpleGrid data-testid="shadowing-progress" ref={completionRef} columns={{ base: 1, md: 2 }} gap="3">
              <Box className="shadowing-custom-card" p="4" borderRadius="2xl" bg={allSentencesCompleted ? '#F0FDF4' : 'rgba(232,244,255,0.88)'} border="1px solid" borderColor={allSentencesCompleted ? '#BBF7D0' : '#BAE6FD'} role="status" aria-live="polite">
                <HStack><Icon as={allSentencesCompleted ? CheckCircle2 : Sparkles} color={allSentencesCompleted ? COLORS.green : COLORS.oceanBlue} /><Text fontWeight="800" color={COLORS.text}>{allSentencesCompleted ? 'Hoàn thành lượt nói đuổi' : 'Nhịp luyện hôm nay'}</Text></HStack>
                <Text mt="2" color={COLORS.muted} fontSize="sm" fontWeight="700">Câu {selectedSentenceIndex >= 0 ? selectedSentenceIndex + 1 : 0}/{transcriptLength}. Đã luyện {completedCount}/{transcriptLength}. Câu còn vấp {difficultCount}. Poo giữ lại nhịp luyện theo từng bài.</Text>
              </Box>
              <Box className="shadowing-weak-card" p="4" borderRadius="2xl" bg="#FFFBEB" border="1px solid" borderColor="#FDE68A">
                <Text fontWeight="800" color={COLORS.text}>Câu nên luyện tiếp</Text>
                <Text mt="2" color={COLORS.muted} fontSize="sm" fontWeight="700">{weakSentence?.text ?? 'Chọn một câu để bắt đầu.'}</Text>
                <Text mt="2" color={COLORS.muted} fontSize="xs" fontWeight="800">Gợi ý: nghe mẫu, nói theo Poo, rồi xem từ còn thiếu và nhấn âm.</Text>
              </Box>
            </SimpleGrid>
          </VStack>

          <VStack align="stretch" gap={{ base: '3', md: '4' }} minW="0" w={{ base: '100%', lg: '340px' }} flexShrink={0} position={{ lg: 'sticky' }} top={{ lg: '96px' }} maxH={{ lg: 'calc(100vh - 120px)' }} overflowY={{ lg: 'auto' }} pb={{ base: '96px', lg: '2' }} pr={{ lg: '1' }}>
            <Box data-testid="shadowing-lesson-picker" as="details" open={typeof window !== 'undefined' ? window.innerWidth >= 1024 : true} className="shadowing-custom-card penglish-glass-card" p="4" borderRadius="3xl" bg="rgba(255,255,255,0.78)" border="1px solid" borderColor="#BAE6FD" boxShadow="0 12px 30px rgba(16, 42, 67, 0.05)" backdropFilter="blur(14px) saturate(1.1)">
              <Box as="summary" cursor="pointer" fontWeight="700" color={COLORS.text}>Danh sách bài luyện</Box>
              <HStack justify="space-between" mb="3" align="start" gap="3">
                <Box>
                  <Text fontWeight="700" color={COLORS.text}>Chọn bài nói đuổi</Text>
                  <Text fontSize="sm" color={COLORS.muted}>Chọn một bài ngắn, luyện từng câu theo 3 bước. Video chỉ là tham khảo; lời thoại là phần luyện chính.</Text>
                </Box>
                <Icon as={Video} color={COLORS.oceanBlue} />
              </HStack>
              <VStack align="stretch" gap="2" maxH={{ base: '220px', lg: '380px' }} overflowY="auto" pr="1" scrollPaddingBottom="calc(var(--penglish-mobile-safe-bottom) + 96px)">
                {videos.map((item) => {
                  const active = item.id === selectedVideo?.id;
                  return (
                    <Box data-testid={`shadowing-video-card-${item.id}`} className="shadowing-video-card" key={item.id} as="button" type="button" textAlign="left" p="3" borderRadius="2xl" bg={active ? COLORS.softBlue : 'rgba(255,255,255,0.78)'} border="1px solid" borderColor={active ? '#7DD3FC' : COLORS.border} boxShadow={active ? '0 10px 24px rgba(31, 111, 214, 0.10)' : 'none'} onClick={() => navigate(`/shadowing/practice/${item.id}`)} w="100%" minW="0" willChange="transform, opacity" scrollMarginBottom="calc(var(--penglish-mobile-safe-bottom) + 96px)" aria-pressed={active} aria-label={`Chọn bài nói đuổi: ${item.title}`} _focusVisible={{ outline: '3px solid', outlineColor: COLORS.oceanBlue, outlineOffset: '2px' }}>
                      <Text fontWeight="700" color={COLORS.text} noOfLines={1}>{item.title}</Text>
                      <Text fontSize="sm" color={COLORS.muted} noOfLines={2}>{item.description}</Text>
                      {item.referenceVideoTitle ? <Text mt="1" fontSize="xs" color={COLORS.deepBlue} fontWeight="700" noOfLines={1}>{item.referenceVideoTitle}</Text> : null}
                      <HStack mt="2" gap="2" wrap="wrap"><Tag size="sm"><TagLabel>{item.level}</TagLabel></Tag><Tag size="sm"><TagLabel>{item.duration}</TagLabel></Tag><Tag size="sm"><TagLabel>{item.embedAllowed ? 'Video tham khảo' : item.videoUrl?.trim() || item.youtubeId ? 'Có link tham khảo' : 'Luyện bằng lời thoại'}</TagLabel></Tag></HStack>
                    </Box>
                  );
                })}
              </VStack>
            </Box>

            <Box data-testid="shadowing-transcript-panel" as="details" open={typeof window !== 'undefined' ? window.innerWidth >= 1024 : true} className="shadowing-transcript-panel penglish-glass-card" p="4" borderRadius="3xl" bg="rgba(255,255,255,0.78)" border="1px solid" borderColor="#BAE6FD" minW="0" willChange="transform, opacity" boxShadow="0 14px 34px rgba(31, 111, 214, 0.06)" backdropFilter="blur(14px) saturate(1.1)">
              <Box as="summary" cursor="pointer" fontWeight="700" color={COLORS.text}>Lời thoại</Box>
              <HStack mb="3" justify="space-between" align="start" gap="3">
                <HStack><Icon as={Volume2} color={COLORS.oceanBlue} /><Text as="h2" fontWeight="700" color={COLORS.text}>Lời thoại</Text></HStack>
                <Chip tone="blue">{transcriptLength} câu</Chip>
              </HStack>
              <VStack align="stretch" gap="2" maxH={{ base: '220px', lg: '360px' }} overflowY="auto" pr="1" scrollPaddingBottom="calc(var(--penglish-mobile-safe-bottom) + 96px)">
                {(selectedVideo?.transcript ?? []).map((sentence, index) => {
                  const active = sentence.id === selectedSentence?.id;
                  const done = isPracticed(sentence.id);
                  const difficult = isDifficult(sentence.id);
                  return (
                    <Box key={sentence.id} data-testid={`shadowing-transcript-sentence-${index + 1}`} data-shadowing-sentence-id={sentence.id} as="button" type="button" textAlign="left" p="3" borderRadius="2xl" bg={active ? COLORS.softAqua : done ? '#F0FDF4' : difficult ? '#FFFBEB' : 'white'} border="1px solid" borderColor={active ? '#7DD3FC' : difficult ? '#FDE68A' : done ? '#BBF7D0' : COLORS.border} boxShadow={active ? '0 14px 28px rgba(47, 158, 235, 0.13)' : 'none'} onClick={() => setCurrentLineIndex(index)} w="100%" minW="0" willChange="transform, opacity" scrollMarginBottom="calc(var(--penglish-mobile-safe-bottom) + 96px)" aria-current={active ? 'step' : undefined} aria-label={`Chọn câu ${index + 1}: ${sentence.text}`} _focusVisible={{ outline: '3px solid', outlineColor: COLORS.oceanBlue, outlineOffset: '2px' }}>
                      <HStack align="start" gap="3">
                        <Flex w="30px" h="30px" borderRadius="full" bg={done ? COLORS.green : active ? COLORS.oceanBlue : difficult ? '#F59E0B' : COLORS.softBlue} color={done || active || difficult ? 'white' : COLORS.deepBlue} align="center" justify="center" fontWeight="700" flexShrink={0}>{done ? <Icon as={CheckCircle2} boxSize="4" /> : difficult ? <Icon as={AlertCircle} boxSize="4" /> : index + 1}</Flex>
                        <Box minW="0">
                          <HStack gap="2" wrap="wrap" mb="1">
                            {active ? <Chip tone="blue">Đang luyện</Chip> : null}
                            {done ? <Box as="img" className="pooPixelBadge" src={PIXEL_ASSETS.badgePracticed} alt="Đã luyện" loading="lazy" w="32px" h="32px" /> : null}
                            {done ? <Chip tone="green">Đã luyện</Chip> : null}
                            {difficult ? <Box as="img" className="pooPixelBadge" src={PIXEL_ASSETS.badgeHard} alt="Câu khó" loading="lazy" w="32px" h="32px" /> : null}
                            {difficult ? <Chip tone="amber">Câu còn vấp</Chip> : null}
                          </HStack>
                          <Text fontWeight="700" color={COLORS.text} lineHeight="1.45">{sentence.text}</Text>
                          <Text fontSize="sm" color={COLORS.muted} lineHeight="1.55">{sentence.vi}</Text>
                        </Box>
                      </HStack>
                    </Box>
                  );
                })}
              </VStack>
            </Box>

            <Box data-testid="shadowing-custom-transcript" as="details" className="shadowing-custom-card penglish-glass-card" p="4" borderRadius="3xl" bg="rgba(248,252,255,0.78)" border="1px solid" borderColor={COLORS.border} boxShadow="0 10px 24px rgba(16, 42, 67, 0.04)" backdropFilter="blur(14px) saturate(1.1)">
              <Box as="summary" cursor="pointer" fontWeight="700" color={COLORS.text}>Tự tạo lời thoại với Poo</Box>
              <HStack mb="3" align="start">
                <Icon as={Upload} color={COLORS.deepBlue} />
                <Box>
                  <Text fontWeight="700" color={COLORS.text}>Tự tạo lời thoại với Poo</Text>
                  <Text fontSize="sm" color={COLORS.muted}>Dán từng câu trên một dòng. Link video chỉ để tham khảo, không cần tải video lên.</Text>
                </Box>
              </HStack>
              <VStack align="stretch" gap="3">
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="700" color={COLORS.text}>Tiêu đề bài luyện</FormLabel>
                  <Input data-testid="shadowing-custom-title-input" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="Ví dụ: My daily English practice" bg="white" borderRadius="xl" />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="700" color={COLORS.text}>Link video tham khảo (không bắt buộc)</FormLabel>
                  <Input data-testid="shadowing-custom-url-input" value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} placeholder="Dán link video nếu bạn có" bg="white" borderRadius="xl" scrollMarginBottom="calc(var(--penglish-mobile-safe-bottom) + 96px)" />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="700" color={COLORS.text}>Lời thoại - mỗi dòng là một câu</FormLabel>
                  <Textarea data-testid="shadowing-custom-transcript-textarea" value={customTranscript} onChange={(e) => setCustomTranscript(e.target.value)} placeholder={'Hello, my name is Anna.\nI am learning English every day.'} bg="white" borderRadius="xl" minH="130px" />
                </FormControl>
                <Flex gap="2" wrap="wrap">
                  <Button data-testid="shadowing-create-custom-button" leftIcon={<Icon as={PlusCircle} />} borderRadius="full" bg={COLORS.oceanBlue} color="white" _hover={{ bg: COLORS.deepBlue }} onClick={createCustomPractice}>Tạo bài luyện</Button>
                  {customVideo ? <Button data-testid="shadowing-remove-custom-button" leftIcon={<Icon as={Trash2} />} borderRadius="full" variant="outline" colorScheme="red" onClick={removeCustomPractice}>Xóa bài tự tạo</Button> : null}
                </Flex>
                <Text fontSize="sm" color={COLORS.muted} role="status" aria-live="polite">{customMessage}</Text>
                <Text fontSize="xs" color={COLORS.muted}>Dùng Tab để đi qua từng câu; Enter hoặc Space để chọn câu.</Text>
              </VStack>
            </Box>
          </VStack>
        </Flex>
      </Box>
    </OceanPageShell>
  );
}

export function ShadowingPage() {
  return <ShadowingPracticePage />;
}

