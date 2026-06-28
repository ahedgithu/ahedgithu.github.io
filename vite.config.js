import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        news: resolve(__dirname, 'news.html'),
        schedule: resolve(__dirname, 'schedule.html'),
        history: resolve(__dirname, 'history.html'),
        work: resolve(__dirname, 'work.html'),
      },
    },
  },
})
