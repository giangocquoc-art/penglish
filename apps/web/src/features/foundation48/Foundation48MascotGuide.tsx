import { Box, HStack, Icon, Text, VStack, type BoxProps } from '@chakra-ui/react';
import { Baby, CheckCircle2, Compass, Headphones, Sparkles } from 'lucide-react';
import { OceanMascot } from '../../components/p-english/OceanMascot';
import type { OceanMascotName, OceanMascotPoseName } from '../../lib/p-english/oceanAssets';
import type { Foundation48Day } from './foundation48Types';

export type Foundation48MascotKey = OceanMascotName | 'pip';

export type Foundation48MascotGuideConfig = {
  key: Foundation48MascotKey;
  name: string;
  role: string;
  message: string;
  pose?: string;
};

const fallbackIcon = {
  pip: Baby,
  poo: Compass,
  mucMo: Sparkles,
  ruaRi: Compass,
  cuaQuiz: CheckCircle2,
  suaNghe: Headphones,
  caNguaToc: Sparkles,
  saoNhi: Sparkles,
} satisfies Record<Foundation48MascotKey, any>;

const guideByStage: Record<number, Foundation48MascotGuideConfig> = {
  1: { key: 'pip', name: 'Pip + Poo', role: 'Bạn đồng hành khởi động', message: 'Không cần học nhanh, chỉ cần học chắc từng ngày.', pose: 'happy' },
  2: { key: 'mucMo', name: 'Mực Mo', role: 'Gia sư công thức', message: 'Mực Mo giúp bạn nhìn mẫu câu rõ ràng hơn.', pose: 'teacher' },
  3: { key: 'mucMo', name: 'Mực Mo + Rùa Rì', role: 'Ngữ pháp và ôn chậm', message: 'Cứ đi chậm, công thức nào cũng có nhịp riêng để nhớ.', pose: 'explain' },
  4: { key: 'suaNghe', name: 'Sứa Nghe + Poo', role: 'Phát âm và nghe nền', message: 'Sứa Nghe chuẩn bị nhịp nghe nhẹ để bạn bắt âm tốt hơn.', pose: 'listen' },
  5: { key: 'mucMo', name: 'Mực Mo', role: 'Liên kết ý', message: 'Hôm nay mình nối ý từng bước, không cần ôm hết một lần.', pose: 'hint' },
  6: { key: 'suaNghe', name: 'Sứa Nghe', role: 'Luyện nghe nền tảng', message: 'Nghe lượt đầu để bắt ý, lượt sau mới soi chi tiết.', pose: 'wave' },
  7: { key: 'cuaQuiz', name: 'Cua Quiz + Rùa Rì', role: 'Kiểm tra nhẹ', message: 'Cua Quiz kiểm tra nhẹ thôi, mục tiêu là biết mình cần ôn gì.', pose: 'quiz' },
  8: { key: 'saoNhi', name: 'Sao Nhi + Poo', role: 'Về đích tự tin', message: 'Sao Nhi giữ chỗ cho khoảnh khắc bạn nói về chính mình.', pose: 'sparkle' },
};

export function getFoundation48StageGuide(stageId: number) {
  return guideByStage[stageId] ?? guideByStage[1];
}

export function getFoundation48DayGuide(day: Foundation48Day, completed = false): Foundation48MascotGuideConfig {
  if (completed) {
    return { key: 'saoNhi', name: 'Sao Nhi', role: 'Mốc hoàn thành', message: 'Sao Nhi đánh dấu thêm một ngày bạn đã vượt qua.', pose: 'reward' };
  }
  if (day.dayNumber === 1) {
    return { key: 'poo', name: 'Poo', role: 'Người dẫn đường', message: 'Poo đi cùng bạn từ câu đầu tiên nha.', pose: 'coach' };
  }
  if (day.audio.length > 0) {
    return { key: 'suaNghe', name: 'Sứa Nghe', role: 'Bạn nghe hôm nay', message: 'Sứa Nghe đã chuẩn bị file nghe cho hôm nay.', pose: 'listen' };
  }
  if (day.stageId === 7) {
    return { key: 'cuaQuiz', name: 'Cua Quiz', role: 'Ôn tập nhẹ', message: 'Cua Quiz sẽ kiểm tra nhẹ thôi, không áp lực.', pose: 'quiz' };
  }
  if (day.stageId === 3 || day.stageId === 5) {
    return { key: 'mucMo', name: 'Mực Mo', role: 'Gia sư ngữ pháp', message: 'Mực Mo sẽ giúp bạn nhìn công thức thật dễ hiểu.', pose: 'teacher' };
  }
  if (day.stageId === 8) {
    return { key: 'saoNhi', name: 'Sao Nhi', role: 'Nhiệm vụ cuối khóa', message: 'Sao Nhi giữ nhịp để bạn tự tin trình bày bằng tiếng Anh.', pose: 'sparkle' };
  }
  return getFoundation48StageGuide(day.stageId);
}

export function Foundation48MascotGuide({ guide, compact = false, ...props }: { guide: Foundation48MascotGuideConfig; compact?: boolean } & BoxProps) {
  const icon = fallbackIcon[guide.key] ?? Sparkles;
  const mascot = guide.key === 'pip' ? 'poo' : guide.key;

  return (
    <HStack
      data-testid="foundation48-mascot-guide"
      align="center"
      gap={{ base: '3', md: '4' }}
      p={{ base: '3', md: compact ? '3' : '4' }}
      border="1px solid"
      borderColor="rgba(186,230,253,0.9)"
      borderRadius="2xl"
      bg="rgba(248,252,255,0.78)"
      boxShadow="0 14px 30px rgba(31,111,214,0.07)"
      minW="0"
      {...props}
    >
      <Box position="relative" flexShrink={0}>
        <OceanMascot
          mascot={mascot}
          pose={guide.pose as OceanMascotPoseName<typeof mascot>}
          size={compact ? 'xs' : 'sm'}
          decorative
          motion={guide.key === 'saoNhi' ? 'celebrate' : 'float'}
        />
        {guide.key === 'pip' ? (
          <HStack position="absolute" right="-1" bottom="-1" px="1.5" py="0.5" borderRadius="full" bg="#FFFFFF" border="1px solid #BAE6FD" color="#1F6FD6" gap="1">
            <Icon as={icon} boxSize="3" />
            <Text fontSize="9px" fontWeight="950">Pip</Text>
          </HStack>
        ) : null}
      </Box>
      <VStack align="start" gap="0.5" minW="0">
        <Text fontSize="xs" fontWeight="950" color="#1F6FD6" noOfLines={1}>{guide.name} · {guide.role}</Text>
        <Text color="#102A43" fontWeight="800" lineHeight="1.55" fontSize={{ base: 'sm', md: compact ? 'sm' : 'md' }}>
          {guide.message}
        </Text>
      </VStack>
    </HStack>
  );
}
