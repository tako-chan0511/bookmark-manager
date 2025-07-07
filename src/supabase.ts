// src/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 環境変数が設定されているか確認するログ (開発時のみ)
if (import.meta.env.DEV) {
  if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_PROJECT_URL') {
    console.error('VITE_SUPABASE_URL is not set or is default in .env file.');
  }
  if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
    console.error('VITE_SUPABASE_ANON_KEY is not set or is default in .env file.');
  }
}