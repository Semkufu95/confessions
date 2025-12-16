import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
        exclude: ['lucide-react'],
    },
    server: {
        host: true,
        allowedHosts: [
            'confessions.africa',
            'www.confessions.africa',
        ],
        hmr: {
            protocol: 'wss',
            host: 'www.confessions.africa',
            port: 443,
        },
    },
});
