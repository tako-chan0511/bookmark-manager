// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
// import commonjs from '@rollup/plugin-commonjs' // ★削除: @rollup/plugin-commonjs は削除★
import commonjsPlugin from 'vite-plugin-commonjs' // ★追加: vite-plugin-commonjs をインポート★

export default defineConfig({
  base: './', // または '/' (デプロイ環境による)
  
  plugins: [
    vue(),
    // ★修正: @rollup/plugin-commonjs の代わりに vite-plugin-commonjs を使用★
    commonjsPlugin(), 
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    // mainFields は維持 (ESMを優先するため)
    mainFields: ['module', 'jsnext:main', 'jsnext', 'main'], 
  },
  
  optimizeDeps: {
    include: [
      'leaflet',
      '@supabase/supabase-js', 
      '@supabase/postgrest-js', // これも pre-bundle 対象に含める
      'object-assign', 
      'geojson-equality',
      'earcut',
      'rbush',
      'deep-equal',
    ],
  },
  
  build: {
    // commonjsOptions は vite-plugin-commonjs が管理するため、ここでは不要
    // commonjsOptions: { // ★削除: commonjsOptions は削除★
    //   include: /node_modules/,
    //   transformMixedEsModules: true,
    // },
    
    // rollupOptions は削除のままでOK
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