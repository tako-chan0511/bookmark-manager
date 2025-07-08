// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import { useAuth } from '@/supabase/useAuth'

// ルート定義
const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  // 認証後しか見せたくないページ例
  { 
    path: '/dashboard', 
    name: 'Dashboard', 
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ルーターガード
router.beforeEach((to, from, next) => {
  const { user } = useAuth()
  if (to.meta.requiresAuth && !user.value) {
    next({ name: 'Login' })
  } else {
    next()
  }
})

export default router
