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
  // サンドボックスモード判定
  const isSandbox = localStorage.getItem('sandbox_mode') === 'true'
  
  const { data: { session } } = await supabase.auth.getSession()

  if (to.meta.requiresAuth && !session && !isSandbox) {
    // 未ログイン＆サンドボックスでなければログイン画面へ
    next({ name: 'Login' })
  } else if ((to.name === 'Login' || to.name === 'Home') && session && !isSandbox) {
    // ログイン済み（サンドボックスではない）ならダッシュボードへ
    next({ name: 'Dashboard' })
  } else if ((to.name === 'Login' || to.name === 'Home') && isSandbox) {
    // サンドボックスモード中はダッシュボードへ
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
