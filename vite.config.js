import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin/index.html'),
        schedule: resolve(__dirname, 'schedule.html'),
        history: resolve(__dirname, 'history.html'),
        profile: resolve(__dirname, 'profile.html'),
        cardioChestRevision: resolve(__dirname, 'cardio-chest-revision.html'),
        work: resolve(__dirname, 'work.html'),
      },
    },
  },
})
