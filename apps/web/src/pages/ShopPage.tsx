import { useEffect, useMemo, useState } from 'react';
import {
  Box, SimpleGrid, HStack, VStack, Flex, Text, Button, Icon, Badge,
} from '@chakra-ui/react';
import {
  User, Image as ImageIcon, Star, Package, Upload, Eye, Plus, Check, Lock, Waves,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { get } from '../api';
import { EmptyState } from '../components/EmptyState';

const MotionBox = motion.create(Box);

type ShopItem = {
  id: number;
  name: string;
  type: 'avatar' | 'background' | 'streak_freeze' | string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  isUserUpload?: boolean;
};

type TabKey = 'avatar' | 'background' | 'special' | 'inventory';

const ASSET_EXT: Record<number, string> = {
  1: 'gif', 2: 'jpg', 3: 'jpg', 4: 'gif', 5: 'jpg', 6: 'jpg', 7: 'gif', 8: 'gif',
  10: 'gif', 12: 'jpg', 13: 'jpg', 16: 'webp', 17: 'jpg', 18: 'webp', 19: 'png',
  20: 'png', 21: 'png', 22: 'png', 23: 'png', 24: 'jpg', 25: 'jpg', 26: 'webp',
  27: 'jpg', 28: 'jpg', 29: 'gif', 30: 'jpg', 31: 'jpg', 32: 'jpg', 33: 'jpg',
  34: 'jpg', 35: 'jpg', 183: 'jpg',
};

function imgFor(item: ShopItem): string | null {
  const ext = ASSET_EXT[item.id];
  if (ext) return `/assets/shop/${item.id}.${ext}`;
  return item.imageUrl ?? null;
}

function fmtPrice(n: number): string {
  return n.toLocaleString('vi-VN');
}

function CoinCard({ coins }: { coins: number }) {
  return (
    <Box
      bgGradient="linear(135deg, #E0F7FF, #FFF3C4)"
      borderRadius="2xl"
      p={{ base: '4', md: '6' }}
      mb="6"
      boxShadow="0 10px 28px rgba(47, 158, 235, 0.16)"
      border="1px solid"
      borderColor="#BFEAFF"
    >
      <Flex align="center" justify="space-between" gap="4" flexWrap="wrap">
        <HStack gap="4">
          <Flex
            w="56px" h="56px"
            borderRadius="xl"
            bg="white"
            align="center" justify="center"
            fontSize="32px"
            boxShadow="md"
          >
            🪙
          </Flex>
          <VStack align="start" gap="0">
            <Text fontSize="sm" fontWeight="700" color="#1F6FD6">Số dư của bạn</Text>
            <HStack gap="2" align="baseline">
              <Text fontSize="32px" fontWeight="900" color="#102A43" lineHeight="1">
                {fmtPrice(coins)}
              </Text>
              <Text fontSize="lg" fontWeight="700" color="#52667A">xu</Text>
            </HStack>
          </VStack>
        </HStack>
        <Button
          bg="#2F9EEB"
          color="white"
          size="lg"
          fontWeight="800"
          borderRadius="xl"
          boxShadow="0 4px 0 #1F6FD6"
          _hover={{ transform: 'translateY(-1px)' }}
          _active={{ transform: 'translateY(2px)', boxShadow: '0 2px 0 #1F6FD6' }}
        >
          <Icon as={Plus} mr="2" /> Nạp thêm
        </Button>
      </Flex>
    </Box>
  );
}

const TABS: Array<{ key: TabKey; label: string; icon: typeof User }> = [
  { key: 'avatar', label: 'Avatar', icon: User },
  { key: 'background', label: 'Background', icon: ImageIcon },
  { key: 'special', label: 'Đặc biệt', icon: Star },
  { key: 'inventory', label: 'Kho', icon: Package },
];

function TabBar({ value, onChange }: { value: TabKey; onChange: (k: TabKey) => void }) {
  return (
    <HStack gap="2" mb="6" flexWrap="wrap">
      {TABS.map((t) => {
        const active = value === t.key;
        return (
          <Button
            key={t.key}
            onClick={() => onChange(t.key)}
            size="md"
            variant="ghost"
            bg={active ? '#DDF5FF' : 'white'}
            color={active ? '#1F6FD6' : 'gray.600'}
            border="1px solid"
            borderColor={active ? '#8FD8F7' : 'gray.200'}
            borderRadius="full"
            fontWeight="700"
            _hover={{ bg: active ? '#CBEFFF' : '#F7FBFF' }}
          >
            <Icon as={t.icon} mr="2" /> {t.label}
          </Button>
        );
      })}
    </HStack>
  );
}

function ItemTile({
  item, owned, canAfford, index,
}: {
  item: ShopItem; owned: boolean; canAfford: boolean; index: number;
}) {
  const src = imgFor(item);
  return (
    <MotionBox
      bg="white"
      borderRadius="xl"
      border="1px solid"
      borderColor="gray.100"
      overflow="hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3) }}
      whileHover={{ y: -3 }}
      _hover={{ borderColor: '#5BBCEB', boxShadow: '0 14px 34px rgba(47, 158, 235, 0.16)' }}
      position="relative"
    >
      {owned && (
        <Badge
          position="absolute" top="2" right="2" zIndex="1"
          colorScheme="green" borderRadius="md" px="2" py="1"
          fontSize="xs" fontWeight="800"
        >
          <Icon as={Check} mr="1" /> Đã có
        </Badge>
      )}
      <Flex
        aspectRatio={1}
        bg="gray.50"
        align="center" justify="center"
        overflow="hidden"
      >
        {src ? (
          <Box
            as="img"
            src={src}
            alt={item.name}
            w="100%" h="100%"
            objectFit="cover"
            loading="lazy"
            onError={(e: any) => {
              if (item.imageUrl && e.currentTarget.src !== item.imageUrl) {
                e.currentTarget.src = item.imageUrl;
              }
            }}
          />
        ) : (
          <Text fontSize="5xl">{item.type === 'streak_freeze' ? '🧊' : '🎁'}</Text>
        )}
      </Flex>
      <VStack align="stretch" gap="2" p="3">
        <Text fontWeight="700" fontSize="sm" noOfLines={2} minH="40px" color="gray.800">
          {item.name}
        </Text>
        <HStack justify="space-between">
          <HStack
            bg="yellow.50" borderRadius="full" px="2" py="1" gap="1"
            border="1px solid" borderColor="yellow.200"
          >
            <Text fontSize="sm">🪙</Text>
            <Text fontSize="sm" fontWeight="800" color="yellow.800">{fmtPrice(item.price)}</Text>
          </HStack>
          {!owned && (
            <Button
              size="xs" bg="#2F9EEB" color="white" fontWeight="800" borderRadius="md"
              isDisabled={!canAfford}
              boxShadow={canAfford ? '0 2px 0 #1F6FD6' : undefined}
            >
              {canAfford ? 'Mua' : 'Thiếu xu'}
            </Button>
          )}
        </HStack>
      </VStack>
    </MotionBox>
  );
}

function UploadTile() {
  return (
    <Flex
      direction="column"
      align="center" justify="center"
      borderRadius="xl"
      border="2px dashed"
      borderColor="#8FD8F7"
      bg="#F7FBFF"
      color="#1F6FD6"
      cursor="pointer"
      _hover={{ bg: '#DDF5FF', borderColor: '#5BBCEB' }}
      aspectRatio={0.85}
      gap="2"
      p="3"
    >
      <Icon as={Upload} boxSize="6" />
      <Text fontSize="sm" fontWeight="700" textAlign="center">Upload custom</Text>
      <Text fontSize="xs" color="#52667A" textAlign="center">Tải ảnh của bạn</Text>
    </Flex>
  );
}

const PLACEHOLDER_ITEMS: Record<TabKey, Array<{ title: string; desc: string }>> = {
  avatar: [
    { title: 'Mũ thủy thủ', desc: 'Sắp mở khóa' },
    { title: 'Cá voi học bài', desc: 'Đang chuẩn bị' },
    { title: 'Bong bóng chuỗi học', desc: 'Vật phẩm mẫu' },
  ],
  background: [
    { title: 'Vịnh học tập', desc: 'Sắp ra mắt' },
    { title: 'Sóng xanh dịu', desc: 'Đang chuẩn bị' },
    { title: 'Bầu trời biển', desc: 'Vật phẩm mẫu' },
  ],
  special: [
    { title: 'Vé ôn tập nhanh', desc: 'Sắp ra mắt' },
    { title: 'Bùa nhớ lâu', desc: 'Đang chuẩn bị' },
    { title: 'Rương đại dương', desc: 'Vật phẩm mẫu' },
  ],
  inventory: [
    { title: 'Kho avatar', desc: 'Mua vật phẩm để thêm vào' },
    { title: 'Kho nền học tập', desc: 'Mở khóa bằng xu' },
  ],
};

function OceanShopEmptyState({ tab }: { tab: TabKey }) {
  const items = PLACEHOLDER_ITEMS[tab];

  return (
    <VStack align="stretch" gap="4">
      <Box
        bgGradient="linear(135deg, #F7FBFF, #DDF5FF)"
        border="1px solid"
        borderColor="#BFEAFF"
        borderRadius="3xl"
        p={{ base: '5', md: '7' }}
        position="relative"
        overflow="hidden"
        boxShadow="0 16px 40px rgba(47, 158, 235, 0.12)"
      >
        <Box position="absolute" right="-28px" top="-28px" w="120px" h="120px" borderRadius="full" bg="rgba(91, 188, 235, 0.22)" />
        <Box position="absolute" left="18px" bottom="-34px" w="140px" h="72px" borderRadius="full" bg="rgba(56, 200, 216, 0.12)" />
        <Flex position="relative" direction={{ base: 'column', md: 'row' }} align={{ base: 'start', md: 'center' }} justify="space-between" gap="5">
          <HStack align="start" gap="4">
            <Flex w="58px" h="58px" borderRadius="2xl" bg="white" color="#1F6FD6" align="center" justify="center" boxShadow="0 10px 24px rgba(47, 158, 235, 0.18)" flexShrink={0}>
              <Icon as={Waves} boxSize="7" />
            </Flex>
            <VStack align="start" gap="1">
              <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="900" color="#102A43" letterSpacing="-0.02em">
                Cửa hàng cá voi đang chuẩn bị vật phẩm mới.
              </Text>
              <Text color="#52667A" lineHeight="1.7" maxW="640px">
                Hoàn thành bài học để kiếm xu và mở khóa giao diện. Các vật phẩm bên dưới là bản xem trước, chưa phát âm có thể mua.
              </Text>
            </VStack>
          </HStack>
          <Badge bg="white" color="#1F6FD6" border="1px solid" borderColor="#8FD8F7" borderRadius="full" px="3" py="1" fontWeight="800">
            Sắp cập nhật
          </Badge>
        </Flex>
      </Box>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="4">
        {items.map((item) => (
          <Box key={item.title} bg="white" border="1px solid" borderColor="#D7ECF8" borderRadius="2xl" p="4" boxShadow="0 10px 26px rgba(16, 42, 67, 0.06)">
            <HStack justify="space-between" align="start" gap="3">
              <Flex w="46px" h="46px" borderRadius="xl" bg="#DDF5FF" color="#1F6FD6" align="center" justify="center" flexShrink={0}>
                <Icon as={Lock} boxSize="5" />
              </Flex>
              <Badge bg="#FFF3C4" color="#9A5B00" borderRadius="full" fontWeight="800">Mẫu</Badge>
            </HStack>
            <Text mt="4" fontWeight="800" color="#102A43">{item.title}</Text>
            <Text mt="1" fontSize="sm" color="#52667A">{item.desc}</Text>
          </Box>
        ))}
      </SimpleGrid>
    </VStack>
  );
}

export function ShopPage() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [coins, setCoins] = useState<number>(0);
  const [inventory, setInventory] = useState<number[]>([]);
  const [tab, setTab] = useState<TabKey>('avatar');

  useEffect(() => {
    get<any>('/shop/items').then((r) => {
      const list: ShopItem[] = Array.isArray(r) ? r : (r?.data ?? r?.body ?? []);
      setItems(list);
    }).catch(() => {});
    get<any>('/shop/coins').then((r) => {
      const c = r?.coins ?? r?.data?.coins ?? r?.body?.coins ?? 0;
      setCoins(typeof c === 'number' ? c : 0);
    }).catch(() => {});
    get<any>('/shop/inventory').then((r) => {
      const list = Array.isArray(r) ? r : (r?.data ?? r?.body ?? []);
      const ids = list.map((x: any) => (typeof x === 'number' ? x : x?.itemId ?? x?.id)).filter((v: any) => typeof v === 'number');
      setInventory(ids);
    }).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    if (tab === 'inventory') return items.filter((i) => inventory.includes(i.id));
    if (tab === 'avatar') return items.filter((i) => i.type === 'avatar');
    if (tab === 'background') return items.filter((i) => i.type === 'background');
    return items.filter((i) => i.type !== 'avatar' && i.type !== 'background');
  }, [items, tab, inventory]);

  return (
    <Box px="6" pb="10" maxW="1400px" mx="auto">
      <Flex justify="space-between" align="center" mb="5" flexWrap="wrap" gap="3">
        <Text as="h2" fontSize="2xl" fontWeight="800" color="gray.800">Cửa hàng</Text>
        <Button
          variant="outline" borderColor="#8FD8F7" color="#1F6FD6" bg="white" size="sm" borderRadius="full" fontWeight="700"
        >
          <Icon as={Eye} mr="2" /> Xem toàn cảnh
        </Button>
      </Flex>

      <CoinCard coins={coins} />
      <TabBar value={tab} onChange={setTab} />

      {filtered.length === 0 ? (
        <OceanShopEmptyState tab={tab} />
      ) : (
        <SimpleGrid columns={{ base: 2, md: 3, lg: 4, xl: 5 }} gap="4">
          {filtered.map((it, i) => (
            <ItemTile
              key={it.id}
              item={it}
              owned={inventory.includes(it.id)}
              canAfford={coins >= it.price}
              index={i}
            />
          ))}
          {tab === 'avatar' && <UploadTile />}
        </SimpleGrid>
      )}
    </Box>
  );
}
