import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  envPrefix: ['VITE_', 'SUPABASE_', 'GEMINI_'],
  base: '/bhaiya.ai/',
});
