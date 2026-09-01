import React from 'react';

type IconProps = { size?: number; color?: string };

const wrap = (path: React.ReactNode) => ({ size = 22, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
);

export const HomeIcon = wrap(
  <>
    <path d="M3 12 12 3l9 9" />
    <path d="M5 10v10h14V10" />
    <path d="M10 20v-6h4v6" />
  </>,
);

export const GridIcon = wrap(
  <>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </>,
);

export const BookIcon = wrap(
  <>
    <path d="M4 4h13a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z" />
    <path d="M4 17h16" />
  </>,
);

export const PlayIcon = wrap(
  <>
    <polygon points="6 4 20 12 6 20 6 4" />
  </>,
);

export const ShopIcon = wrap(
  <>
    <path d="M3 7h18l-1.5 11a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2z" />
    <path d="M8 7V5a4 4 0 0 1 8 0v2" />
  </>,
);

export const TrophyIcon = wrap(
  <>
    <path d="M8 4h8v4a4 4 0 0 1-8 0z" />
    <path d="M5 6H3a3 3 0 0 0 3 3" />
    <path d="M19 6h2a3 3 0 0 1-3 3" />
    <path d="M9 14h6v6H9z" />
    <path d="M12 12v2" />
  </>,
);

export const PlusIcon = wrap(
  <>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </>,
);

export const ZapIcon = wrap(
  <>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </>,
);

export const MedalIcon = wrap(
  <>
    <circle cx="12" cy="14" r="6" />
    <path d="M8 4h8l-3 7h-2z" />
  </>,
);

export const UsersIcon = wrap(
  <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>,
);

export const ArrowRightIcon = wrap(
  <>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </>,
);

export const ChevronDoubleLeftIcon = wrap(
  <>
    <polyline points="11 17 6 12 11 7" />
    <polyline points="18 17 13 12 18 7" />
  </>,
);

export const ChevronDoubleRightIcon = wrap(
  <>
    <polyline points="13 17 18 12 13 7" />
    <polyline points="6 17 11 12 6 7" />
  </>,
);

export const FlameIcon = wrap(
  <>
    <path d="M12 2c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4-1 4 3 4 3 1 0-3-1-4 0-7" />
  </>,
);

export const StarIcon = wrap(
  <>
    <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9 12 2" />
  </>,
);

export const CoinIcon = wrap(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v10" />
    <path d="M9 9h4a2 2 0 0 1 0 4H9" />
    <path d="M9 13h5a2 2 0 0 1 0 4H9" />
  </>,
);

export const MoonIcon = wrap(
  <>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </>,
);

export const SunIcon = wrap(
  <>
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2" x2="12" y2="4" />
    <line x1="12" y1="20" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
    <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="4" y2="12" />
    <line x1="20" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
    <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
  </>,
);
