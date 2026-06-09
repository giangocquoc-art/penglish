import { useEffect, useState } from 'react';
import { Box, HStack, VStack, Flex, Text, Icon, Avatar, Input, IconButton, Divider } from '@chakra-ui/react';
import { Send, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { get, post } from '../api';
import { EmptyState } from '../components/EmptyState';

const MotionHStack = motion.create(HStack);

type Message = {
  id: string | number;
  content: string;
  createdAt?: string;
  author?: { id: number; name: string };
  userName?: string;
  userId?: number;
  avatar?: string;
  replyToMessageId?: string | null;
};

export function ChatPage() {
  const [items, setItems] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const currentUserId = (() => {
    try {
      const raw = localStorage.getItem('currentUser');
      if (!raw) return null;
      const u = JSON.parse(raw);
      return u?.id ?? null;
    } catch { return null; }
  })();

  const loadMessages = () => {
    get<{ data: Message[] } | Message[]>('/chat/messages').then((r: any) => {
      const arr = Array.isArray(r) ? r : r?.data ?? [];
      setItems(arr);
    }).catch(() => {});
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const send = async () => {
    if (!draft.trim() || sending) return;
    setSending(true);
    try {
      await post('/chat/messages', { content: draft });
      setDraft('');
      loadMessages();
    } catch {
    } finally {
      setSending(false);
    }
  };

  return (
    <Flex direction="column" px="6" pb="6" maxW="900px" mx="auto" h="calc(100vh - 72px)">
      <Box as="h2" position="absolute" left="-9999px">Chat</Box>
      <VStack align="start" gap="1" mb="4">
        <Text fontSize="2xl" fontWeight="800">Chat</Text>
        <Text color="gray.500" fontSize="sm">Trò chuyện với cộng đồng học viên.</Text>
      </VStack>

      <Box
        flex="1"
        overflowY="auto"
        bg="white"
        borderRadius="2xl"
        boxShadow="lg"
        p="4"
        mb="3"
      >
        <VStack align="stretch" gap="3">
          {items.length === 0 && (
            <EmptyState
              icon={MessageCircle}
              title="Chưa có tin nhắn nào"
              description="Hãy là người đầu tiên gửi lời chào tới cộng đồng."
              tint="purple"
            />
          )}
          {items.map((m, i) => {
            const name = m.author?.name ?? m.userName ?? 'Anon';
            const avatar = (m as any).avatar;
            const authorId = m.author?.id ?? m.userId;
            const isMine = currentUserId != null && authorId != null && String(authorId) === String(currentUserId);
            const animProps = i < 10
              ? { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.02, duration: 0.2 } }
              : { initial: false as const };
            return (
              <MotionHStack key={m.id} align="start" gap="3" {...animProps}>
                <Avatar
                  size="sm"
                  name={name}
                  src={avatar}
                  borderWidth={isMine ? '2px' : '0'}
                  borderColor={isMine ? 'green.500' : 'transparent'}
                />
                <Box flex="1" minW="0">
                  <HStack gap="2" mb="0.5">
                    <Text fontWeight="700" fontSize="sm" noOfLines={1}>{name}</Text>
                    <Text fontSize="xs" color="gray.400">
                      {m.createdAt ? new Date(m.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </Text>
                  </HStack>
                  <Box
                    bg={isMine ? 'green.50' : 'gray.50'}
                    borderRadius="lg"
                    px="3"
                    py="2"
                    fontSize="sm"
                    whiteSpace="pre-wrap"
                    wordBreak="break-word"
                  >
                    {m.content}
                  </Box>
                </Box>
              </MotionHStack>
            );
          })}
        </VStack>
      </Box>

      <HStack gap="2">
        <Input
          placeholder="Nhập tin nhắn..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          bg="white"
          h="48px"
        />
        <IconButton
          aria-label="send"
          icon={<Icon as={Send} />}
          colorScheme="green"
          boxShadow="duo-button"
          h="48px"
          w="48px"
          onClick={send}
          isLoading={sending}
        />
      </HStack>
    </Flex>
  );
}
