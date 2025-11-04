import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 이 부분을 추가해 주세요.
  server: {
    port: 3000,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
