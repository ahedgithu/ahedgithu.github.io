import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        schedule: resolve(__dirname, 'schedule.html'),
        history: resolve(__dirname, 'history.html'),
      },
    },
  },
})
