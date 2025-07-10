// src/supabase/useAuth.ts
import { ref } from 'vue'
import { supabase } from './supabase'
import type { User, Session } from '@supabase/supabase-js'
import router from '@/router'           // ルーターを直接インポート

const user = ref<User | null>(null)

// 初回セッションを安全に取得
supabase.auth.getSession().then((res) => {
  const session: Session | null = res.data?.session ?? null
  user.value = session?.user ?? null
})

// 認証状態の変化を監視
supabase.auth.onAuthStateChange((_event, session) => {
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

  // サインアウト
  const signOut = async () => {
    // 1) Supabase 側セッションを切断
    await supabase.auth.signOut()

    // 2) ローカルの sandbox フラグをクリア
    localStorage.removeItem('sandbox')

    // 3) ユーザー情報もリセット
    user.value = null

    // 4) ログイン画面へリダイレクト
    router.push({ name: 'Login' })
  }

  return { user, signIn, signUp, signOut }
}
