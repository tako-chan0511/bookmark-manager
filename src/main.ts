// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'        // ← この行を追加
import { supabase } from '@/supabase/supabase'
// アプリ起動前にセッション情報を消す
supabase.auth.signOut().catch(() => {
  /* ログアウト済みなら無視 */
})

// import './assets/main.css'           // 必要に応じてグローバルCSS

const app = createApp(App)
app.use(router)                      // ← ルーターを登録
app.mount('#app')