import { Box, HStack, Image, Text, Tooltip, VStack } from '@chakra-ui/react';

type BrandLogoVariant = 'compact' | 'icon' | 'full';
type BrandLogoSize = 'sm' | 'md' | 'lg';

type BrandLogoProps = {
  variant?: BrandLogoVariant;
  size?: BrandLogoSize;
  showSubtitle?: boolean;
};

const LOGO_ICON_SRC = '/brand/p-english-whale-icon.png';
const LOGO_FULL_SRC = '/brand/p-english-whale-logo.png';

const sizeConfig: Record<BrandLogoSize, { box: string; image: string; radius: string; title: string; subtitle: string; gap: string }> = {
  sm: { box: '38px', image: '34px', radius: '14px', title: 'lg', subtitle: '2xs', gap: '2' },
  md: { box: '46px', image: '42px', radius: '16px', title: '2xl', subtitle: 'xs', gap: '2.5' },
  lg: { box: '56px', image: '50px', radius: '18px', title: '3xl', subtitle: 'sm', gap: '3' },
};

const LOGO_TOOLTIPS = [
  'Đừng chọt Poo, Poo đang học 🐳',
  'Hôm nay học 15 phút chưa?',
  'Poo tin bạn làm được.',
  'Một bài nhỏ thôi cũng là tiến bộ.',
];

export function BrandLogo({ variant = 'compact', size = 'md', showSubtitle = false }: BrandLogoProps) {
  const config = sizeConfig[size];
  const showText = variant !== 'icon';
  const shouldShowSubtitle = showText && showSubtitle;

  const tooltip = LOGO_TOOLTIPS[Math.floor(Math.random() * LOGO_TOOLTIPS.length)];

  return (
    <Tooltip label={tooltip} hasArrow borderRadius="full" bg="#102A43" color="white" px="3" py="2" openDelay={180} shouldWrapChildren>
      <HStack gap={config.gap} align="center" minW="0" tabIndex={0} role="img" aria-label="PooEnglish logo">
        <Box
        w={config.box}
        h={config.box}
        borderRadius={config.radius}
        bg="#FFFFFF"
        border="1px solid"
        borderColor="#DDE7F3"
        boxShadow="0 10px 24px rgba(16, 32, 51, 0.10)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
        flexShrink={0}
      >
          <Image
            src={LOGO_ICON_SRC}
            alt="PooEnglish logo"
            w={config.image}
            h={config.image}
            objectFit="contain"
            fallbackSrc={LOGO_FULL_SRC}
            fallback={<Text fontSize={size === 'sm' ? 'lg' : 'xl'}>📚</Text>}
          />
        </Box>

        {showText ? (
          <VStack align="start" gap="0" minW="0" lineHeight="1">
            <Text
              fontSize={config.title}
              fontWeight="900"
              letterSpacing="-0.03em"
              color="#0F172A"
              lineHeight="0.95"
              noOfLines={1}
            >
              PooEnglish
            </Text>
            {shouldShowSubtitle ? (
              <Text fontSize={config.subtitle} fontWeight="700" color="#64748B" lineHeight="1.25" noOfLines={1} mt="1">
                Học tiếng Anh mỗi ngày
              </Text>
            ) : null}
          </VStack>
        ) : null}
      </HStack>
    </Tooltip>
  );
}
