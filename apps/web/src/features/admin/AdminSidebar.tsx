import { Box, Button, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { BarChart3, BookOpen, MessageSquare, Settings, Users, Waves, WholeWord } from 'lucide-react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Tổng quan', path: '/admin', icon: BarChart3 },
  { label: 'Người học', path: '/admin/users', icon: Users },
  { label: 'Bài học', path: '/admin/lessons', icon: BookOpen },
  { label: 'Từ vựng', path: '/admin/words', icon: WholeWord },
  { label: 'Phản hồi', path: '/admin/feedback', icon: MessageSquare },
  { label: 'Cài đặt', path: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <Box as="aside" w={{ base: '100%', lg: '280px' }} flexShrink={0} position={{ base: 'relative', lg: 'sticky' }} top={{ lg: '18px' }} alignSelf="flex-start">
      <Box className="penglish-glass-card" border="1px solid" borderColor="rgba(186,230,253,0.86)" bg="rgba(255,255,255,0.78)" borderRadius="3xl" p="4" boxShadow="0 18px 46px rgba(31,111,214,0.10)">
        <HStack gap="3" mb="5" px="2">
          <Box bg="linear-gradient(135deg, #0EA5E9, #38BDF8)" color="white" borderRadius="2xl" p="2.5" boxShadow="0 12px 26px rgba(14,165,233,0.25)">
            <Icon as={Waves} boxSize="5" />
          </Box>
          <VStack align="start" gap="0" minW="0">
            <Text color="#0F3557" fontWeight="900" letterSpacing="-0.03em">PooEnglish Admin</Text>
            <Text color="#52667A" fontSize="xs" fontWeight="750">Quản trị nội dung học</Text>
          </VStack>
        </HStack>

        <VStack align="stretch" gap="1.5">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                as={RouterLink}
                to={item.path}
                justifyContent="flex-start"
                gap="3"
                minH="46px"
                borderRadius="2xl"
                bg={active ? 'linear-gradient(135deg, #E0F2FE, #FFFFFF)' : 'transparent'}
                color={active ? '#0369A1' : '#16405F'}
                border="1px solid"
                borderColor={active ? '#BAE6FD' : 'transparent'}
                boxShadow={active ? '0 10px 24px rgba(31,111,214,0.08)' : 'none'}
                _hover={{ bg: 'rgba(239,246,255,0.82)', borderColor: '#BAE6FD' }}
              >
                <Icon as={item.icon} boxSize="4.5" />
                {item.label}
              </Button>
            );
          })}
        </VStack>
      </Box>
    </Box>
  );
}
