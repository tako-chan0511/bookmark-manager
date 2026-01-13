// src/supabase/useAuth.ts
import { ref } from 'vue'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export const user = ref<User | null>(null)
export const authReady = ref(false)

let initPromise: Promise<void> | null = null

export function initAuth(): Promise<void> {
  if (initPromise) return initPromise
  initPromise = (async () => {
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null
    authReady.value = true

    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
      authReady.value = true
    })
  })()
  return initPromise
}

export function useAuth() {
  initAuth()

  const signIn = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password })

  const signUp = (email: string, password: string) =>
    supabase.auth.signUp({ email, password })

  const signOut = async () => {
    await supabase.auth.signOut()
    user.value = null
  }

  return { user, authReady, signIn, signUp, signOut }
}
