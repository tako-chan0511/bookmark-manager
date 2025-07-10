// vite.config.ts
import { fileURLToPath, URL } from 'node:url' //★
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa' //★


export default defineConfig({
  base: './',
  plugins: [
    vue(),
     VitePWA({
      registerType: 'autoUpdate', // 更新があった場合に自動でリロードする
      devOptions: {
        enabled: true // 開発モードでもPWAの動作確認を可能にする
      },
      manifest: {
        id: '/bookmark-manager/',
        name: 'ブックマーク管理アプリ', // アプリのフルネーム
        short_name: 'Bookmark-manager', // ホーム画面に表示される短い名前
        description: 'ブックマークを管理するアプリです。', // アプリの説明
        start_url: '.', // アプリ起動時のURL  →　★注意★　vercelの場合はここは'.'にする。
        display: 'standalone', // アドレスバーなどを表示しないネイティブアプリのような表示
        background_color: '#ffffff', // スプラッシュ画面の背景色
        theme_color: '#007acc',      // ツールバーの色
        icons: [
          {
            src: 'icon-192x192.png', // publicディレクトリからの相対パス
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png', // publicディレクトリからの相対パス
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })

    // ← @rollup/plugin-commonjs はここから削除します
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
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
