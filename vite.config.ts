import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    optimizeDeps: {
      // Exclude lucide-react for better build optimization
      exclude: ['lucide-react'],
    },
    define: {
      // Expose GEMINI_API_KEY to the client
      'import.meta.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      // Configure path aliases for better import management
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
