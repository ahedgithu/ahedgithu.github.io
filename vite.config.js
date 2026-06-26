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
        adminLogin: resolve(__dirname, 'admin/login/index.html'),
        adminDashboard: resolve(__dirname, 'admin/dashboard/index.html'),
        adminTopics: resolve(__dirname, 'admin/topics/index.html'),
      },
    },
  },
})
