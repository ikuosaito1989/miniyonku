import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: { fs: { deny: ['.env','.env.*','*.{crt,pem}','**/.git/**','**/private/audio/**'] } },
  build: { rollupOptions: { input: { main: 'index.html', 'sound-lab': 'sound-lab.html' }, output: { manualChunks: { phaser: ['phaser'] } } } },
});
