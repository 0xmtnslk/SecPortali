import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Determine if running in Docker
const isDocker = process.env.VITE_API_URL && process.env.VITE_API_URL.includes('localhost');

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['sec-portali.medicalisg.com']
  }
})
