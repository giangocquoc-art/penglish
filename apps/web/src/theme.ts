import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const fontStack = `"Be Vietnam Pro", Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;

// Brand color palette
const green = {
  50: '#f0fff4',
  100: '#c6f6d5',
  200: '#9ae6b4',
  300: '#89e219',
  400: '#68d639',
  500: '#58cc02',
  600: '#58a700',
  700: '#4b8f00',
  800: '#3d7200',
  900: '#2f5600',
};
const blue = {
  50: '#e6f7ff',
  100: '#bae7ff',
  200: '#91d5ff',
  300: '#69c0ff',
  400: '#49c0f8',
  500: '#1cb0f6',
  600: '#1899d6',
  700: '#0e7bb5',
  800: '#0a5d8a',
  900: '#064060',
};
const purple = {
  50: '#faf5ff',
  100: '#f3e8ff',
  200: '#e9d5ff',
  300: '#dda0ff',
  400: '#d18dff',
  500: '#ce82ff',
  600: '#a855f7',
  700: '#9333ea',
  800: '#7e22ce',
  900: '#581c87',
};
const yellow = {
  50: '#fffbeb',
  100: '#fef3c7',
  200: '#fde68a',
  300: '#fcd34d',
  400: '#ffc800',
  500: '#f59e0b',
  600: '#d97706',
  700: '#b45309',
  800: '#92400e',
  900: '#78350f',
};
const orange = {
  50: '#fff7ed',
  100: '#ffedd5',
  200: '#fed7aa',
  300: '#fdba74',
  400: '#fb923c',
  500: '#ff9600',
  600: '#ea7e00',
  700: '#c2410c',
  800: '#9a3412',
  900: '#7c2d12',
};
const red = {
  50: '#fef2f2',
  100: '#fee2e2',
  200: '#fecaca',
  300: '#fca5a5',
  400: '#f87171',
  500: '#ff4b4b',
  600: '#ea2b2b',
  700: '#b91c1c',
  800: '#991b1b',
  900: '#7f1d1d',
};
const pink = {
  50: '#fdf2f8',
  100: '#fce7f3',
  200: '#fbcfe8',
  300: '#f9a8d4',
  400: '#f472b6',
  500: '#ff86d0',
  600: '#db2777',
  700: '#be185d',
  800: '#9d174d',
  900: '#831843',
};

export const theme = extendTheme({
  config,
  colors: {
    // Brand = green
    brand: green,
    // Named palettes
    green,
    blue,
    purple,
    yellow,
    orange,
    red,
    pink,
    // Ocean theme aliases
    ocean: blue,
    whale: blue,
    sponge: yellow,
    bubble: blue,
    // Streak alias = ocean palette
    streak: blue,
    // Ink palette
    ink: pink,
    // Flat color tokens
    duo: {
      green: '#58cc02',
      greenDark: '#58a700',
      blue: '#1cb0f6',
      blueDark: '#1899d6',
      purple: '#ce82ff',
      yellow: '#ffc800',
      gold: '#ff9600',
      orange: '#ff9600',
      red: '#ff4b4b',
      pink: '#ff86d0',
    },
    // Semantic accent map
    accent: {
      green: '#58cc02',
      blue: '#1cb0f6',
      purple: '#ce82ff',
      orange: '#ff9600',
      pink: '#ff86d0',
      yellow: '#ffc800',
    },
  },
  semanticTokens: {
    colors: {
      primary: { default: 'blue.500', _dark: 'blue.400' },
      success: { default: 'green.500', _dark: 'green.400' },
      warning: { default: 'orange.500', _dark: 'orange.400' },
      error: { default: 'red.500', _dark: 'red.400' },
      coin: { default: 'yellow.400', _dark: 'yellow.300' },
    },
  },
  fonts: {
    heading: fontStack,
    body: fontStack,
    mono: `'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', monospace`,
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  radii: {
    none: '0',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    glow: '0 0 20px rgba(88, 204, 2, 0.4)',
    'glow-blue': '0 0 20px rgba(28, 176, 246, 0.4)',
    'glow-purple': '0 0 20px rgba(206, 130, 255, 0.4)',
    'duo-button': '0 4px 0 #58a700',
    'duo-button-blue': '0 4px 0 #1899d6',
    // Aliases for card/soft/pop
    card: '0 12px 30px rgba(15, 23, 42, 0.18)',
    soft: '0 18px 40px rgba(15, 23, 42, 0.18)',
    pop: '0 8px 24px rgba(0,0,0,0.08)',
  },
  styles: {
    global: (props: { colorMode: 'light' | 'dark' }) => ({
      'html, body, #root': {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
        minHeight: '100vh',
        fontFamily: 'body',
      },
      body: {
        fontWeight: 400,
        lineHeight: 1.55,
        textRendering: 'optimizeLegibility',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
      'h1, h2, h3, h4, h5, h6': {
        fontFamily: 'heading',
        fontWeight: 700,
        letterSpacing: '-0.02em',
        lineHeight: 1.14,
      },
      a: { textDecoration: 'none' },
    }),
  },
  components: {
    Button: {
      baseStyle: { fontWeight: 700, borderRadius: 'xl' },
    },
  },
});
