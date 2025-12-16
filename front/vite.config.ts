import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      hmr: {
          protocol: 'wss',
          host: 'www.confessions.africa',
          port: 443,
      },
      host: 'true',
      allowedHosts: ['confessions.africa'],
    },
});
