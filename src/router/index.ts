// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
import { supabase } from '@/supabase/supabase'
import { getAppModeRef } from '@/session/appMode'
import { initAuth } from '@/supabase/useAuth'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, _from, next) => {
  const isGuest = getAppModeRef().value === 'guest'

  // ★ guest は「認証済み扱い」
  if (isGuest) {
    //if (to.name === 'Login') return next({ name: 'Dashboard' })
    return next()
  }

  // guest でない場合のみ Supabase セッション確認
  await initAuth()
  const { data: { session } } = await supabase.auth.getSession()

  if (to.meta.requiresAuth && !session) return next({ name: 'Login' })
  if ((to.name === 'Login' || to.name === 'Home') && session) return next({ name: 'Dashboard' })
  return next()
})

export default router
