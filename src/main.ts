// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'        // ← この行を追加

// import './assets/main.css'           // 必要に応じてグローバルCSS

const app = createApp(App)
app.use(router)                      // ← ルーターを登録
app.mount('#app')