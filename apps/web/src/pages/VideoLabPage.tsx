import { useEffect, useMemo, useRef, useState, type ChangeEvent, type SyntheticEvent } from 'react';
import { Box, Button, Flex, FormControl, FormLabel, HStack, Icon, Input, SimpleGrid, Tag, TagLabel, Text, Textarea, VStack } from '@chakra-ui/react';
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

const SAMPLE_TRANSCRIPT = `00:00:01.000 --> 00:00:04.000
Welcome to my morning routine.

00:00:04.500 --> 00:00:08.000
I usually drink a glass of water first.

00:00:08.500 --> 00:00:12.000
Then I write down three small goals for the day.`;

const LinkedGlassPanel = GlassPanel as any;

type SourceType = 'youtube' | 'upload' | 'manual';
type LabMode = 'speak' | 'type';

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

export function VideoLabPage() {
  const [sourceType, setSourceType] = useState<SourceType>('youtube');
  const [title, setTitle] = useState('Video Lab cùng Poo');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState('');
  const [uploadedVideoName, setUploadedVideoName] = useState('');
  const [transcript, setTranscript] = useState(SAMPLE_TRANSCRIPT);
  const [lesson, setLesson] = useState<VideoLesson | null>(null);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [mode, setMode] = useState<LabMode>('speak');
  const [typedAnswer, setTypedAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [speakMessage, setSpeakMessage] = useState('Chọn một câu, nghe đoạn mẫu nếu có thời gian, rồi Poo sẽ bật nút ghi âm.');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const uploadedVideoUrlRef = useRef('');
  const recordButtonGuardRef = useRef(0);
  const recorder = useAudioRecorder();

  const youtubeVideoId = useMemo(() => getYouTubeVideoIdFromUrl(youtubeUrl), [youtubeUrl]);
  const youtubeEmbedUrl = youtubeVideoId ? `https://www.youtube.com/embed/${youtubeVideoId}` : '';
  const activeSegment = lesson?.segments[activeSegmentIndex] ?? null;
  const typedComparison = useMemo(() => activeSegment ? compareTypedAnswer(activeSegment.text, typedAnswer) : [], [activeSegment, typedAnswer]);
  const hintedText = useMemo(() => activeSegment?.text.split(/\s+/).slice(0, hintCount).join(' ') ?? '', [activeSegment?.text, hintCount]);
  const canCreateLesson = transcript.trim().length > 0 && (sourceType !== 'youtube' || youtubeVideoId || youtubeUrl.trim().length === 0);

  useEffect(() => {
    uploadedVideoUrlRef.current = uploadedVideoUrl;
  }, [uploadedVideoUrl]);

  useEffect(() => {
    return () => {
      if (uploadedVideoUrlRef.current) URL.revokeObjectURL(uploadedVideoUrlRef.current);
    };
  }, []);

  const createLesson = () => {
    const nextLesson = buildLesson(sourceType, title, youtubeUrl, uploadedVideoUrl, transcript);
    if (!nextLesson.segments.length) return;
    setLesson(nextLesson);
    setActiveSegmentIndex(0);
    setTypedAnswer('');
    setShowAnswer(false);
    setHintCount(0);
    setSpeakMessage(sourceType === 'upload' ? 'Clip đã sẵn sàng ở bản mock. Full auto transcription sẽ bật ở bước sau.' : 'Poo đã tách câu luyện. YouTube chỉ được embed, transcript do bạn cung cấp.');
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
    void file.text().then((content) => setTranscript(content));
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
    setActiveSegmentIndex(index);
    setTypedAnswer('');
    setShowAnswer(false);
    setHintCount(0);
    recorder.resetRecording();
    setSpeakMessage('Poo đã chọn câu mới. Nghe lại rồi luyện nói hoặc gõ theo câu.');
  };

  const nextSegment = () => {
    if (!lesson?.segments.length) return;
    selectSegment(Math.min(activeSegmentIndex + 1, lesson.segments.length - 1));
  };

  const revealHint = () => {
    if (!activeSegment) return;
    setHintCount((value) => Math.min(value + 1, activeSegment.text.split(/\s+/).length));
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
            <Text mt="2" color={COLORS.muted} maxW="760px" fontSize={{ base: 'sm', md: 'md' }} fontWeight="750" lineHeight="1.7">Biến video tiếng Anh thành bài luyện nghe, nói và gõ theo từng câu. YouTube chỉ embed iframe; transcript hoặc phụ đề do bạn cung cấp.</Text>
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
                  <Text fontWeight="950" color={COLORS.text} fontSize={{ base: 'lg', md: '2xl' }}>Tạo bài từ video</Text>
                  <Text mt="1" color={COLORS.muted} fontSize="sm" fontWeight="750">Chọn nguồn, dán transcript hoặc upload phụ đề, rồi để Poo tách câu luyện.</Text>
                </Box>
                <Button as={Link} to="/shadowing" size="sm" borderRadius="full" bg="white" color={COLORS.deepBlue} border="1px solid" borderColor={COLORS.border} _hover={{ bg: COLORS.softBlue }}>Về Shadowing</Button>
              </HStack>

              <SimpleGrid columns={{ base: 1, md: 3 }} gap="3" mb="4">
                <SourceCard active={sourceType === 'youtube'} label="YouTube link" icon={Video} description="Embed iframe, không tải video/audio về server." onClick={() => setSourceType('youtube')} />
                <SourceCard active={sourceType === 'upload'} label="Upload clip" icon={FileVideo} description="Tải clip cục bộ để mock bài luyện, transcript dán riêng." onClick={() => setSourceType('upload')} />
                <SourceCard active={sourceType === 'manual'} label="Transcript" icon={Keyboard} description="Dán nội dung hoặc phụ đề để luyện từng câu." onClick={() => setSourceType('manual')} />
              </SimpleGrid>

              <VStack align="stretch" gap="3">
                <FormControl>
                  <FormLabel fontWeight="900" color={COLORS.text}>Tên bài</FormLabel>
                  <Input value={title} onChange={(event) => setTitle(event.target.value)} bg="white" borderColor={COLORS.border} borderRadius="2xl" />
                </FormControl>

                {sourceType === 'youtube' ? (
                  <FormControl>
                    <FormLabel fontWeight="900" color={COLORS.text}>YouTube link</FormLabel>
                    <Input value={youtubeUrl} onChange={(event) => setYoutubeUrl(event.target.value)} placeholder="https://www.youtube.com/watch?v=..." bg="white" borderColor={COLORS.border} borderRadius="2xl" />
                    <Text mt="1" color={youtubeUrl && !youtubeVideoId ? '#B45309' : COLORS.muted} fontSize="xs" fontWeight="800">Poo chỉ embed video bằng iframe. Không tải video/audio YouTube.</Text>
                  </FormControl>
                ) : null}

                {sourceType === 'upload' ? (
                  <FormControl>
                    <FormLabel fontWeight="900" color={COLORS.text}>Upload clip .mp4/.mov/.webm</FormLabel>
                    <Input type="file" accept="video/mp4,video/quicktime,video/webm" onChange={handleVideoUpload} bg="white" borderColor={COLORS.border} borderRadius="2xl" p="2" />
                    <Text mt="1" color={COLORS.muted} fontSize="xs" fontWeight="800">{uploadedVideoName ? `Đã chọn: ${uploadedVideoName}` : 'Giai đoạn này xử lý tự động đang mock. Hãy dán transcript hoặc upload phụ đề.'}</Text>
                  </FormControl>
                ) : null}

                <FormControl>
                  <FormLabel fontWeight="900" color={COLORS.text}>Transcript hoặc phụ đề .srt/.vtt</FormLabel>
                  <Input type="file" accept=".srt,.vtt,text/vtt" onChange={handleSubtitleUpload} bg="white" borderColor={COLORS.border} borderRadius="2xl" p="2" mb="2" />
                  <Textarea value={transcript} onChange={(event) => setTranscript(event.target.value)} minH="180px" bg="white" borderColor={COLORS.border} borderRadius="2xl" fontWeight="700" placeholder="Dán transcript hoặc nội dung SRT/VTT ở đây..." />
                </FormControl>

                <Button onClick={createLesson} isDisabled={!canCreateLesson} borderRadius="full" bg={COLORS.deepBlue} color="white" leftIcon={<Icon as={Sparkles} />} _hover={{ bg: COLORS.oceanBlue }} data-testid="video-lab-create-lesson">
                  Tạo bài luyện từ video
                </Button>
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
                        <Button alignSelf="start" borderRadius="full" bg="white" color={COLORS.deepBlue} border="1px solid" borderColor={COLORS.border} leftIcon={<Icon as={Headphones} />} onClick={() => void playActiveSegment()}>Nghe lại</Button>
                        {hintedText ? <Text color={COLORS.deepBlue} fontWeight="900" fontSize="sm">Gợi ý: {hintedText}</Text> : null}
                        <Textarea value={typedAnswer} onChange={(event) => setTypedAnswer(event.target.value)} placeholder="Gõ câu bạn vừa nghe..." bg="white" borderColor={COLORS.border} borderRadius="2xl" minH="100px" fontWeight="800" />
                        <Box p="3" borderRadius="2xl" bg="rgba(248,252,255,0.9)" border="1px solid" borderColor={COLORS.border}>
                          <Text mb="2" color={COLORS.text} fontWeight="950">So sánh từng chữ</Text>
                          {typedAnswer.trim() ? typedComparison.map((word) => <WordChip key={word.id} word={word} />) : <Text color={COLORS.muted} fontSize="sm" fontWeight="750">Poo sẽ tô xanh chữ đúng, coral chữ sai, vàng chữ thiếu.</Text>}
                        </Box>
                        <HStack gap="2" wrap="wrap">
                          <Button borderRadius="full" bg="white" color={COLORS.deepBlue} border="1px solid" borderColor={COLORS.border} onClick={revealHint}>Gợi ý 1 chữ</Button>
                          <Button borderRadius="full" bg="white" color={COLORS.deepBlue} border="1px solid" borderColor={COLORS.border} onClick={() => setShowAnswer(true)}>Hiện đáp án</Button>
                          <Button borderRadius="full" bg={COLORS.deepBlue} color="white" rightIcon={<Icon as={CheckCircle2} />} onClick={nextSegment} isDisabled={activeSegmentIndex >= lesson.segments.length - 1}>Câu tiếp theo</Button>
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
