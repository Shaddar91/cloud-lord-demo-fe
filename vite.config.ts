import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

//Static SPA build. The API base URL is injected at build time via
//VITE_API_BASE_URL (import.meta.env) — no dev proxy, the app calls the
//absolute cross-origin api-demo.cloud-lord.com host directly.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
})
