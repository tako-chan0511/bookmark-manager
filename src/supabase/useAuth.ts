// src/supabase/useAuth.ts
import { ref } from 'vue'
import { supabase } from './supabase'
import type { User, Session } from '@supabase/supabase-js'

const user = ref<User | null>(null)

// 初回セッションを安全に取得
supabase.auth.getSession().then((res) => {
  // res も res.data も nullかもしれないので optional chaining
  const session: Session | null = res.data?.session ?? null
  user.value = session?.user ?? null
})

// 認証状態の変化を監視
supabase.auth.onAuthStateChange((_event, session) => {
  // v2 では第二引数が Session | null
  const s: Session | null = session ?? null
  user.value = s?.user ?? null
})

export function useAuth() {
  // メール／パスワード認証
  const signIn = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password })

  // メールリンク認証などなら signInWithOtp などに置き換え
  const signUp = (email: string, password: string) =>
    supabase.auth.signUp({ email, password })

  const signOut = async () => {
    await supabase.auth.signOut()
    user.value = null
  }

  return { user, signIn, signUp, signOut }
}
