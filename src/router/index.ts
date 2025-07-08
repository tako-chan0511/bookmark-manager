// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/supabase/useAuth'      // ← これを追加
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'  // 新規追加

const routes = [
  { path: '/',    name: 'Home',     component: Home },
  { path: '/login', name: 'Login',  component: Login },
  // ログイン必須ダッシュボード
  { 
    path: '/dashboard', 
    name: 'Dashboard', 
    component: Dashboard, 
    meta: { requiresAuth: true } 
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ナビゲーションガード例：認証済みユーザーのみ /dashboard へ
router.beforeEach((to, from, next) => {
  const { user } = useAuth()  // supabase/useAuth.ts より
  if (to.meta.requiresAuth && !user.value) {
    next({ path: '/login' })
  } else {
    next()
  }
})

export default router
