import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  envDir: '../..',
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          const normalizedId = id.replace(/\\/g, '/');

          if (
            normalizedId.includes('/react-dom/') ||
            normalizedId.includes('/react/') ||
            normalizedId.includes('/scheduler/') ||
            normalizedId.includes('/@chakra-ui/') ||
            normalizedId.includes('/@emotion/') ||
            normalizedId.includes('/framer-motion/')
          ) return 'vendor-ui';
          if (normalizedId.includes('/react-router-dom/') || normalizedId.includes('/@remix-run/router/')) return 'vendor-router';
          if (normalizedId.includes('/lucide-react/') || normalizedId.includes('/react-icons/')) return 'vendor-icons';
          if (normalizedId.includes('/gsap/') || normalizedId.includes('/@gsap/react/')) return 'vendor-gsap';
          if (normalizedId.includes('/axios/')) return 'vendor-axios';

          return undefined;
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
});
