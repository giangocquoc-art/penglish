import { Box, Flex, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { OceanMascot } from '../../components/p-english/OceanMascot';
import type { Foundation48Day } from './foundation48Types';

const COLORS = {
  text: '#102A43',
  muted: '#52667A',
  border: '#BAE6FD',
  blue: '#1F6FD6',
};

function cleanLessonLines(markdown: string) {
  return markdown
    .replace(/\*\*/g, '')
    .replace(/#{1,6}\s*/g, '')
    .replace(/\|---\|[^\n]*\n/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.toLowerCase().includes('picture'))
    .filter((line) => !line.toLowerCase().includes('tuyệt đối không chia sẻ'))
    .slice(0, 18);
}

export function Foundation48LessonRenderer({ day }: { day: Foundation48Day }) {
  if (day.polished) {
    const lesson = day.polished;
    return (
      <VStack align="stretch" gap="3" data-testid="foundation48-polished-lesson">
        <HeroLessonCard day={day} />
        <Section title="Mục tiêu hôm nay" body={lesson.goal} mascot="poo" pose="coach" />
        <Section title="Poo giải thích nhanh" body={lesson.explanation} mascot="mucMo" pose="teacher" />
        <ListSection title="Công thức / mẫu câu" items={lesson.formulas} mascot="mucMo" />
        <ListSection title="Ví dụ dễ nhớ" items={lesson.examples} mascot="poo" />
        <ListSection title="Luyện tập" items={lesson.practiceQuestions} mascot="cuaQuiz" />
        <ListSection title="Mini test" items={lesson.dailyTest} mascot="cuaQuiz" />
        <Section title="Nhiệm vụ cuối ngày" body={lesson.finalTask} mascot="saoNhi" pose="sparkle" />
      </VStack>
    );
  }

  const lines = cleanLessonLines(day.lessonMarkdown || day.testMarkdown || '');
  const lessonPreview = lines.slice(0, 10);
  const practicePreview = lines.slice(10, 18);

  return (
    <VStack align="stretch" gap="3" data-testid="foundation48-guided-lesson">
      <HeroLessonCard day={day} />
      <Section
        title="Mục tiêu hôm nay"
        body={`Nắm ý chính của ngày ${day.dayNumber}: ${day.title}. Poo sẽ chia bài thành phần đọc ngắn, ví dụ và luyện nói để bạn học dễ hơn.`}
        mascot={day.audio.length > 0 ? 'suaNghe' : 'poo'}
        pose={day.audio.length > 0 ? 'listen' : 'coach'}
      />
      <Box className="penglish-glass-card" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '3', md: '5' }} bg="rgba(255,255,255,0.78)">
        <HStack justify="space-between" align="start" gap="3" wrap="wrap" mb="3">
          <Box>
            <Text as="h2" fontSize={{ base: 'lg', md: '2xl' }} fontWeight="950" color={COLORS.text}>Bài đọc rút gọn</Text>
            <Text mt="1" color={COLORS.muted} fontSize="sm" fontWeight="700" lineHeight="1.6">Đọc từng dòng, sau đó chuyển sang bài tập tương tác để kiểm tra.</Text>
          </Box>
        </HStack>
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap="2.5">
          {lessonPreview.length > 0 ? lessonPreview.map((line, index) => (
            <SourceLine key={`${day.dayNumber}-line-${index}`} line={line} important={line.length < 90} />
          )) : (
            <Text color={COLORS.muted} fontWeight="800">Poo sẽ dùng phần tóm tắt của ngày học để dẫn bạn luyện tập.</Text>
          )}
        </SimpleGrid>
      </Box>
      <ListSection
        title="Luyện tập"
        items={practicePreview.length > 0 ? practicePreview : ['Đọc ý chính, nói lại 2 câu mẫu, sau đó tự tạo 3 câu mới theo chủ đề ngày học.']}
        mascot={day.audio.length > 0 ? 'suaNghe' : 'cuaQuiz'}
      />
      <Section
        title="Nhiệm vụ cuối ngày"
        body={day.dayNumber === 48 ? 'Chuẩn bị một đoạn tự giới thiệu ngắn và nói thành tiếng như đang đứng trước lớp.' : 'Hoàn thành lesson flow, ghi nhớ lỗi sai, rồi chuyển sang ngày tiếp theo khi bạn thấy đủ chắc.'}
        mascot={day.dayNumber === 48 ? 'saoNhi' : 'ruaRi'}
        pose={day.dayNumber === 48 ? 'sparkle' : 'guide'}
      />
    </VStack>
  );
}

function HeroLessonCard({ day }: { day: Foundation48Day }) {
  return (
    <Box className="penglish-glass-card" border="1px solid" borderColor={COLORS.border} borderRadius="3xl" p={{ base: '3', md: '4' }} bg="linear-gradient(135deg, rgba(232,244,255,0.82), rgba(255,255,255,0.80))">
      <HStack justify="space-between" gap="3" align="center">
        <Box minW="0">
          <Text color={COLORS.blue} fontSize="xs" fontWeight="950">Bài học ngày {day.dayNumber}</Text>
          <Text color={COLORS.text} fontWeight="950" fontSize={{ base: 'lg', md: '2xl' }} lineHeight="1.2">{day.title}</Text>
          <Text mt="1" color={COLORS.muted} fontWeight="700" fontSize="sm">Bài học được rút gọn theo từng bước để bạn vừa hiểu vừa luyện.</Text>
        </Box>
        {day.audio.length > 0 ? (
          <OceanMascot mascot="suaNghe" pose="listen" size="sm" decorative motion="float" />
        ) : day.dayNumber === 48 ? (
          <OceanMascot mascot="saoNhi" pose="sparkle" size="sm" decorative motion="float" />
        ) : (
          <OceanMascot mascot="poo" pose="coach" size="sm" decorative motion="float" />
        )}
      </HStack>
    </Box>
  );
}

function Section({ title, body, mascot, pose }: { title: string; body: string; mascot: any; pose?: any }) {
  return (
    <Box className="penglish-glass-card" border="1px solid" borderColor={COLORS.border} borderRadius="2xl" p={{ base: '3', md: '4' }} bg="rgba(255,255,255,0.78)">
      <Flex align="start" gap="3">
        <OceanMascot mascot={mascot} pose={pose} size="xs" decorative motion="pulse" />
        <Box minW="0">
          <Text fontWeight="950" color={COLORS.blue}>{title}</Text>
          <Text mt="1.5" color={COLORS.text} fontWeight="700" lineHeight="1.7">{body}</Text>
        </Box>
      </Flex>
    </Box>
  );
}

function ListSection({ title, items, mascot }: { title: string; items: string[]; mascot: any }) {
  return (
    <Box className="penglish-glass-card" border="1px solid" borderColor={COLORS.border} borderRadius="2xl" p={{ base: '3', md: '4' }} bg="rgba(255,255,255,0.78)">
      <Flex align="start" gap="3">
        <OceanMascot mascot={mascot} size="xs" decorative motion="pulse" />
        <Box minW="0">
          <Text fontWeight="950" color={COLORS.blue}>{title}</Text>
          <VStack align="stretch" gap="2" mt="2">
            {items.map((item) => <Text key={item} color={COLORS.text} fontWeight="750" lineHeight="1.65">• {item}</Text>)}
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}

function SourceLine({ line, important }: { line: string; important: boolean }) {
  return (
    <Box border="1px solid" borderColor="rgba(186,230,253,0.72)" borderRadius="2xl" px="3" py="2.5" bg="rgba(248,252,255,0.72)">
      <Text color={important ? COLORS.text : COLORS.muted} fontWeight={important ? '900' : '700'} lineHeight="1.65">{line}</Text>
    </Box>
  );
}
