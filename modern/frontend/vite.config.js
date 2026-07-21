import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Lets `npm run dev` on the host talk to the containerized API gateway.
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
