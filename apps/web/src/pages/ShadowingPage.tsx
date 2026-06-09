import { useEffect, useMemo, useRef, useState } from 'react';
import { saveShadowingAttempt } from '../lib/p-english/userDataAdapter';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { Box, Button, Flex, FormControl, FormLabel, HStack, Icon, Input, SimpleGrid, Tag, TagLabel, Text, Textarea, VStack } from '@chakra-ui/react';
import { AlertCircle, CheckCircle2, Headphones, Loader2, Mic, Pause, PlusCircle, RotateCcw, SkipForward, Sparkles, Trash2, Upload, Video, Volume2, Waves } from 'lucide-react';
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

const CUSTOM_SHADOWING_STORAGE_KEY = 'p-english:custom-shadowing-item';
const DEFAULT_CUSTOM_VIDEO_URL = '';
const SHADOWING_WORKFLOW_STEPS = ['Nghe', 'Lặp lại', 'Ghi âm', 'Xem góp ý', 'Câu tiếp theo'];

type RecordingStatus = 'idle' | 'recording' | 'analyzing' | 'result' | 'error';

function getStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

const YOUTUBE_EMBED_TIMEOUT_MS = 1800;
const YOUTUBE_FALLBACK_MESSAGE = 'Video này không phát trực tiếp trong web. Bạn vẫn có thể luyện bằng transcript bên dưới.';

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
      topic: String(parsed.topic || 'Bài Shadowing tự tạo'),
      duration: String(parsed.duration || `${transcript.length} câu`),
      videoUrl,
      description: String(parsed.description || 'Bài luyện Shadowing do bạn tự nhập transcript.'),
      transcript,
      transcriptLines: parsed.transcriptLines ?? transcript,
      youtubeId: String(parsed.youtubeId || ''),
      embedAllowed: false,
      focusNotes: parsed.focusNotes ?? ['Transcript tự tạo: đọc chậm, rõ âm cuối và giữ nhịp tự nhiên.'],
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
    coachMessage: score >= 80 ? `Poo thấy khá ổn: ${score}% giống câu mẫu.` : `Poo chấm local được ${score}%. Hãy luyện lại những từ còn thiếu nhé.`,
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

export function ShadowingPage() {
  const [customVideo, setCustomVideo] = useState<ShadowingVideo | null>(() => readCustomShadowingItem());
  const videos = useMemo(() => (customVideo ? [customVideo, ...shadowingVideos] : shadowingVideos), [customVideo]);
  const [selectedVideoId, setSelectedVideoId] = useState(customVideo?.id ?? shadowingVideos[0]?.id ?? '');
  const selectedVideo = useMemo(() => videos.find((item) => item.id === selectedVideoId) ?? videos[0], [selectedVideoId, videos]);
  const [customTitle, setCustomTitle] = useState(customVideo?.title ?? '');
  const [customUrl, setCustomUrl] = useState(customVideo?.videoUrl ?? '');
  const [customTranscript, setCustomTranscript] = useState(customVideo?.transcript.map((item) => item.text).join('\n') ?? '');
  const [customMessage, setCustomMessage] = useState(customVideo ? 'Đã tải bài Shadowing tự tạo từ thiết bị này.' : 'Dán mỗi câu trên một dòng để tạo bài luyện riêng.');
  const [speed, setSpeed] = useState(1);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [recordMessage, setRecordMessage] = useState('Poo sẽ nghe bản ghi và góp ý phát âm, nhịp, từ thiếu hoặc từ lệch.');
  const [mediaMessage, setMediaMessage] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [youtubeFallbackVisible, setYoutubeFallbackVisible] = useState(false);
  const [apiFeedback, setApiFeedback] = useState<ShadowingApiSuccess | null>(null);
  const [apiError, setApiError] = useState<ShadowingApiFailure | null>(null);
  const [localTranscript, setLocalTranscript] = useState('');
  const [shadowingSyncStatus, setShadowingSyncStatus] = useState<'local' | 'synced' | 'failed'>('local');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
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
  const isRecording = recordingStatus === 'recording';
  const isAnalyzing = recordingStatus === 'analyzing';
  const pooMoodLabel = isRecording ? 'Poo đang nghe…' : isAnalyzing ? 'Poo đang nghe lại và phân tích cách nói của bạn…' : apiFeedback ? 'Poo đã có góp ý AI cho lượt nói này' : apiError ? 'Poo cần bạn thử lại một chút' : 'Poo sẵn sàng nghe bạn nói';

  useEffect(() => {
    setYoutubeFallbackVisible(false);
    setMediaMessage(selectedVideo?.videoUrl?.trim() ? 'Transcript local là nguồn luyện chính. Video tham chiếu chỉ hỗ trợ khi nền tảng cho phép phát trong web.' : 'Bài này đang ở chế độ transcript-only. Nút nghe dùng giọng đọc trình duyệt nếu được hỗ trợ.');
    setApiFeedback(null);
    setApiError(null);
    setLocalTranscript('');
    setRecordingStatus('idle');
    setElapsedSeconds(0);
    setRecordMessage('Poo sẽ nghe bản ghi và góp ý phát âm, nhịp, từ thiếu hoặc từ lệch.');
    setShadowingSyncStatus('local');
  }, [selectedVideo?.id, selectedVideo?.videoUrl]);

  useEffect(() => {
    setApiFeedback(null);
    setApiError(null);
    setLocalTranscript('');
    setRecordingStatus('idle');
    setElapsedSeconds(0);
    setRecordMessage('Poo sẽ nghe bản ghi và góp ý phát âm, nhịp, từ thiếu hoặc từ lệch.');
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
    if (!speechSupported) {
      setMediaMessage('Trình duyệt chưa hỗ trợ giọng đọc mẫu. Hãy đọc câu mẫu, ghi âm, rồi để Poo gửi bản ghi cho AI góp ý.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(selectedSentence.text);
    utterance.lang = 'en-US';
    utterance.rate = speed;
    window.speechSynthesis.speak(utterance);
    setMediaMessage(`Đang dùng giọng đọc trình duyệt ở tốc độ ${speed}x. Đây không phải audio mẫu thu sẵn.`);
  };

  const replaySentence = async () => {
    if (!selectedSentence) return;
    if (!videoRef.current || !selectedVideo?.videoUrl?.trim()) {
      listenSentence();
      setRecordMessage('Không có video mẫu thu sẵn. Poo dùng giọng đọc trình duyệt nếu có; sau đó bạn ghi âm để AI góp ý.');
      return;
    }

    videoRef.current.currentTime = selectedSentence.start;
    videoRef.current.playbackRate = speed;
    await videoRef.current.play().catch(() => {
      setMediaMessage('Video không phát được. Bạn vẫn có thể luyện bằng transcript, giọng đọc trình duyệt và ghi âm.');
    });
  };

  const sendRecordingForFeedback = async (blob: Blob) => {
    setRecordingStatus('analyzing');
    setRecordMessage('Poo đang nghe và phân tích giọng nói...');
    const result = await requestShadowingFeedback({
      audio: blob,
      targetText: selectedSentence?.text ?? '',
      translation: selectedSentence?.vi ?? '',
      lessonTitle: selectedVideo?.title,
      level: selectedVideo?.level,
      sentenceIndex: selectedSentenceIndex + 1,
    });

    if (result.ok) {
      setApiFeedback(result);
      setApiError(null);
      setRecordingStatus('result');
      setRecordMessage(result.score < 78 ? `${result.coachMessage} Poo đã lưu câu này vào Practice để ôn lại.` : result.coachMessage);
      markSentenceCompleted(selectedSentence?.id);
    } else {
      const fallback = localTranscript.trim()
        ? compareShadowingTranscript(selectedSentence?.text ?? '', localTranscript.trim())
        : null;
      if (fallback) {
        setApiFeedback(fallback);
        setApiError(null);
        setRecordingStatus('result');
        setRecordMessage(`${fallback.coachMessage} Góp ý này chạy trực tiếp trên web bằng transcript bạn nhập.${fallback.score < 78 ? ' Poo đã lưu câu này vào Practice để ôn lại.' : ''}`);
        markSentenceCompleted(selectedSentence?.id);
        saveAttempt(fallback);
        return;
      }
      setApiFeedback(null);
      setApiError(result);
      setRecordingStatus('error');
      setRecordMessage(result.message);
    }
    saveAttempt(result);
  };

  const startRecording = async () => {
    if (!('MediaRecorder' in window) || !navigator.mediaDevices?.getUserMedia) {
      const failure: ShadowingApiFailure = { ok: false, error: 'NO_AUDIO', message: 'Trình duyệt chưa hỗ trợ ghi âm trực tiếp. Hãy thử Chrome/Edge mới hơn.' };
      setApiError(failure);
      setRecordingStatus('error');
      setRecordMessage(failure.message);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const preferredMimeType = getPreferredAudioMimeType();
      const recorder = preferredMimeType ? new MediaRecorder(stream, { mimeType: preferredMimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || preferredMimeType || 'audio/webm' });
        if (blob.size <= 0) {
          const failure: ShadowingApiFailure = { ok: false, error: 'EMPTY_AUDIO', message: 'Poo chưa nghe được âm thanh. Hãy thử nói gần micro hơn.' };
          setApiFeedback(null);
          setApiError(failure);
          setRecordingStatus('error');
          setRecordMessage(failure.message);
          saveAttempt(failure);
          return;
        }
        void sendRecordingForFeedback(blob);
      };
      recorder.start(250);
      setElapsedSeconds(0);
      setApiFeedback(null);
      setApiError(null);
      setRecordingStatus('recording');
      setRecordMessage('Poo đang nghe…');
    } catch {
      const failure: ShadowingApiFailure = { ok: false, error: 'NO_AUDIO', message: 'Trình duyệt chưa cho phép micro. Hãy bật quyền micro rồi thử lại.' };
      setApiError(failure);
      setRecordingStatus('error');
      setRecordMessage(failure.message);
    }
  };

  const stopAndSendRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleRecordAction = () => {
    if (recordingStatus === 'recording') {
      stopAndSendRecording();
      return;
    }
    void startRecording();
  };

  const retryRecording = () => {
    setApiFeedback(null);
    setApiError(null);
    setLocalTranscript('');
    setRecordingStatus('idle');
    setElapsedSeconds(0);
    setRecordMessage('Poo sẽ nghe bản ghi và góp ý phát âm, nhịp, từ thiếu hoặc từ lệch.');
  };

  const goToNextSentence = () => {
    if (!selectedVideo?.transcript.length) return;
    goNext();
  };

  const createCustomPractice = () => {
    const transcript = createSegmentsFromTranscript(customTranscript);
    if (transcript.length === 0) {
      setCustomMessage('Bạn cần nhập ít nhất một câu transcript để tạo bài luyện.');
      return;
    }

    const next: ShadowingVideo = {
      id: 'custom-shadowing-local',
      title: customTitle.trim() || 'Bài Shadowing tự tạo',
      level: 'Tự tạo',
      topic: 'Transcript thủ công',
      duration: `${transcript.length} câu`,
      videoUrl: customUrl.trim(),
      description: 'Bài luyện Shadowing được tạo từ transcript bạn nhập và lưu cục bộ trên thiết bị này.',
      transcript,
      transcriptLines: transcript,
      youtubeId: '',
      embedAllowed: false,
      focusNotes: ['Transcript tự tạo: đọc chậm, rõ âm cuối và giữ nhịp tự nhiên.'],
      referenceVideoUrl: customUrl.trim(),
    };

    writeCustomShadowingItem(next);
    setCustomVideo(next);
    setSelectedVideoId(next.id);
    setCurrentLineIndex(0);
    setCustomMessage(`Đã tạo bài luyện với ${transcript.length} câu. Bấm từng câu trong transcript để luyện.`);
  };

  const removeCustomPractice = () => {
    deleteCustomShadowingItem();
    setCustomVideo(null);
    setSelectedVideoId(shadowingVideos[0]?.id ?? '');
    setCustomMessage('Đã xóa bài tự tạo khỏi thiết bị này.');
  };

  const feedbackPanel = (
    <Box data-testid="shadowing-feedback-panel" className="shadowing-feedback-panel penglish-glass-card" p={{ base: '4', md: '5' }} borderRadius="3xl" bg="rgba(255,255,255,0.78)" border="1px solid" borderColor="#BAE6FD" boxShadow="0 14px 34px rgba(31, 111, 214, 0.07)" backdropFilter="blur(14px) saturate(1.1)">
      <Flex mb="4" justify="space-between" align={{ base: 'start', md: 'center' }} gap="4" direction={{ base: 'column', md: 'row' }}>
        <HStack align="center" gap="3" minW="0">
          <Box data-testid="poo-shadowing-coach" position="relative" w="78px" flexShrink={0} pointerEvents="none" aria-hidden="true" overflow="visible">
            <OceanMascot mascot="poo" pose="coach" size="md" decorative motion="float" />
          </Box>
          <Box minW="0">
            <Text as="h2" fontWeight="700" color={COLORS.text}>Poo góp ý cách nói</Text>
            <Text mt="1" fontSize="sm" color={COLORS.muted} fontWeight="700">{pooMoodLabel}</Text>
          </Box>
        </HStack>
        <VStack align={{ base: 'start', md: 'end' }} gap="2">
          <Chip tone={apiFeedback ? 'green' : apiError ? 'amber' : 'blue'}>{apiFeedback ? 'Góp ý sẵn sàng' : apiError ? 'Cần thử lại' : 'Poo feedback'}</Chip>
          <Text data-testid="shadowing-sync-status" fontSize="xs" color={shadowingSyncStatus === 'synced' ? '#166534' : shadowingSyncStatus === 'failed' ? '#92400E' : COLORS.muted} fontWeight="700" role="status" aria-live="polite">
            {shadowingSyncStatus === 'synced' ? 'Đã đồng bộ lượt luyện' : shadowingSyncStatus === 'failed' ? 'Chưa đồng bộ được, vẫn giữ tiến độ local' : 'Tiến độ local vẫn an toàn'}
          </Text>
        </VStack>
      </Flex>

      {apiFeedback ? (
        <>
          <Box mb="4" p="3" borderRadius="2xl" bg="rgba(232,244,255,0.72)" border="1px solid" borderColor="#BAE6FD">
            <Text fontWeight="700" color={COLORS.text}>{apiFeedback.coachMessage}</Text>
            <Text mt="1" fontSize="sm" color={COLORS.muted} fontWeight="700">Điểm rõ ràng: {apiFeedback.score}/100 · Độ tin cậy: {apiFeedback.confidence}</Text>
          </Box>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
            <Box p="3" borderRadius="2xl" bg="rgba(221,245,255,0.62)" border="1px solid" borderColor="#BAE6FD">
              <Text fontSize="sm" fontWeight="700" color={COLORS.deepBlue}>Poo nghe được</Text>
              <Text mt="2" color={COLORS.text} fontWeight="700">{apiFeedback.transcript || 'Audio chưa đủ rõ để Poo ghi lại chắc chắn.'}</Text>
            </Box>
            <Box p="3" borderRadius="2xl" bg="#F0FDF4" border="1px solid" borderColor="#BBF7D0">
              <Text fontSize="sm" fontWeight="700" color="#166534">Bài luyện tiếp theo</Text>
              <Text mt="2" color={COLORS.muted} fontSize="sm">{apiFeedback.nextDrill || 'Đọc chậm câu mẫu, nghỉ một nhịp, rồi ghi âm lại.'}</Text>
            </Box>
            <FeedbackWordBox title="Từ khớp" empty="Chưa có từ khớp chắc chắn." tone="green" words={apiFeedback.matchedWords} />
            <FeedbackWordBox title="Từ còn thiếu" empty="Không thấy từ thiếu rõ ràng." tone="amber" words={apiFeedback.missingWords} />
            <FeedbackWordBox title="Từ bị thừa/lệch" empty="Không thấy từ thừa hoặc lệch rõ ràng." tone="red" words={[...apiFeedback.extraWords, ...apiFeedback.changedWords]} />
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
            <Button data-testid="shadowing-record-again-button" leftIcon={<Icon as={Mic} />} borderRadius="full" variant="outline" colorScheme="blue" onClick={retryRecording}>Ghi âm lại</Button>
            <Button data-testid="shadowing-next-sentence-button" leftIcon={<Icon as={SkipForward} />} borderRadius="full" bg={COLORS.deepBlue} color="white" _hover={{ bg: COLORS.oceanBlue }} onClick={goToNextSentence} isDisabled={selectedSentenceIndex >= transcriptLength - 1}>Câu tiếp theo</Button>
          </HStack>
        </>
      ) : apiError ? (
        <Box data-testid="shadowing-api-error" p="4" borderRadius="2xl" bg="#FFFBEB" border="1px solid" borderColor="#FDE68A">
          <HStack align="start" gap="3">
            <Icon as={AlertCircle} color="#92400E" />
            <Box>
              <Text fontWeight="700" color={COLORS.text}>{apiError.message}</Text>
              <Text mt="1" fontSize="sm" color={COLORS.muted}>Nếu chưa có API, hãy nhập câu bạn vừa nói vào ô fallback bên dưới để Poo so sánh local: từ thiếu, từ thừa/lệch, phần trăm giống và nhịp nói.</Text>
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
                setRecordMessage(`${fallback.coachMessage} Góp ý local không cần API.`);
                markSentenceCompleted(selectedSentence?.id);
                saveAttempt(fallback);
              }} isDisabled={!localTranscript.trim()}>So sánh local</Button>
              <Button data-testid="shadowing-record-retry-button" leftIcon={<Icon as={Mic} />} borderRadius="full" variant="outline" colorScheme="blue" onClick={retryRecording}>Ghi âm lại</Button>
            </HStack>
          </VStack>
        </Box>
      ) : (
        <Box p="4" borderRadius="2xl" bg="rgba(232,244,255,0.7)" border="1px solid" borderColor="#BAE6FD">
          <Text fontWeight="700" color={COLORS.text}>Sẵn sàng nhận góp ý AI.</Text>
          <Text mt="1" fontSize="sm" color={COLORS.muted} lineHeight="1.7">Nghe câu transcript hiện tại, bấm ghi âm, nói theo nhịp, rồi dừng để Poo chấm chính câu này.</Text>
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
              <Chip tone="blue">Nghe</Chip>
              <Chip tone="green">Lặp lại</Chip>
              <Chip tone="amber">Ghi âm</Chip>
              <Chip tone="gray">Góp ý local nếu thiếu API</Chip>
            </HStack>
            <Text as="h1" fontSize={{ base: 'xl', md: '4xl' }} fontWeight="800" color={COLORS.text} lineHeight="1.08">Shadowing cùng Poo</Text>
            <Text mt={{ base: '1.5', md: '3' }} color={COLORS.muted} maxW="800px" fontSize={{ base: 'sm', md: 'md' }} fontWeight="700" lineHeight={{ base: '1.4', md: '1.7' }} noOfLines={{ base: 3, md: undefined }}>Quy trình đơn giản: nghe câu → lặp lại → ghi âm → xem góp ý → sang câu tiếp theo. Nếu chưa có API, Poo vẫn so sánh local từ transcript bạn nhập.</Text>
            <HStack mt="4" gap="2" wrap="wrap" display={{ base: 'none', md: 'flex' }}>
              {SHADOWING_WORKFLOW_STEPS.map((step) => <Tag key={step} size="sm" borderRadius="full" bg="white" color={COLORS.deepBlue} border="1px solid" borderColor="#BAE6FD"><TagLabel>{step}</TagLabel></Tag>)}
            </HStack>
          </Box>
          <Flex position="relative" align="center" justify="center" minW={{ base: '100%', lg: '180px' }} pointerEvents="none" aria-hidden="true">
            <Box display={{ base: 'none', md: 'block' }} position="relative" w="150px">
              <OceanMascot mascot="suaNghe" pose="listen" size="lg" decorative motion="float" />
            </Box>
          </Flex>
        </Flex>

        <SimpleGrid columns={{ base: 1, lg: 12 }} gap={{ base: '3', md: '5' }} minW="0" alignItems="start">
          <VStack align="stretch" gap={{ base: '3', md: '5' }} minW="0" gridColumn={{ lg: 'span 8' }}>
            <Box data-testid="shadowing-practice-card" className="shadowing-practice-card penglish-glass-card" p={{ base: '3', md: '5' }} borderRadius="3xl" bg="rgba(255,255,255,0.78)" border="1px solid" borderColor="#BAE6FD" boxShadow="0 14px 34px rgba(31, 111, 214, 0.07)" minW="0" willChange="transform, opacity" backdropFilter="blur(14px) saturate(1.1)">
              <HStack justify="space-between" align="start" gap="3" wrap="wrap" mb={{ base: '2', md: '4' }}>
                <Box minW="0">
                  <Text fontSize="sm" color={COLORS.muted} fontWeight="700">Bài đang luyện</Text>
                  <Text mt="1" fontSize={{ base: 'lg', md: '2xl' }} color={COLORS.text} fontWeight="700" lineHeight="1.2" noOfLines={{ base: 2, md: undefined }}>{selectedVideo?.title}</Text>
                  <Text mt="1" color={COLORS.muted} fontSize="sm" fontWeight="700" noOfLines={{ base: 1, md: undefined }}>{selectedVideo?.level} · {selectedVideo?.duration} · {selectedVideo?.topic}</Text>
                  {selectedVideo?.referenceVideoTitle ? <Text mt="1" color={COLORS.deepBlue} fontSize="sm" fontWeight="700">Video tham khảo: {selectedVideo.referenceVideoTitle}</Text> : null}
                </Box>
                <Box display={{ base: 'none', sm: 'block' }}><Chip tone={hasSelectedVideoUrl ? 'green' : 'blue'}>{hasSelectedYouTubeVideo ? 'Video tham khảo' : hasSelectedVideoUrl ? 'Có link tham chiếu' : 'Luyện bằng transcript'}</Chip></Box>
              </HStack>

              <Box data-testid="shadowing-video-reference-details" as="details" display={{ base: hasSelectedVideoUrl ? 'block' : 'none', md: 'none' }} mb="3" border="1px solid" borderColor="#BAE6FD" borderRadius="2xl" bg="rgba(248,252,255,0.72)" overflow="hidden">
                <Box as="summary" cursor="pointer" px="4" py="3" fontWeight="700" color={COLORS.deepBlue}>Video tham khảo</Box>
                <Box px="4" pb="4">
                  {(youtubeFallbackVisible || shouldShowReferenceFallback) ? (
                    <Flex data-testid="shadowing-video-fallback-mobile" borderRadius="18px" maxH="200px" bg="linear-gradient(135deg, #E8F4FF 0%, #F8FCFF 100%)" color={COLORS.text} align="center" justify="center" textAlign="center" p="4" direction="column" gap="2" border="1px solid" borderColor="#BAE6FD" overflow="hidden">
                      <Text fontSize="sm" fontWeight="700" lineHeight="1.45">{YOUTUBE_FALLBACK_MESSAGE}</Text>
                      <Text fontSize="xs" color={COLORS.muted} fontWeight="700">{selectedVideo?.title} · {selectedVideo?.topic} · {selectedVideo?.level}</Text>
                      {selectedYouTubeWatchUrl ? <Button size="sm" as="a" href={selectedYouTubeWatchUrl} target="_blank" rel="noopener noreferrer" leftIcon={<Icon as={Video} />} borderRadius="full" bg={COLORS.deepBlue} color="white" _hover={{ bg: COLORS.oceanBlue }}>Mở trên YouTube</Button> : null}
                    </Flex>
                  ) : hasSelectedYouTubeVideo ? (
                    <Button as="a" href={selectedYouTubeWatchUrl} target="_blank" rel="noopener noreferrer" leftIcon={<Icon as={Video} />} borderRadius="full" w="100%" colorScheme="blue">Mở trên YouTube</Button>
                  ) : <Text fontSize="sm" color={COLORS.muted}>Bài này luyện chính bằng transcript.</Text>}
                </Box>
              </Box>

              <Box display={{ base: 'none', md: 'block' }}>
              {hasSelectedYouTubeVideo && !youtubeFallbackVisible ? (
                <Box as="iframe" title={selectedVideo?.referenceVideoTitle ?? selectedVideo?.title ?? 'Shadowing reference video'} src={selectedYouTubeEmbedUrl} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen w="100%" h={{ md: '220px', lg: '240px' }} maxH="240px" border="0" borderRadius="22px" bg="#E8F4FF" onError={() => { setYoutubeFallbackVisible(true); setMediaMessage(YOUTUBE_FALLBACK_MESSAGE); }} onLoad={() => setMediaMessage('Video tham khảo; transcript bên dưới vẫn là nguồn luyện chính.')} />
              ) : (youtubeFallbackVisible || shouldShowReferenceFallback) ? (
                <Flex data-testid="shadowing-video-fallback" borderRadius="22px" h={{ md: '200px', lg: '220px' }} maxH="240px" bg="linear-gradient(135deg, #E8F4FF 0%, #F8FCFF 100%)" color={COLORS.text} align="center" justify="center" textAlign="center" p={{ base: '4', md: '5' }} direction="column" gap="3" border="1px solid" borderColor="#BAE6FD" overflow="hidden">
                  <OceanMascot mascot="suaNghe" pose="listen" size="sm" decorative motion="pulse" />
                  <Text maxW="640px" fontSize={{ base: 'sm', md: 'md' }} fontWeight="700" lineHeight="1.5">{YOUTUBE_FALLBACK_MESSAGE}</Text>
                  <Text fontSize="sm" color={COLORS.muted} fontWeight="700">{selectedVideo?.title} · {selectedVideo?.topic} · {selectedVideo?.level}</Text>
                  {selectedYouTubeWatchUrl ? <Button as="a" href={selectedYouTubeWatchUrl} target="_blank" rel="noopener noreferrer" leftIcon={<Icon as={Video} />} borderRadius="full" bg={COLORS.deepBlue} color="white" _hover={{ bg: COLORS.oceanBlue }}>Mở trên YouTube</Button> : null}
                </Flex>
              ) : hasSelectedVideoUrl ? (
                <video
                  ref={videoRef}
                  src={selectedVideo?.videoUrl}
                  controls
                  onLoadedData={() => setMediaMessage('')}
                  onError={() => setMediaMessage('Video không tải được. Chuyển sang luyện bằng transcript và ghi âm để không gián đoạn bài học.')}
                  style={{ width: '100%', borderRadius: 22, background: '#102A43', display: 'block' }}
                />
              ) : (
                <Flex borderRadius="22px" minH={{ base: '138px', md: '168px' }} bg="linear-gradient(135deg, #E8F4FF 0%, #F8FCFF 100%)" color={COLORS.text} align="center" justify="center" textAlign="center" p={{ base: '5', md: '6' }} direction="column" gap="3" border="1px solid" borderColor="#BAE6FD">
                  <OceanMascot mascot="suaNghe" pose="wave" size="md" decorative motion="pulse" />
                  <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="700">Luyện bằng transcript</Text>
                  <Text maxW="620px" color={COLORS.muted} fontWeight="700" lineHeight="1.7">Bài built-in chưa có audio/video thu sẵn. Nút nghe sẽ dùng giọng đọc trình duyệt nếu hỗ trợ; nếu không, bạn vẫn đọc transcript và ghi âm để Poo góp ý.</Text>
                </Flex>
              )}
              </Box>

              <Box data-testid="shadowing-current-sentence" mt={{ base: '2', md: '4' }} p={{ base: '3', md: '5' }} borderRadius="3xl" bg="linear-gradient(135deg, rgba(221,245,255,0.76), rgba(248,252,255,0.84))" border="1px solid" borderColor="#BAE6FD" minW="0" scrollMarginBottom="calc(var(--penglish-mobile-safe-bottom) + 112px)">
                <HStack justify="space-between" align="start" gap="2" wrap="wrap">
                  <Box>
                    <Text fontSize="sm" color={COLORS.deepBlue} fontWeight="700">Câu hiện tại</Text>
                    <Text data-testid="shadowing-current-line-count" mt="1" fontSize="xs" color={COLORS.muted} fontWeight="700">Câu {selectedSentenceIndex >= 0 ? selectedSentenceIndex + 1 : 0}/{transcriptLength}</Text>
                  </Box>
                  <HStack gap="2" wrap="wrap">
                    {selectedSentence && isPracticed(selectedSentence.id) ? <Chip tone="green">Đã luyện</Chip> : null}
                    {selectedSentence && isDifficult(selectedSentence.id) ? <Chip tone="amber">Câu khó</Chip> : null}
                    <Chip tone={speechSupported ? 'green' : 'amber'}>{speechSupported ? `Tốc độ nghe ${speed}x` : 'Không có speech synthesis'}</Chip>
                  </HStack>
                </HStack>
                <SimpleGrid data-testid="shadowing-progress" ref={completionRef} mt="3" columns={{ base: 3, md: 3 }} gap="2" role="status" aria-live="polite">
                  <Box p="3" borderRadius="2xl" bg="white" border="1px solid" borderColor="#BAE6FD">
                    <Text fontSize="xs" color={COLORS.muted} fontWeight="700">Câu</Text>
                    <Text fontSize={{ base: 'lg', md: '2xl' }} color={COLORS.text} fontWeight="700">{selectedSentenceIndex >= 0 ? selectedSentenceIndex + 1 : 0}/{transcriptLength}</Text>
                  </Box>
                  <Box p="3" borderRadius="2xl" bg="#F0FDF4" border="1px solid" borderColor="#BBF7D0">
                    <Text fontSize="xs" color="#166534" fontWeight="700">Đã luyện</Text>
                    <Text data-testid="shadowing-practiced-count" fontSize={{ base: 'lg', md: '2xl' }} color="#166534" fontWeight="700">{completedCount}/{transcriptLength}</Text>
                  </Box>
                  <Box p="3" borderRadius="2xl" bg="#FFFBEB" border="1px solid" borderColor="#FDE68A">
                    <Text fontSize="xs" color="#92400E" fontWeight="700">Câu khó</Text>
                    <Text data-testid="shadowing-difficult-count" fontSize={{ base: 'lg', md: '2xl' }} color="#92400E" fontWeight="700">{difficultCount}</Text>
                  </Box>
                </SimpleGrid>
                <Text mt="3" fontSize={{ base: 'lg', md: '3xl' }} color={COLORS.text} fontWeight="700" lineHeight="1.22">{selectedSentence?.text ?? 'Chọn một câu trong transcript để bắt đầu.'}</Text>
                {selectedSentence?.vi ? <Text mt="1" color={COLORS.muted} fontSize={{ base: 'sm', md: 'md' }} fontWeight="600" lineHeight="1.45">{selectedSentence.vi}</Text> : null}
                {selectedSentence?.focusNotes?.length ? <Text mt="2" color={COLORS.deepBlue} fontSize="sm" fontWeight="700" lineHeight="1.45" noOfLines={{ base: 2, md: undefined }}>Focus: {selectedSentence.focusNotes.slice(0, 2).join(' · ')}</Text> : null}
                <HStack mt="3" gap="2" wrap="wrap">
                  <Button data-testid="shadowing-previous-button" size={{ base: 'sm', md: 'md' }} borderRadius="full" variant="outline" colorScheme="blue" onClick={goToPreviousSentence} isDisabled={selectedSentenceIndex <= 0 || isAnalyzing}>Câu trước</Button>
                  <Button data-testid="shadowing-next-button" size={{ base: 'sm', md: 'md' }} borderRadius="full" variant="outline" colorScheme="blue" onClick={goToNextSentence} isDisabled={selectedSentenceIndex >= transcriptLength - 1 || isAnalyzing}>Câu tiếp</Button>
                  <Button data-testid="shadowing-mark-practiced-button" size={{ base: 'sm', md: 'md' }} leftIcon={<Icon as={CheckCircle2} />} borderRadius="full" bg={selectedSentence && isPracticed(selectedSentence.id) ? COLORS.green : 'white'} color={selectedSentence && isPracticed(selectedSentence.id) ? 'white' : COLORS.deepBlue} border="1px solid" borderColor={selectedSentence && isPracticed(selectedSentence.id) ? COLORS.green : '#BAE6FD'} _hover={{ bg: selectedSentence && isPracticed(selectedSentence.id) ? '#16A34A' : COLORS.softBlue }} onClick={() => markPracticed(selectedSentence?.id)} isDisabled={!selectedSentence || isAnalyzing}>Đánh dấu đã luyện</Button>
                  <Button data-testid="shadowing-toggle-difficult-button" size={{ base: 'sm', md: 'md' }} leftIcon={<Icon as={AlertCircle} />} borderRadius="full" bg={selectedSentence && isDifficult(selectedSentence.id) ? '#F59E0B' : 'white'} color={selectedSentence && isDifficult(selectedSentence.id) ? 'white' : '#92400E'} border="1px solid" borderColor={selectedSentence && isDifficult(selectedSentence.id) ? '#F59E0B' : '#FDE68A'} _hover={{ bg: selectedSentence && isDifficult(selectedSentence.id) ? '#D97706' : '#FFFBEB' }} onClick={() => toggleDifficult(selectedSentence?.id)} isDisabled={!selectedSentence || isAnalyzing}>Đánh dấu câu khó</Button>
                </HStack>
              </Box>

              <SimpleGrid mt={{ base: '2', md: '4' }} columns={{ base: 1, md: 2 }} gap={{ base: '2', md: '4' }}>
                <Box p={{ base: '3', md: '4' }} borderRadius="2xl" bg="rgba(248,252,255,0.78)" border="1px solid" borderColor="#BAE6FD" scrollMarginBottom="calc(var(--penglish-mobile-safe-bottom) + 112px)">
                  <Text fontWeight="700" color={COLORS.text}>Nghe / lặp</Text>
                  <Text mt="1" fontSize="sm" color={COLORS.muted} fontWeight="700" noOfLines={{ base: 1, md: undefined }}>Chọn tốc độ, nghe câu rồi lặp lại theo transcript.</Text>
                  <HStack mt="2" gap="2" wrap="wrap">
                    {[0.75, 1, 1.25].map((value) => (
                      <Button key={value} size="sm" borderRadius="full" colorScheme={speed === value ? 'blue' : 'gray'} aria-pressed={speed === value} onClick={() => setSpeed(value)} isDisabled={isAnalyzing}>{value}x</Button>
                    ))}
                  </HStack>
                  <HStack mt="2" gap="2" wrap="wrap" align="center">
                    <Button data-testid="shadowing-listen-button" size={{ base: 'sm', md: 'md' }} leftIcon={<Icon as={Headphones} />} borderRadius="full" bg="white" color={COLORS.deepBlue} border="1px solid" borderColor="#BAE6FD" _hover={{ bg: COLORS.softBlue }} onClick={listenSentence} isDisabled={isAnalyzing}>Nghe câu</Button>
                    <Button data-testid="shadowing-repeat-button" size={{ base: 'sm', md: 'md' }} leftIcon={<Icon as={RotateCcw} />} borderRadius="full" bg={COLORS.oceanBlue} color="white" _hover={{ bg: COLORS.deepBlue }} onClick={replaySentence} isDisabled={isAnalyzing}>Lặp câu</Button>
                  </HStack>
                  {mediaMessage ? <Text mt="3" fontSize="sm" color={COLORS.deepBlue} fontWeight="700" role="status" aria-live="polite">{mediaMessage}</Text> : null}
                </Box>

                <Box data-testid="shadowing-recording-card" p={{ base: '3', md: '4' }} borderRadius="2xl" bg="rgba(248,252,255,0.78)" border="1px solid" borderColor="#BAE6FD" scrollMarginBottom="calc(var(--penglish-mobile-safe-bottom) + 112px)">
                  <HStack mb="3" justify="space-between" align="start" gap="3" wrap="wrap">
                    <Box>
                      <Text fontWeight="700" color={COLORS.text}>Ghi âm câu</Text>
                      <Text mt="1" fontSize="sm" color={COLORS.muted} noOfLines={{ base: 2, md: undefined }}>Bấm ghi âm, đọc theo transcript, rồi dừng để nhận góp ý. Nếu API chưa bật, dùng ô so sánh local.</Text>
                    </Box>
                    <Chip tone="amber">Góp ý</Chip>
                  </HStack>
                  <Box position="relative" p={{ base: '3', md: '4' }} borderRadius="2xl" bg={isRecording ? '#FEF2F2' : isAnalyzing ? 'rgba(232,244,255,0.9)' : 'white'} border="1px solid" borderColor={isRecording ? '#FECACA' : '#BAE6FD'} overflow="hidden">
                    <Box ref={recordPulseRef} position="absolute" inset="10px" borderRadius="3xl" bg="rgba(239,68,68,0.18)" pointerEvents="none" />
                    <HStack position="relative" justify="space-between" gap="3" wrap="wrap">
                      <HStack gap="3">
                        <Flex w="44px" h="44px" borderRadius="full" bg={isRecording ? '#EF4444' : COLORS.softAqua} color={isRecording ? 'white' : COLORS.deepBlue} align="center" justify="center">
                          <Icon as={isAnalyzing ? Loader2 : isRecording ? Pause : Mic} className={isAnalyzing ? 'shadowing-spin' : undefined} />
                        </Flex>
                        <Box>
                          <Text fontWeight="700" color={COLORS.text}>{isRecording ? 'Poo đang nghe…' : isAnalyzing ? 'Đang phân tích' : apiFeedback ? 'Đã có góp ý' : 'Sẵn sàng ghi âm'}</Text>
                          <Text fontSize="sm" color={COLORS.muted}>{isRecording ? `Thời gian: ${formatTimer(elapsedSeconds)}` : recordMessage}</Text>
                        </Box>
                      </HStack>
                      {isRecording ? <Text fontSize="xl" fontWeight="700" color="#991B1B">{formatTimer(elapsedSeconds)}</Text> : null}
                    </HStack>
                  </Box>
                  <HStack mt="3" gap="2" wrap="wrap">
                    <Button data-testid="shadowing-record-button" leftIcon={<Icon as={isRecording ? Pause : Mic} />} borderRadius="full" bg={isRecording ? '#EF4444' : COLORS.deepBlue} color="white" _hover={{ bg: isRecording ? '#DC2626' : COLORS.oceanBlue }} aria-label={isRecording ? 'Dừng ghi âm và gửi Poo góp ý' : 'Bắt đầu ghi âm'} aria-pressed={isRecording} onClick={handleRecordAction} isDisabled={isAnalyzing} isLoading={isAnalyzing} loadingText="Poo đang nghe và phân tích">
                      {isRecording ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
                    </Button>
                    <Button leftIcon={<Icon as={SkipForward} />} borderRadius="full" variant="outline" colorScheme="blue" onClick={goToNextSentence} isDisabled={selectedSentenceIndex >= transcriptLength - 1 || isAnalyzing}>Câu tiếp theo</Button>
                  </HStack>
                  <Text mt="3" fontSize="sm" color={COLORS.muted} role="status" aria-live="polite" display={{ base: isAnalyzing ? 'block' : 'none', md: 'block' }}>{isAnalyzing ? 'Poo đang nghe và phân tích giọng nói...' : 'Poo sẽ góp ý phát âm, nhịp, từ thiếu hoặc từ lệch. API thiếu thì dùng fallback local.'}</Text>
                </Box>
              </SimpleGrid>
            </Box>

            {(apiFeedback || apiError || isAnalyzing) ? feedbackPanel : null}

            <SimpleGrid columns={{ base: 1, md: 2 }} gap="3" display={{ base: 'none', md: 'grid' }}>
              <Box className="shadowing-custom-card" p="4" borderRadius="2xl" bg={allSentencesCompleted ? '#F0FDF4' : 'rgba(232,244,255,0.88)'} border="1px solid" borderColor={allSentencesCompleted ? '#BBF7D0' : '#BAE6FD'} role="status" aria-live="polite">
                <HStack><Icon as={allSentencesCompleted ? CheckCircle2 : Sparkles} color={allSentencesCompleted ? COLORS.green : COLORS.oceanBlue} /><Text fontWeight="700" color={COLORS.text}>{allSentencesCompleted ? 'Hoàn thành lượt Shadowing' : 'Tiến độ luyện tập'}</Text></HStack>
                <Text mt="2" color={COLORS.muted} fontSize="sm">Câu {selectedSentenceIndex >= 0 ? selectedSentenceIndex + 1 : 0}/{transcriptLength}. Đã luyện {completedCount}/{transcriptLength}. Câu khó {difficultCount}. Tiến độ được lưu local theo từng bài.</Text>
              </Box>
              <Box className="shadowing-weak-card" p="4" borderRadius="2xl" bg="#FFFBEB" border="1px solid" borderColor="#FDE68A">
                <Text fontWeight="700" color={COLORS.text}>Câu nên luyện tiếp</Text>
                <Text mt="2" color={COLORS.muted} fontSize="sm">{weakSentence?.text ?? 'Chọn một transcript để bắt đầu.'}</Text>
                <Text mt="2" color={COLORS.muted} fontSize="xs" fontWeight="700">Gợi ý: nghe câu, lặp lại, rồi tự đánh dấu đã luyện hoặc câu khó để lần sau quay lại đúng vị trí.</Text>
              </Box>
            </SimpleGrid>
          </VStack>

          <VStack align="stretch" gap={{ base: '3', md: '4' }} minW="0" gridColumn={{ lg: 'span 4' }} pb={{ base: '96px', lg: '0' }}>
            <Box data-testid="shadowing-lesson-picker" as="details" open={typeof window !== 'undefined' ? window.innerWidth >= 1024 : true} className="shadowing-custom-card penglish-glass-card" p="4" borderRadius="3xl" bg="rgba(255,255,255,0.78)" border="1px solid" borderColor="#BAE6FD" boxShadow="0 12px 30px rgba(16, 42, 67, 0.05)" backdropFilter="blur(14px) saturate(1.1)">
              <Box as="summary" cursor="pointer" fontWeight="700" color={COLORS.text}>Chọn bài Shadowing</Box>
              <HStack justify="space-between" mb="3" align="start" gap="3">
                <Box>
                  <Text fontWeight="700" color={COLORS.text}>Chọn bài Shadowing</Text>
                  <Text fontSize="sm" color={COLORS.muted}>Transcript local là nguồn luyện chính; video YouTube chỉ là tham chiếu nếu phát được.</Text>
                </Box>
                <Icon as={Video} color={COLORS.oceanBlue} />
              </HStack>
              <VStack align="stretch" gap="2" maxH={{ base: '220px', lg: '380px' }} overflowY="auto" pr="1" scrollPaddingBottom="calc(var(--penglish-mobile-safe-bottom) + 96px)">
                {videos.map((item) => {
                  const active = item.id === selectedVideo?.id;
                  return (
                    <Box data-testid={`shadowing-video-card-${item.id}`} className="shadowing-video-card" key={item.id} as="button" type="button" textAlign="left" p="3" borderRadius="2xl" bg={active ? COLORS.softBlue : 'rgba(255,255,255,0.78)'} border="1px solid" borderColor={active ? '#7DD3FC' : COLORS.border} boxShadow={active ? '0 10px 24px rgba(31, 111, 214, 0.10)' : 'none'} onClick={() => setSelectedVideoId(item.id)} w="100%" minW="0" willChange="transform, opacity" scrollMarginBottom="calc(var(--penglish-mobile-safe-bottom) + 96px)" aria-pressed={active} aria-label={`Chọn bài Shadowing: ${item.title}`} _focusVisible={{ outline: '3px solid', outlineColor: COLORS.oceanBlue, outlineOffset: '2px' }}>
                      <Text fontWeight="700" color={COLORS.text} noOfLines={1}>{item.title}</Text>
                      <Text fontSize="sm" color={COLORS.muted} noOfLines={2}>{item.description}</Text>
                      {item.referenceVideoTitle ? <Text mt="1" fontSize="xs" color={COLORS.deepBlue} fontWeight="700" noOfLines={1}>{item.referenceVideoTitle}</Text> : null}
                      <HStack mt="2" gap="2" wrap="wrap"><Tag size="sm"><TagLabel>{item.level}</TagLabel></Tag><Tag size="sm"><TagLabel>{item.duration}</TagLabel></Tag><Tag size="sm"><TagLabel>{item.embedAllowed ? 'Video tham khảo' : item.videoUrl?.trim() || item.youtubeId ? 'Có link tham chiếu' : 'Luyện bằng transcript'}</TagLabel></Tag></HStack>
                    </Box>
                  );
                })}
              </VStack>
            </Box>

            <Box data-testid="shadowing-transcript-panel" as="details" open={typeof window !== 'undefined' ? window.innerWidth >= 1024 : true} className="shadowing-transcript-panel penglish-glass-card" p="4" borderRadius="3xl" bg="rgba(255,255,255,0.78)" border="1px solid" borderColor="#BAE6FD" minW="0" willChange="transform, opacity" boxShadow="0 14px 34px rgba(31, 111, 214, 0.06)" backdropFilter="blur(14px) saturate(1.1)">
              <Box as="summary" cursor="pointer" fontWeight="700" color={COLORS.text}>Transcript</Box>
              <HStack mb="3" justify="space-between" align="start" gap="3">
                <HStack><Icon as={Volume2} color={COLORS.oceanBlue} /><Text as="h2" fontWeight="700" color={COLORS.text}>Transcript</Text></HStack>
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
                            {done ? <Chip tone="green">Đã luyện</Chip> : null}
                            {difficult ? <Chip tone="amber">Câu khó</Chip> : null}
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
              <Box as="summary" cursor="pointer" fontWeight="700" color={COLORS.text}>Nâng cao: tự tạo transcript</Box>
              <HStack mb="3" align="start">
                <Icon as={Upload} color={COLORS.deepBlue} />
                <Box>
                  <Text fontWeight="700" color={COLORS.text}>Nâng cao: tự tạo transcript</Text>
                  <Text fontSize="sm" color={COLORS.muted}>Dán từng câu trên một dòng. Video URL chỉ là liên kết tham chiếu tuỳ chọn, không phải upload.</Text>
                </Box>
              </HStack>
              <VStack align="stretch" gap="3">
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="700" color={COLORS.text}>Tiêu đề bài luyện</FormLabel>
                  <Input data-testid="shadowing-custom-title-input" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="Ví dụ: My daily English practice" bg="white" borderRadius="xl" />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="700" color={COLORS.text}>Video URL tham chiếu (không bắt buộc)</FormLabel>
                  <Input data-testid="shadowing-custom-url-input" value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} placeholder="Dán URL video nếu bạn có" bg="white" borderRadius="xl" scrollMarginBottom="calc(var(--penglish-mobile-safe-bottom) + 96px)" />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="700" color={COLORS.text}>Transcript - mỗi dòng là một câu</FormLabel>
                  <Textarea data-testid="shadowing-custom-transcript-textarea" value={customTranscript} onChange={(e) => setCustomTranscript(e.target.value)} placeholder={'Hello, my name is Anna.\nI am learning English every day.'} bg="white" borderRadius="xl" minH="130px" />
                </FormControl>
                <Flex gap="2" wrap="wrap">
                  <Button data-testid="shadowing-create-custom-button" leftIcon={<Icon as={PlusCircle} />} borderRadius="full" bg={COLORS.oceanBlue} color="white" _hover={{ bg: COLORS.deepBlue }} onClick={createCustomPractice}>Tạo bài luyện</Button>
                  {customVideo ? <Button data-testid="shadowing-remove-custom-button" leftIcon={<Icon as={Trash2} />} borderRadius="full" variant="outline" colorScheme="red" onClick={removeCustomPractice}>Xóa bài tự tạo</Button> : null}
                </Flex>
                <Text fontSize="sm" color={COLORS.muted} role="status" aria-live="polite">{customMessage}</Text>
                <Text fontSize="xs" color={COLORS.muted}>Tab để đi qua transcript; Enter hoặc Space để chọn câu. Không có phím tắt global riêng trong phase này.</Text>
              </VStack>
            </Box>
          </VStack>
        </SimpleGrid>
      </Box>
    </OceanPageShell>
  );
}

