// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import commonjs from '@rollup/plugin-commonjs'

export default defineConfig({
  // ★修正: base: '.' を base: './' に変更★
  base: './', // 開発時もデプロイ時も相対パスを基準にする
  
  plugins: [
    vue(),
    commonjs({
      include: /node_modules/,
    }),
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  
  optimizeDeps: {
    include: [
      'leaflet', 
      '@supabase/supabase-js', // ★追加: supabase-js を pre-bundle 対象に含める★
      'object-assign', 
      'geojson-equality',
      'earcut',
      'rbush',
      'deep-equal',
    ],
  },
  
  build: {
    commonjsOptions: {
      include: /node_modules/,
      transformMixedEsModules: true,
    },
  },
  
  server: {
    port: 3000,
    proxy: {
      '/api/geocode': {
        target: 'https://us1.locationiq.com',
        changeOrigin: true,
        rewrite: (path) => {
          const apiKey = process.env.VITE_LOCATIONIQ_API_KEY; 
          if (!apiKey) {
            console.error("VITE_LOCATIONIQ_API_KEY is not set in .env for proxy!");
            return '/v1/search.php?key=MISSING_API_KEY&error=true';
          }
          const queryParams = path.split('?')[1] ? '?' + path.split('?')[1] : '';
          return `/v1/search.php?key=${apiKey}&${queryParams.replace(/key=[^&]*/, '').replace(/&&/, '&').replace(/^\?&/, '?')}`;
        },
        configure: (proxy, options) => {
          options.headers = {
            'User-Agent': 'WeatherApp/1.0 (harakeisuke7@gmail.com)', 
          };
        },
      },
    },
  },
})