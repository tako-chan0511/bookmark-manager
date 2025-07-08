// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    // ← @rollup/plugin-commonjs はここから削除します
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js'],
  },
  build: {
    commonjsOptions: {
      // node_modules 内をまとめて変換
      include: [/node_modules/],
      // CJS の module.exports を ESM の default export として扱う
      requireReturnsDefault: 'auto',
      // ESM/CJS 混在モジュールも変換対象に
      transformMixedEsModules: true,
    },
  },
  server: {
    port: 3000,
  },
})
