import { useEffect, useState } from 'react';
import { Box, HStack, VStack, Flex, Text, Button, Icon, Avatar, Tag, TagLabel, Input } from '@chakra-ui/react';
import { UserPlus, Check, X } from 'lucide-react';
import { get, post } from '../api';
import { AdaptiveWhaleScene, StreakOceanDots } from '../components/streak/AdaptiveWhaleStreak';

type Invitation = {
  id: string;
  email: string;
  status: 'invited' | 'accepted' | 'declined';
};

type StreakState = {
  inviter?: string;
  invitee?: string | null;
  status?: string;
  invitations?: Invitation[];
};

export function SharedStreakPage() {
  const [state, setState] = useState<StreakState>({});
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const refresh = () => {
    get<{ data: StreakState } | StreakState>('/shared-streak').then((r: any) => {
      const data = r?.data ?? r;
      setState(data ?? {});
    }).catch(() => {});
  };

  useEffect(() => {
    refresh();
  }, []);

  const invite = async () => {
    if (!email.trim() || sending) return;
    setSending(true);
    try {
      await post('/shared-streak/invite', { email });
      setEmail('');
      refresh();
    } finally {
      setSending(false);
    }
  };

  const accept = async (id: string) => {
    await post(`/shared-streak/invitations/${id}/accept`).catch(() => {});
    refresh();
  };

  const decline = async (id: string) => {
    await post(`/shared-streak/invitations/${id}/decline`).catch(() => {});
    refresh();
  };

  return (
    <Box px="6" pb="10" maxW="900px" mx="auto">
      <Box as="h2" position="absolute" left="-9999px">Chuỗi ngày học chung</Box>
      <VStack gap="2" mb="6" textAlign="center">
        <Text fontSize="2xl" fontWeight="800" color="#102A43">Chuỗi ngày học chung 🫧</Text>
        <Text color="#52667A">Học cùng bạn bè, giữ chuỗi học như một đàn cá voi nhỏ.</Text>
      </VStack>

      <Box
        bg="white"
        bgGradient={state.invitee ? 'linear(135deg, #DDF5FF 0%, #F8FCFF 58%, #FFFFFF 100%)' : 'linear(135deg, #F1F5F9 0%, #F8FCFF 58%, #FFFFFF 100%)'}
        border="1px solid"
        borderColor={state.invitee ? '#BAE6FD' : '#CBD5E1'}
        borderRadius="2xl"
        boxShadow={state.invitee ? '0 16px 38px rgba(47, 158, 235, 0.10)' : '0 12px 30px rgba(100, 117, 138, 0.08)'}
        p="6"
        mb="4"
        position="relative"
        overflow="hidden"
      >
        <Box position="absolute" right={{ base: '-34px', md: '8px' }} top={{ base: '-14px', md: '-8px' }} opacity={state.invitee ? 0.9 : 0.62}>
          <AdaptiveWhaleScene streak={state.invitee ? 75 : 0} variant="card" inactive={!state.invitee} />
        </Box>
        <Box position="relative" pr={{ base: '78px', md: '150px' }}>
          <HStack mb="3">
            <Text fontSize="xl">🫧</Text>
            <Text fontWeight="800" color={state.invitee ? '#1F6FD6' : '#64758A'}>{state.invitee ? 'Chuỗi học chung hiện tại' : 'Chưa có chuỗi'}</Text>
          </HStack>
          {state.invitee ? (
            <HStack gap="3" wrap="wrap">
              <Avatar name={state.inviter} border="2px solid #5BBCEB" />
              <Text fontWeight="700" color="#102A43">{state.inviter}</Text>
              <Text color="#2F9EEB" fontWeight="900">+</Text>
              <Avatar name={state.invitee} border="2px solid #5BBCEB" />
              <Text fontWeight="700" color="#102A43">{state.invitee}</Text>
            </HStack>
          ) : (
            <Text color="#52667A" fontSize="sm">Chưa có chuỗi học chung. Mời bạn bè để bắt đầu.</Text>
          )}
          <Box mt="4" maxW="340px">
            <StreakOceanDots days={7} activeIndex={0} inactive={!state.invitee} />
          </Box>
        </Box>
      </Box>

      <Box bg="white" borderRadius="2xl" boxShadow="lg" p="6" mb="4">
        <HStack mb="3">
          <Icon as={UserPlus} color="green.500" />
          <Text fontWeight="700">Mời bạn</Text>
        </HStack>
        <HStack gap="2">
          <Input
            placeholder="Email bạn bè"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && invite()}
          />
          <Button colorScheme="green" boxShadow="duo-button" onClick={invite} isLoading={sending}>
            Gửi mời
          </Button>
        </HStack>
      </Box>

      <Box bg="white" borderRadius="2xl" boxShadow="lg" p="6">
        <Text fontWeight="700" mb="3">Lời mời ({state.invitations?.length ?? 0})</Text>
        {!state.invitations || state.invitations.length === 0 ? (
          <Text color="gray.400" fontSize="sm" textAlign="center" py="6">
            Chưa có lời mời.
          </Text>
        ) : (
          <VStack align="stretch" gap="2">
            {state.invitations.map((inv) => (
              <HStack key={inv.id} p="3" borderRadius="xl" bg="gray.50" justify="space-between">
                <HStack gap="3">
                  <Avatar size="sm" name={inv.email} />
                  <VStack align="start" gap="0">
                    <Text fontWeight="600" fontSize="sm" noOfLines={1}>{inv.email}</Text>
                    <Tag size="sm" colorScheme={inv.status === 'accepted' ? 'green' : inv.status === 'declined' ? 'red' : 'orange'} borderRadius="full">
                      <TagLabel>{inv.status === 'accepted' ? 'Đã chấp nhận' : inv.status === 'declined' ? 'Từ chối' : 'Chờ phản hồi'}</TagLabel>
                    </Tag>
                  </VStack>
                </HStack>
                {inv.status === 'invited' && (
                  <HStack gap="1">
                    <Button size="sm" colorScheme="green" boxShadow="duo-button" leftIcon={<Icon as={Check} />} onClick={() => accept(inv.id)}>
                      Chấp nhận
                    </Button>
                    <Button size="sm" variant="ghost" color="#9A3412" _hover={{ bg: '#FFF7ED' }} leftIcon={<Icon as={X} />} onClick={() => decline(inv.id)}>
                      Từ chối
                    </Button>
                  </HStack>
                )}
              </HStack>
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  );
}
