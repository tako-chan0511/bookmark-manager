// src/supabase.ts
import { createClient } from '@supabase/supabase-js';

// 環境変数の読み込み（VITE_ プレフィックス必須）
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// 開発時に .env の設定漏れを検出
if (import.meta.env.DEV) {
  if (!supabaseUrl) {
    console.error('[Supabase] VITE_SUPABASE_URL が設定されていません');
  }
  if (!supabaseAnonKey) {
    console.error('[Supabase] VITE_SUPABASE_ANON_KEY が設定されていません');
  }
}

// Supabase クライアントの初期化
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    // セッション永続化などのオプション設定
    auth: {
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

export type SupabaseClient = typeof supabase;
