import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // Inside Docker, use the service name 'server' to reach the backend container
        // On localhost, this will resolve to the backend service on the same network
        target: 'http://server:5000',
        changeOrigin: true,
      },
    },
  },
})
