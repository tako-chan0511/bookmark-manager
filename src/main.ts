import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@/assets/theme.css'    // テーマ変数をグローバル読み込み

// 起動時に保存テーマを反映
const saved = localStorage.getItem('theme') || 'light'
document.documentElement.setAttribute('data-theme', saved)

createApp(App)
  .use(router)
  .mount('#app')
