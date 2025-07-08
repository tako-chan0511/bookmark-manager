// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
import { supabase } from '@/supabase/supabase'

const routes = [
  { path: '/',     name: 'Home',     component: Home },
  { path: '/login',name: 'Login',    component: Login },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// グローバルガード
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession()

  if (to.meta.requiresAuth && !session) {
    // 未ログインならログイン画面へ
    next({ name: 'Login' })
  } else if ((to.name === 'Login' || to.name === 'Home') && session) {
    // ログイン済み／セッションありならダッシュボードへ
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
