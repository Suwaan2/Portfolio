import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    rollupOptions: {
      output: {
        // keep animation libraries in their own long-cacheable chunks
        manualChunks: {
          gsap: ['gsap', 'gsap/ScrollTrigger', 'gsap/SplitText', '@gsap/react'],
          motion: ['framer-motion'],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
