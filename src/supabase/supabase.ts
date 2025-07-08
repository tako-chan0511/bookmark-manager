// src/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl       = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey   = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      // リフレッシュトークンによる自動更新を止める
      autoRefreshToken: false,
      // セッションはローカルストレージに残す（そのまま）
      persistSession: false,
      // URL のハッシュからセッションを拾う機能を off にするなら
      detectSessionInUrl: false,
    }
  }
)
