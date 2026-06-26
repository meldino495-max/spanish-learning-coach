import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: '127.0.0.1',
    strictPort: true,
    watch: {
      // Electron 运行时会往 .app-data 写大量文件并锁定，dev 监听它会导致 EBUSY 崩溃
      ignored: ['**/.app-data/**', '**/dist/**'],
    },
  },
  preview: {
    host: '127.0.0.1',
    strictPort: true,
  },
});
