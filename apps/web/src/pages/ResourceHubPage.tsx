import { useMemo, useState } from 'react';
import { Box, Button, Flex, HStack, Input, SimpleGrid, Tag, TagLabel, Text, VStack } from '@chakra-ui/react';
import { ExternalLink, Search, Waves } from 'lucide-react';
import { generatedEnglishResourceHub } from '../data/resources/generatedEnglishResourceHub';
import type { EnglishResourceCefrLevel, EnglishResourceSkillTag } from '../data/resources/resourceTypes';

const COLORS = {
  card: '#FFFFFF',
  softAqua: '#DDF5FF',
  softBlue: '#E8F4FF',
  oceanBlue: '#2F9EEB',
  deepBlue: '#1F6FD6',
  text: '#102A43',
  muted: '#52667A',
  border: '#D7E8F5',
  yellow: '#FFF3C4',
};

const SKILL_FILTERS: Array<'Tất cả' | EnglishResourceSkillTag> = ['Tất cả', 'Từ vựng', 'Ngữ pháp', 'Đọc', 'Nghe', 'Shadowing', 'Phát âm', 'Tự học miễn phí'];
const CEFR_FILTERS: Array<'Tất cả' | EnglishResourceCefrLevel> = ['Tất cả', 'A1', 'A2', 'B1', 'B2', 'All'];

function skillLabel(skill: string) {
  return skill === 'Shadowing' ? 'Nói đuổi' : skill;
}

export function ResourceHubPage() {
  const [selectedSkill, setSelectedSkill] = useState<(typeof SKILL_FILTERS)[number]>('Tất cả');
  const [selectedCefr, setSelectedCefr] = useState<(typeof CEFR_FILTERS)[number]>('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredResources = useMemo(() => {
    return generatedEnglishResourceHub.filter((resource) => {
      const matchesSkill = selectedSkill === 'Tất cả' || resource.skillTags.includes(selectedSkill);
      const matchesCefr = selectedCefr === 'Tất cả' || resource.cefrLevels.includes('All') || resource.cefrLevels.includes(selectedCefr);
      const searchable = [resource.titleVi, resource.summaryVi, resource.whenToUseVi, resource.pEnglishFirstVi, resource.levelHint, ...resource.searchTerms].join(' ').toLowerCase();
      const matchesSearch = !normalizedQuery || searchable.includes(normalizedQuery);
      return matchesSkill && matchesCefr && matchesSearch;
    });
  }, [normalizedQuery, selectedCefr, selectedSkill]);

  return (
    <Box px={{ base: '4', md: '6' }} pb="12" maxW="1200px" mx="auto" overflowX="hidden">
      <Flex mb="6" p={{ base: '5', md: '7' }} borderRadius="3xl" bgGradient="linear(135deg, #DDF5FF 0%, #E8F4FF 52%, #FFFFFF 100%)" border="1px solid" borderColor="#BAE6FD" boxShadow="0 18px 44px rgba(47, 158, 235, 0.14)" direction={{ base: 'column', md: 'row' }} justify="space-between" gap="4" position="relative" overflow="hidden">
        <Box position="absolute" right="-34px" top="-34px" w="180px" h="180px" borderRadius="full" bg="rgba(91,188,235,0.20)" pointerEvents="none" />
        <Box position="relative" minW="0">
          <HStack mb="2" gap="2" wrap="wrap">
            <Tag borderRadius="full" bg={COLORS.yellow} color={COLORS.text}><TagLabel>🐋 Kho tài nguyên</TagLabel></Tag>
            <Tag borderRadius="full" bg="white" color={COLORS.deepBlue} border="1px solid" borderColor="#BAE6FD"><TagLabel>Học trong PooEnglish trước, dùng link sau</TagLabel></Tag>
          </HStack>
          <Text as="h1" fontSize={{ base: '2xl', md: '4xl' }} fontWeight="900" color={COLORS.text} lineHeight="1.1">Kho tài nguyên học thêm</Text>
          <Text mt="3" color={COLORS.muted} maxW="760px" fontWeight="600">Tài nguyên miễn phí được chọn lọc theo CEFR và kỹ năng. Mỗi gợi ý có cách dùng rõ ràng để bạn không bị lạc trong quá nhiều link.</Text>
        </Box>
        <Flex align="center" justify="center" minW={{ md: '120px' }} pointerEvents="none" aria-hidden="true"><Text fontSize="6xl">🌊</Text></Flex>
      </Flex>

      <Box mb="5" p="4" borderRadius="3xl" bg="rgba(255,255,255,0.82)" border="1px solid" borderColor={COLORS.border} boxShadow="0 12px 28px rgba(16, 42, 67, 0.05)">
        <Flex direction={{ base: 'column', lg: 'row' }} gap="4" align={{ lg: 'end' }}>
          <Box flex="1" minW="0">
            <Text mb="2" fontSize="sm" fontWeight="900" color={COLORS.text}>Tìm nhanh</Text>
            <Box position="relative">
              <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" color={COLORS.muted} pointerEvents="none"><Search size={16} /></Box>
              <Input data-testid="resource-search-input" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Tìm nghe, phát âm, A1, nói đuổi..." pl="9" borderRadius="full" bg="white" borderColor="#BAE6FD" _focusVisible={{ borderColor: COLORS.oceanBlue, boxShadow: `0 0 0 3px ${COLORS.softAqua}` }} />
            </Box>
          </Box>
          <Box flex="2" minW="0">
            <Text mb="2" fontSize="sm" fontWeight="900" color={COLORS.text}>Kỹ năng</Text>
            <HStack gap="2" wrap="wrap">
              {SKILL_FILTERS.map((skill) => {
                const active = selectedSkill === skill;
                return <Button key={skill} data-testid={`resource-skill-filter-${skill === 'Tất cả' ? 'all' : skill.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/\s+/g, '-')}`} size="sm" borderRadius="full" variant="outline" bg={active ? COLORS.oceanBlue : 'white'} color={active ? 'white' : COLORS.deepBlue} borderColor={active ? COLORS.oceanBlue : '#BAE6FD'} onClick={() => setSelectedSkill(skill)}>{skillLabel(skill)}</Button>;
              })}
            </HStack>
          </Box>
          <Box flex="1" minW="0">
            <Text mb="2" fontSize="sm" fontWeight="900" color={COLORS.text}>CEFR</Text>
            <HStack gap="2" wrap="wrap">
              {CEFR_FILTERS.map((level) => {
                const active = selectedCefr === level;
                return <Button key={level} data-testid={`resource-cefr-filter-${level === 'Tất cả' || level === 'All' ? 'all' : level.toLowerCase()}`} size="sm" borderRadius="full" variant="outline" bg={active ? COLORS.deepBlue : 'white'} color={active ? 'white' : COLORS.deepBlue} borderColor={active ? COLORS.deepBlue : '#BAE6FD'} onClick={() => setSelectedCefr(level)}>{level === 'All' ? 'Mọi mức' : level}</Button>;
              })}
            </HStack>
          </Box>
        </Flex>
        <Text mt="3" color={COLORS.muted} fontSize="sm" fontWeight="700">Đang hiển thị {filteredResources.length}/{generatedEnglishResourceHub.length} gợi ý. Link ngoài chỉ để học thêm, không thay thế lộ trình chính.</Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="5">
        {filteredResources.map((resource) => {
          const isInternal = resource.url.startsWith('/');
          return (
            <Box key={resource.id} p="5" borderRadius="3xl" bg={COLORS.card} border="1px solid" borderColor={COLORS.border} boxShadow="0 14px 32px rgba(16, 42, 67, 0.06)">
              <VStack align="stretch" gap="3" h="100%">
                <HStack justify="space-between" align="start" gap="3">
                  <Tag borderRadius="full" bg={COLORS.softBlue} color={COLORS.deepBlue}><TagLabel>{resource.category}</TagLabel></Tag>
                  <Tag borderRadius="full" bg={resource.isFree ? '#ECFDF5' : '#FFF7ED'} color={resource.isFree ? '#047857' : '#C2410C'}><TagLabel>{resource.isFree ? 'Miễn phí' : 'Có phí'}</TagLabel></Tag>
                </HStack>
                <Box>
                  <Text as="h2" fontWeight="950" color={COLORS.text} fontSize="lg" lineHeight="1.25">{resource.titleVi}</Text>
                  <Text mt="1" color={COLORS.muted} fontSize="sm" fontWeight="700">Mức gợi ý: {resource.levelHint}</Text>
                </Box>
                <HStack gap="2" wrap="wrap">
                  {resource.cefrLevels.map((level) => <Tag key={level} size="sm" borderRadius="full" bg="#F0F9FF" color={COLORS.deepBlue}><TagLabel>{level === 'All' ? 'Mọi mức' : level}</TagLabel></Tag>)}
                  {resource.skillTags.slice(0, 3).map((skill) => <Tag key={skill} size="sm" borderRadius="full" bg="#F8FAFC" color={COLORS.text}><TagLabel>{skillLabel(skill)}</TagLabel></Tag>)}
                </HStack>
                <Text color={COLORS.muted} fontSize="sm" lineHeight="1.65">{resource.summaryVi}</Text>
                <Box p="3" borderRadius="2xl" bg="#F8FCFF" border="1px solid" borderColor="#E0F2FE">
                  <Text color={COLORS.text} fontSize="sm" fontWeight="900">Khi nào nên dùng?</Text>
                  <Text mt="1" color={COLORS.muted} fontSize="sm" lineHeight="1.55">{resource.whenToUseVi}</Text>
                </Box>
                <Box p="3" borderRadius="2xl" bg={COLORS.softAqua} color={COLORS.deepBlue} fontSize="sm" fontWeight="700">
                  <VStack align="stretch" gap="2">
                    <HStack align="start"><Waves size={16} /><Text>{resource.pEnglishFirstVi}</Text></HStack>
                    <Text color={COLORS.muted}>{resource.learnerNoteVi}</Text>
                  </VStack>
                </Box>
                <Button as="a" href={resource.url} target={isInternal ? undefined : '_blank'} rel={isInternal ? undefined : 'noreferrer'} mt="auto" borderRadius="full" bg={COLORS.oceanBlue} color="white" _hover={{ bg: COLORS.deepBlue }} _focusVisible={{ outline: '3px solid', outlineColor: COLORS.oceanBlue, outlineOffset: '2px' }} rightIcon={<ExternalLink size={16} />} aria-label={`${resource.actionLabelVi}: ${resource.titleVi}${isInternal ? '' : ' (mở tab mới)'}`}>
                  {resource.actionLabelVi}
                </Button>
              </VStack>
            </Box>
          );
        })}
      </SimpleGrid>

      {filteredResources.length === 0 && (
        <Box mt="6" p="5" borderRadius="3xl" bg={COLORS.softBlue} border="1px solid" borderColor="#BAE6FD" textAlign="center">
          <Text fontWeight="900" color={COLORS.text}>Chưa có tài nguyên khớp bộ lọc</Text>
          <Text mt="1" color={COLORS.muted}>Thử bỏ bớt từ khóa hoặc chọn “Tất cả” để xem lại toàn bộ gợi ý.</Text>
        </Box>
      )}
    </Box>
  );
}
