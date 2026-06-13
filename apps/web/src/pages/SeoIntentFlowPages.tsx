import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Box, Button, Flex, HStack, Icon, SimpleGrid, Tab, TabList, TabPanel, TabPanels, Tabs, Text, VStack } from '@chakra-ui/react';
import { ArrowRight, BookOpen, CheckCircle2, Headphones, Mic, Play, Volume2 } from 'lucide-react';
import { OceanMascot } from '../components/p-english/OceanMascot';
import { OceanPageShell } from '../components/p-english/OceanPageShell';

const COLORS = {
  text: '#102A43',
  muted: '#52667A',
  border: '#BAE6FD',
  blue: '#1F6FD6',
  blue2: '#2F9EEB',
  aqua: '#DDF5FF',
  green: '#16A34A',
  amber: '#B7791F',
};

const cardStyle = {
  bg: 'rgba(255,255,255,0.82)',
  border: '1px solid',
  borderColor: COLORS.border,
  borderRadius: '3xl',
  boxShadow: '0 18px 44px rgba(31,111,214,0.08)',
};

function speak(text: string, rate = 0.86) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
}

function IntentShell({ children, testId }: { children: ReactNode; testId: string }) {
  return (
    <OceanPageShell data-testid={testId} variant="vocab" overlayStrength="medium" minH="calc(100vh - 68px)" px={{ base: '3', md: '6' }} py={{ base: '3', md: '6' }} pb={{ base: 'calc(var(--penglish-mobile-safe-bottom) + 96px)', lg: '12' }} overflowX="hidden">
      <Box maxW="1180px" mx="auto" minW="0">
        {children}
      </Box>
    </OceanPageShell>
  );
}

function FlowHero({ eyebrow, title, description, cta, ctaTo, mascot = true }: { eyebrow: string; title: string; description: string; cta: string; ctaTo: string; mascot?: boolean }) {
  return (
    <Flex {...cardStyle} p={{ base: '4', md: '7' }} mb="4" gap="5" align={{ base: 'stretch', md: 'center' }} justify="space-between" direction={{ base: 'column', md: 'row' }} position="relative" overflow="hidden">
      <Box position="absolute" inset="0" bg="radial-gradient(circle at 88% 12%, rgba(91,188,235,0.22), transparent 30%), radial-gradient(circle at 8% 95%, rgba(255,243,196,0.42), transparent 28%)" pointerEvents="none" />
      <Box position="relative" minW="0" flex="1">
        <Badge borderRadius="full" bg="#E0F2FE" color={COLORS.blue} textTransform="none" mb="3">{eyebrow}</Badge>
        <Text as="h1" color={COLORS.text} fontSize={{ base: '3xl', md: '5xl' }} fontWeight="950" lineHeight="1.04">{title}</Text>
        <Text mt="3" color={COLORS.muted} fontWeight="800" lineHeight="1.75" maxW="720px">{description}</Text>
        <Button as={Link} to={ctaTo} mt="5" borderRadius="full" bg={COLORS.blue} color="white" rightIcon={<Icon as={ArrowRight} />} _hover={{ bg: '#185BB2' }}>{cta}</Button>
      </Box>
      {mascot ? <Box position="relative" alignSelf="center" pointerEvents="none"><OceanMascot mascot="poo" pose="coach" size="hero" decorative motion="float" /></Box> : null}
    </Flex>
  );
}

function MiniTest() {
  const questions = [
    { q: 'Bạn hiểu câu “I am a student” chưa?', a: 'Có, đây là câu giới thiệu cơ bản.' },
    { q: 'Bạn nghe được câu ngắn khi đọc chậm không?', a: 'Nghe được vài từ chính.' },
    { q: 'Bạn dám nói thử 1 câu 5 giây không?', a: 'Dám, nhưng cần Poo gợi ý.' },
  ];
  const [picked, setPicked] = useState<number[]>([]);
  const level = picked.length <= 1 ? 'A0 — bắt đầu từ câu cực ngắn' : picked.length === 2 ? 'A1 — nên học theo checklist 7 ngày' : 'A1+ — vào 48 ngày lấy gốc và tăng tốc';
  return (
    <Box {...cardStyle} p="5" data-testid="learning-path-mini-test">
      <Text fontWeight="950" color={COLORS.text} fontSize="xl">Test đầu vào mini</Text>
      <Text mt="1" color={COLORS.muted} fontWeight="800">Chọn câu đúng với bạn để Poo gợi ý điểm bắt đầu.</Text>
      <VStack align="stretch" mt="4" gap="3">
        {questions.map((item, index) => (
          <Button key={item.q} justifyContent="flex-start" h="auto" whiteSpace="normal" borderRadius="2xl" variant={picked.includes(index) ? 'solid' : 'outline'} colorScheme={picked.includes(index) ? 'blue' : 'gray'} onClick={() => setPicked((current) => current.includes(index) ? current.filter((value) => value !== index) : [...current, index])}>
            {item.q} — {item.a}
          </Button>
        ))}
      </VStack>
      <Box mt="4" bg="#EFF6FF" border="1px solid #BAE6FD" borderRadius="2xl" p="4">
        <Text color={COLORS.blue} fontWeight="950">Kết quả tạm: {level}</Text>
      </Box>
    </Box>
  );
}

export function LearningPathIntentPage() {
  const week = ['Ngày 1: chào hỏi + I am…', 'Ngày 2: to be + nghề nghiệp', 'Ngày 3: câu phủ định ngắn', 'Ngày 4: câu hỏi Yes/No', 'Ngày 5: 20 từ A1 đầu tiên', 'Ngày 6: nghe câu chậm', 'Ngày 7: nói lại 5 câu thật dùng được'];
  return (
    <IntentShell testId="seo-intent-learning-path">
      <FlowHero eyebrow="Public learning path" title="Học tiếng Anh từ đầu cùng Poo" description="Lộ trình miễn phí cho người mất gốc: test nhanh, checklist 7 ngày đầu, rồi đi tiếp vào 48 ngày lấy gốc khi bạn sẵn sàng." cta="Vào 48 ngày lấy gốc" ctaTo="/luyen-tieng-anh/48-ngay-lay-goc" />
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="4">
        <MiniTest />
        <Box {...cardStyle} p="5" data-testid="learning-path-7-day-checklist">
          <Text fontWeight="950" color={COLORS.text} fontSize="xl">Checklist 7 ngày đầu</Text>
          <VStack align="stretch" mt="4" gap="2.5">
            {week.map((item, index) => <HStack key={item} bg="rgba(248,252,255,0.82)" border="1px solid #D7E8F5" borderRadius="2xl" p="3"><Icon as={CheckCircle2} color={index < 2 ? COLORS.green : COLORS.blue2} /><Text fontWeight="850" color={COLORS.text}>{item}</Text></HStack>)}
          </VStack>
        </Box>
      </SimpleGrid>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap="3" mt="4">
        {[{ to: '/words', label: 'Học từ vựng A1/A2/B1', icon: BookOpen }, { to: '/shadowing', label: 'Luyện shadowing cho người mới', icon: Headphones }, { to: '/speaking-coach', label: 'Luyện nói với AI coach', icon: Mic }].map((item) => <Button key={item.to} as={Link} to={item.to} h="64px" borderRadius="2xl" variant="outline" bg="whiteAlpha.800" leftIcon={<Icon as={item.icon} />}>{item.label}</Button>)}
      </SimpleGrid>
    </IntentShell>
  );
}

export function SpeakingCoachIntentPage() {
  const [recording, setRecording] = useState(false);
  const sample = 'Hi Poo, I want to practice English every day.';
  return (
    <IntentShell testId="seo-intent-speaking-coach">
      <FlowHero eyebrow="AI speaking preview" title="Luyện nói tiếng Anh cùng Poo" description="Chọn câu giao tiếp, nói thử, rồi nhận góp ý phát âm nhẹ nhàng. Bạn được thấy luồng học thử trước khi cần đăng nhập." cta="Nghe câu mẫu" ctaTo="/speaking-coach" mascot={false} />
      <SimpleGrid columns={{ base: 1, lg: 3 }} gap="4">
        <Box {...cardStyle} p="5" gridColumn={{ base: 'auto', lg: 'span 2' }}>
          <HStack gap="3" wrap="wrap" mb="4">{['1. Chọn câu', '2. Nói thử', '3. Nhận góp ý'].map((step) => <Badge key={step} borderRadius="full" bg="#E0F2FE" color={COLORS.blue} px="3" py="1.5" textTransform="none">{step}</Badge>)}</HStack>
          <Box bg="#F8FCFF" border="1px solid #D7E8F5" borderRadius="3xl" p="5">
            <Text color={COLORS.muted} fontWeight="900" textTransform="uppercase" fontSize="xs">Câu mẫu giao tiếp</Text>
            <Text mt="2" color={COLORS.text} fontWeight="950" fontSize={{ base: 'xl', md: '2xl' }}>{sample}</Text>
            <Text mt="1" color={COLORS.muted} fontWeight="800">Xin chào Poo, mình muốn luyện tiếng Anh mỗi ngày.</Text>
            <HStack mt="4" gap="2" wrap="wrap">
              <Button borderRadius="full" leftIcon={<Icon as={Volume2} />} onClick={() => speak(sample)}>Nghe mẫu</Button>
              <Button data-testid="speaking-coach-record-button" borderRadius="full" bg={recording ? '#DC2626' : COLORS.blue} color="white" leftIcon={<Icon as={Mic} />} onClick={() => setRecording((value) => !value)}>{recording ? 'Đang ghi âm thử…' : 'Ghi âm thử'}</Button>
            </HStack>
          </Box>
          <Box mt="4" bg="#ECFDF5" border="1px solid #BBF7D0" borderRadius="3xl" p="5" data-testid="speaking-coach-mock-feedback">
            <Text fontWeight="950" color={COLORS.text}>Mock AI feedback từ Poo</Text>
            <Text mt="2" color={COLORS.muted} fontWeight="800">Điểm tạm: 82/100. Nhịp nói rõ, âm cuối trong “want” cần bật nhẹ hơn. Thử nói chậm: “I want to practice…”</Text>
          </Box>
        </Box>
        <Box {...cardStyle} p="5" textAlign="center">
          <Box as="img" src="/assets/poo-speaking/sheets/poo-speaking-headset-3x3.png" alt="Poo Speaking coach" mx="auto" w="180px" style={{ imageRendering: 'pixelated' }} />
          <Text mt="3" color={COLORS.text} fontWeight="950">Poo Speaking</Text>
          <Text mt="1" color={COLORS.muted} fontWeight="800">Phù hợp luyện phát âm, giao tiếp cơ bản và chấm điểm phát âm online.</Text>
        </Box>
      </SimpleGrid>
    </IntentShell>
  );
}

export function WordsIntentPage() {
  const [level, setLevel] = useState('A1');
  const [topic, setTopic] = useState('Chào hỏi');
  const words = useMemo(() => [
    { term: 'hello', vi: 'xin chào', level: 'A1', topic: 'Chào hỏi' },
    { term: 'student', vi: 'học sinh', level: 'A1', topic: 'Trường học' },
    { term: 'usually', vi: 'thường xuyên', level: 'A2', topic: 'Thói quen' },
    { term: 'improve', vi: 'cải thiện', level: 'B1', topic: 'Học tập' },
  ].filter((word) => word.level === level || word.topic === topic), [level, topic]);
  const active = words[0] ?? { term: 'hello', vi: 'xin chào', level: 'A1', topic: 'Chào hỏi' };
  return (
    <IntentShell testId="seo-intent-words">
      <FlowHero eyebrow="Vocabulary flow" title="Từ vựng tiếng Anh cơ bản theo trình độ" description="Lọc A1/A2/B1 hoặc theo chủ đề, học bằng flashcard, quiz nhanh và ôn lại từ cần nhớ hôm nay." cta="Đi theo lộ trình" ctaTo="/learning-path" />
      <HStack gap="2" wrap="wrap" mb="4">{['A1', 'A2', 'B1'].map((item) => <Button key={item} borderRadius="full" colorScheme={level === item ? 'blue' : 'gray'} onClick={() => setLevel(item)}>{item}</Button>)}{['Chào hỏi', 'Trường học', 'Thói quen', 'Học tập'].map((item) => <Button key={item} borderRadius="full" variant={topic === item ? 'solid' : 'outline'} onClick={() => setTopic(item)}>{item}</Button>)}</HStack>
      <SimpleGrid columns={{ base: 1, lg: 3 }} gap="4">
        <Box {...cardStyle} p="6" textAlign="center" data-testid="words-flashcard"><Badge borderRadius="full" colorScheme="blue">Flashcard {active.level}</Badge><Text mt="4" fontSize="4xl" fontWeight="950" color={COLORS.text}>{active.term}</Text><Text mt="2" color={COLORS.blue} fontWeight="950" fontSize="xl">{active.vi}</Text><Text mt="2" color={COLORS.muted} fontWeight="800">Chủ đề: {active.topic}</Text><Button mt="4" borderRadius="full" leftIcon={<Icon as={Volume2} />} onClick={() => speak(active.term)}>Nghe từ</Button></Box>
        <Box {...cardStyle} p="6" data-testid="words-quick-quiz"><Text fontWeight="950" color={COLORS.text} fontSize="xl">Quiz nhanh</Text><Text mt="3" color={COLORS.muted} fontWeight="850">“student” nghĩa là gì?</Text><SimpleGrid mt="4" columns={1} gap="2"><Button borderRadius="2xl">học sinh</Button><Button borderRadius="2xl" variant="outline">bữa sáng</Button><Button borderRadius="2xl" variant="outline">cải thiện</Button></SimpleGrid></Box>
        <Box {...cardStyle} p="6" data-testid="words-review-today"><Text fontWeight="950" color={COLORS.text} fontSize="xl">Từ cần ôn hôm nay</Text><VStack align="stretch" mt="4" gap="2">{words.slice(0, 3).map((word) => <HStack key={word.term} justify="space-between" bg="#F8FCFF" border="1px solid #D7E8F5" borderRadius="2xl" p="3"><Text fontWeight="900">{word.term}</Text><Badge>{word.level}</Badge></HStack>)}</VStack></Box>
      </SimpleGrid>
    </IntentShell>
  );
}

export function ShadowingIntentPage() {
  const sample = 'I practice English a little every day.';
  return (
    <IntentShell testId="seo-intent-shadowing">
      <FlowHero eyebrow="Shadowing starter" title="Shadowing tiếng Anh cho người mới bắt đầu" description="Shadowing là nghe câu mẫu, nhại lại theo nhịp, lặp vài lần rồi tự nói. Poo cho bạn chọn bài và nghe mẫu ngay." cta="Sang Speaking Coach" ctaTo="/speaking-coach" />
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="4">
        <Box {...cardStyle} p="5"><Text fontWeight="950" color={COLORS.text} fontSize="xl">Chọn bài shadowing</Text>{['A1 · Chào hỏi chậm', 'A1 · Giới thiệu bản thân', 'A2 · Nói về thói quen'].map((lesson) => <HStack key={lesson} mt="3" justify="space-between" bg="#F8FCFF" border="1px solid #D7E8F5" borderRadius="2xl" p="3"><Text fontWeight="900" color={COLORS.text}>{lesson}</Text><Button size="sm" borderRadius="full" leftIcon={<Icon as={Play} />}>Chọn</Button></HStack>)}</Box>
        <Box {...cardStyle} p="5"><Text fontWeight="950" color={COLORS.text} fontSize="xl">Nghe câu mẫu</Text><Text mt="3" color={COLORS.blue} fontWeight="950" fontSize="2xl">{sample}</Text><Button mt="4" borderRadius="full" leftIcon={<Icon as={Volume2} />} onClick={() => speak(sample, 0.72)}>Nghe chậm</Button><SimpleGrid mt="5" columns={{ base: 1, md: 4 }} gap="2">{['Nghe', 'Nhại', 'Lặp', 'Tự nói'].map((step) => <Box key={step} bg="#EFF6FF" border="1px solid #BAE6FD" borderRadius="2xl" p="3" textAlign="center"><Text fontWeight="950" color={COLORS.blue}>{step}</Text></Box>)}</SimpleGrid></Box>
      </SimpleGrid>
    </IntentShell>
  );
}

export function PracticeIntentPage() {
  const [answer, setAnswer] = useState('');
  return (
    <IntentShell testId="seo-intent-practice">
      <FlowHero eyebrow="Listening + grammar" title="Luyện nghe và ngữ pháp tiếng Anh cơ bản" description="Một flow học thử có nghe chậm, nghe chép chính tả, micro lesson, sentence builder và bài tập 5 câu có đáp án." cta="Đi theo lộ trình" ctaTo="/learning-path" />
      <Tabs variant="soft-rounded" colorScheme="blue" bg="rgba(255,255,255,0.58)" borderRadius="3xl" p="3">
        <TabList gap="2" flexWrap="wrap"><Tab>Nghe</Tab><Tab>Ngữ pháp</Tab></TabList>
        <TabPanels>
          <TabPanel px="0"><SimpleGrid columns={{ base: 1, lg: 3 }} gap="4"><Box {...cardStyle} p="5"><Text fontWeight="950">Nghe chậm</Text><Text mt="3" color={COLORS.blue} fontWeight="950">She is my teacher.</Text><Button mt="4" borderRadius="full" leftIcon={<Icon as={Volume2} />} onClick={() => speak('She is my teacher.', 0.68)}>Nghe chậm</Button></Box><Box {...cardStyle} p="5"><Text fontWeight="950">Nghe chép chính tả</Text><Text mt="2" color={COLORS.muted} fontWeight="800">Nghe rồi gõ lại câu ngắn.</Text><Box as="input" value={answer} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setAnswer(event.target.value)} placeholder="Gõ câu bạn nghe..." style={{ marginTop: 14, width: '100%', border: '1px solid #BAE6FD', borderRadius: 16, padding: 12 }} /></Box><Box {...cardStyle} p="5"><Text fontWeight="950">Câu ngắn</Text>{['I am ready.', 'This is a book.', 'We learn English.'].map((line) => <Button key={line} mt="2" w="100%" borderRadius="2xl" variant="outline" onClick={() => speak(line, 0.78)}>{line}</Button>)}</Box></SimpleGrid></TabPanel>
          <TabPanel px="0"><SimpleGrid columns={{ base: 1, lg: 3 }} gap="4"><Box {...cardStyle} p="5"><Text fontWeight="950">Micro lesson</Text><Text mt="2" color={COLORS.muted} fontWeight="800">Động từ to be: I am, You are, She/He is. Hiện tại đơn dùng để nói thói quen hoặc sự thật đơn giản.</Text></Box><Box {...cardStyle} p="5"><Text fontWeight="950">Sentence builder</Text><HStack mt="3" wrap="wrap">{['I', 'am', 'a student'].map((part) => <Badge key={part} borderRadius="full" px="3" py="2" colorScheme="blue">{part}</Badge>)}</HStack><Text mt="3" fontWeight="950" color={COLORS.blue}>I am a student.</Text></Box><Box {...cardStyle} p="5"><Text fontWeight="950">Bài tập 5 câu có đáp án</Text>{['I ___ happy. → am', 'She ___ my friend. → is', 'They ___ students. → are', 'He ___ English. → likes', 'Do you ___ coffee? → like'].map((item) => <Text key={item} mt="2" color={COLORS.muted} fontWeight="850">{item}</Text>)}</Box></SimpleGrid></TabPanel>
        </TabPanels>
      </Tabs>
    </IntentShell>
  );
}
