import { useMemo, useState } from 'react';
import { Box, SimpleGrid, HStack, VStack, Flex, Text, Button, Icon, Tag, TagLabel, Select, Tooltip } from '@chakra-ui/react';
import { Play, Headphones, Shuffle, Zap, Target, Clock, BookOpen, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getRecentPracticeSessions } from '../lib/p-english/localSkillMemory';
import { allPEnglishLessons, getLessonById } from '../lib/p-english/lesson-content-data';
import { getAvailableLessonProgressModes, type LessonProgressMode } from '../lib/p-english/lesson-progress';

const STARTER_A1_LESSON_ID = 'unit-1-greetings-introduction';

type Game = {
  id: string;
  name: string;
  desc: string;
  icon: any;
  tint: string;
  bg: string;
  difficulty: 'Dễ' | 'Vừa' | 'Khó';
  mode: LessonProgressMode | 'interactive';
  label: string;
};

const GAMES: Game[] = [
  { id: 'memory', name: 'Ghép từ với nghĩa', desc: 'Nối hai cột từ vựng cho khớp: từ tiếng Anh và nghĩa tiếng Việt.', icon: Target, tint: 'pink.500', bg: 'pink.50', difficulty: 'Dễ', mode: 'match', label: 'Ghim' },
  { id: 'scramble', name: 'Thử sức nhẹ', desc: 'Trả lời câu trắc nghiệm, điền chỗ trống và xếp lại từ thành câu.', icon: Shuffle, tint: 'purple.500', bg: 'purple.50', difficulty: 'Vừa', mode: 'quiz', label: 'Bắt đầu' },
  { id: 'listening', name: 'Luyện nghe', desc: 'Nghe một câu tiếng Anh nhẹ nhàng rồi chọn đáp án đúng.', icon: Headphones, tint: 'blue.500', bg: 'blue.50', difficulty: 'Khó', mode: 'listen', label: 'Nghe' },
  { id: 'speed', name: 'Luyện tốc độ', desc: 'Trả lời thật nhanh trong thời gian ngắn để nhận diện từ nhanh hơn.', icon: Zap, tint: 'orange.500', bg: 'orange.50', difficulty: 'Vừa', mode: 'speed', label: 'Tốc độ' },
  { id: 'reflex', name: 'Trò phản xạ', desc: 'Phản xạ với từ xuất hiện ngẫu nhiên để nói chuẩn và nhanh.', icon: Clock, tint: 'red.500', bg: 'red.50', difficulty: 'Khó', mode: 'reflex', label: 'Phản xạ' },
  { id: 'champion', name: 'Học bài cùng Poo', desc: 'Mở bài học tương tác để tiếp cận nội dung mới và học từng bước.', icon: BookOpen, tint: 'blue.500', bg: 'blue.50', difficulty: 'Dễ', mode: 'interactive', label: 'Học ngay' },
];

function getRecentLessonId(): string {
  const recent = getRecentPracticeSessions(3);
  const candidate = recent.find((session) => session.lessonId && session.lessonId !== STARTER_A1_LESSON_ID && getLessonById(session.lessonId));
  return candidate?.lessonId ?? STARTER_A1_LESSON_ID;
}

// Nhóm bài học theo đơn vị để danh sách chọn bài dễ đọc với trẻ.
function getLessonGroups() {
  return allPEnglishLessons.reduce<Array<{ unitTitle: string; lessons: typeof allPEnglishLessons }>>((groups, lesson) => {
    const group = groups.find((item) => item.unitTitle === lesson.unitTitle);
    if (group) group.lessons.push(lesson);
    else groups.push({ unitTitle: lesson.unitTitle, lessons: [lesson] });
    return groups;
  }, []);
}

export function GamesPage() {
  const defaultLessonId = useMemo(getRecentLessonId, []);
  const lessonGroups = useMemo(getLessonGroups, []);
  const [selectedLessonId, setSelectedLessonId] = useState<string>(defaultLessonId);
  const selectedLesson = useMemo(() => getLessonById(selectedLessonId), [selectedLessonId]);
  const availableModes = useMemo(() => (selectedLesson ? getAvailableLessonProgressModes(selectedLesson) : []), [selectedLesson]);

  return (
    <Box px={{ base: '4', md: '6' }} pb="10" maxW="1400px" mx="auto">
      <VStack align="start" gap="1" mb="5">
        <Text as="h1" fontSize="2xl" fontWeight="800">Chọn bài và trò luyện</Text>
        <Text color="gray.500" fontSize="sm">Chọn bài học trước, rồi chọn trò luyện mà Poo đã chuẩn bị sẵn.</Text>
      </VStack>

      <VStack align="start" gap="2" mb="6">
        <Text fontSize="md" fontWeight="700" color="gray.700">Bạn muốn luyện bài nào?</Text>
        <HStack gap="3" align="center" flexWrap="wrap">
          <Select
            aria-label="Chọn bài học để luyện"
            value={selectedLessonId}
            onChange={(event) => setSelectedLessonId(event.target.value)}
            maxW="420px"
            size="lg"
            bg="white"
            borderRadius="xl"
            boxShadow="sm"
            borderColor="gray.200"
            _focusVisible={{ outline: '3px solid', outlineColor: 'blue.500', outlineOffset: '2px' }}
          >
            {lessonGroups.map((group) => (
              <optgroup key={group.unitTitle} label={group.unitTitle}>
                {group.lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>{lesson.titleVi}</option>
                ))}
              </optgroup>
            ))}
          </Select>
          <Tag size="sm" colorScheme={availableModes.length > 0 ? 'green' : 'gray'} borderRadius="full">
            <TagLabel>{availableModes.length > 0 ? `${availableModes.length} trò sẵn sàng` : 'Bài này chưa có trò luyện'}</TagLabel>
          </Tag>
        </HStack>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
        {GAMES.map((game) => {
          const isInteractive = game.mode === 'interactive';
          const isUnavailable = !isInteractive && !availableModes.includes(game.mode as LessonProgressMode);
          const href = isInteractive
            ? `/learn/${selectedLessonId}`
            : `/practice?lessonId=${selectedLessonId}&mode=${game.mode}`;

          const cardContent = (
            <>
              <HStack mb="4" justify="space-between">
                <Flex w="56px" h="56px" borderRadius="xl" bg={game.bg} align="center" justify="center">
                  <Icon as={game.icon} boxSize="6" color={game.tint} />
                </Flex>
                {isUnavailable ? (
                  <Tag size="sm" colorScheme="gray" borderRadius="full">
                    <TagLabel>Chưa có</TagLabel>
                  </Tag>
                ) : (
                  <Tag
                    size="sm"
                    colorScheme={game.difficulty === 'Dễ' ? 'green' : game.difficulty === 'Vừa' ? 'orange' : 'red'}
                    borderRadius="full"
                  >
                    <TagLabel>{game.difficulty}</TagLabel>
                  </Tag>
                )}
              </HStack>
              <Text fontWeight="700" fontSize="lg" mb="2">{game.name}</Text>
              <Text color="gray.500" fontSize="sm" mb="4">{game.desc}</Text>
              {isUnavailable ? (
                <HStack gap="1.5" mb="3" color="gray.500">
                  <Icon as={Lock} boxSize="3.5" />
                  <Text fontSize="xs" fontWeight="600">Bài học này chưa hỗ trợ phần này.</Text>
                </HStack>
              ) : null}
              {isUnavailable ? (
                <Button
                  as="span"
                  size="sm"
                  colorScheme="gray"
                  leftIcon={<Icon as={Lock} />}
                  w="100%"
                  pointerEvents="none"
                  opacity={0.8}
                >
                  Chưa sẵn sàng
                </Button>
              ) : (
                <Button
                  as="span"
                  size="sm"
                  colorScheme="blue"
                  boxShadow="0 4px 0 #185BB2"
                  leftIcon={<Icon as={Play} />}
                  w="100%"
                  pointerEvents="none"
                >
                  {game.label}
                </Button>
              )}
            </>
          );

          if (isUnavailable) {
            return (
              <Tooltip label="Chuyển bài học khác để dùng phần này." openDelay={200} hasArrow placement="top">
                <Box
                  key={game.id}
                  p="6"
                  bg="white"
                  borderRadius="2xl"
                  boxShadow="xl"
                  display="block"
                  opacity={0.82}
                  aria-disabled="true"
                  _focusVisible={{ outline: '3px solid', outlineColor: 'gray.400', outlineOffset: '2px' }}
                >
                  {cardContent}
                </Box>
              </Tooltip>
            );
          }

          return (
            <Box
              key={game.id}
              as={Link}
              to={href}
              p="6"
              bg="white"
              borderRadius="2xl"
              boxShadow="xl"
              display="block"
              textDecoration="none"
              _hover={{ boxShadow: '2xl' }}
              _focusVisible={{ outline: '3px solid', outlineColor: 'blue.500', outlineOffset: '2px' }}
            >
              {cardContent}
            </Box>
          );
        })}
      </SimpleGrid>
    </Box>
  );
}
