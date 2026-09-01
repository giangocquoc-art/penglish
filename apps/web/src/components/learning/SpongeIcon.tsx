import { Box } from '@chakra-ui/react';

export type SpongeIconProps = {
  size?: number;
  active?: boolean;
  compact?: boolean;
  className?: string;
  decorative?: boolean;
};

export function SpongeIcon({
  size,
  active = true,
  compact = false,
  className,
  decorative = true,
}: SpongeIconProps) {
  const iconSize = size ?? (compact ? 18 : 22);
  const spongeFill = active ? '#FFD95A' : '#A8B7C7';
  const spongeMid = active ? '#F9B93E' : '#7F91A5';
  const spongeDark = active ? '#D88A1F' : '#64758A';
  const bubbleFill = active ? '#AEE7FF' : '#D8E2EC';
  const bubbleStroke = active ? '#5BBCEB' : '#9BAABC';
  const opacity = active ? 1 : 0.56;
  const shadow = active ? 'drop-shadow(0 4px 7px rgba(249, 185, 62, 0.28))' : 'drop-shadow(0 3px 5px rgba(100, 117, 138, 0.12))';

  return (
    <Box
      as="svg"
      className={className}
      width={`${iconSize}px`}
      height={`${iconSize}px`}
      viewBox="0 0 64 64"
      fill="none"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? 'true' : undefined}
      aria-label={decorative ? undefined : active ? 'Bọt biển còn' : 'Bọt biển đã dùng'}
      flexShrink={0}
      display="inline-block"
      style={{ filter: shadow, opacity }}
    >
      <path
        d="M17.7 14.4C22.6 7.8 34 8.8 38.1 14.8C44.5 12.6 51.8 17.3 51.4 25C57.4 29.5 54.3 40.3 47 41.2C46.9 49.3 39.2 56.1 29.8 55.2C20.8 54.3 14.1 47.9 15.6 40.2C8.7 36.8 9.1 26.1 16.4 23.7C14.8 20.3 15.2 17 17.7 14.4Z"
        fill={spongeFill}
        stroke={spongeDark}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M20.2 17.8C24.1 12.9 33.2 13.7 36.3 18.2C42 16 47.3 20.2 47 26.2C52.2 30.2 48.9 37.9 43.2 37.9C42.2 45.3 35.6 50.4 28.3 49.5C21.6 48.7 17.4 43.9 19 37.3C13.5 34.5 14.4 27.6 20.7 26.2C18.5 23.1 17.9 20.2 20.2 17.8Z"
        fill={`url(#spongeGradient-${active ? 'active' : 'inactive'})`}
        opacity="0.94"
      />
      <circle cx="28" cy="25" r="3.2" fill={spongeMid} opacity="0.72" />
      <circle cx="40.5" cy="29.5" r="2.6" fill={spongeMid} opacity="0.62" />
      <circle cx="25" cy="39" r="2.4" fill={spongeMid} opacity="0.58" />
      <circle cx="35.5" cy="43" r="3" fill={spongeMid} opacity="0.48" />
      <circle cx="18" cy="9" r="4" fill={bubbleFill} stroke={bubbleStroke} strokeWidth="1.4" opacity={active ? 0.9 : 0.55} />
      <circle cx="49" cy="13" r="3" fill={bubbleFill} stroke={bubbleStroke} strokeWidth="1.2" opacity={active ? 0.76 : 0.46} />
      <circle cx="54" cy="48" r="2.5" fill={bubbleFill} stroke={bubbleStroke} strokeWidth="1" opacity={active ? 0.72 : 0.42} />
      <defs>
        <linearGradient id="spongeGradient-active" x1="17" y1="14" x2="45" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF3A3" />
          <stop offset="0.52" stopColor="#FFD95A" />
          <stop offset="1" stopColor="#F9B93E" />
        </linearGradient>
        <linearGradient id="spongeGradient-inactive" x1="17" y1="14" x2="45" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D8E2EC" />
          <stop offset="0.58" stopColor="#A8B7C7" />
          <stop offset="1" stopColor="#7F91A5" />
        </linearGradient>
      </defs>
    </Box>
  );
}
