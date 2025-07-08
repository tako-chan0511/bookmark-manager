// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import commonjs from '@rollup/plugin-commonjs'

export default defineConfig({
  // 相対パスをベースにして静的アセットを参照
  base: './',

  plugins: [
    vue(),
    commonjs({ include: /node_modules/ }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  optimizeDeps: {
    include: [
      'leaflet',
      '@supabase/supabase-js',
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
          const apiKey = process.env.VITE_LOCATIONIQ_API_KEY
          if (!apiKey) {
            console.error('VITE_LOCATIONIQ_API_KEY is not set in .env!')
            return '/v1/search.php?key=MISSING_API_KEY&error=true'
          }
          const query = path.includes('?') ? path.substring(path.indexOf('?')) : ''
          const cleaned = query
            .replace(/\bkey=[^&]+(&|$)/, '$1')
            .replace(/&&/, '&')
            .replace(/\?&/, '?')
          return `/v1/search.php?key=${apiKey}${cleaned}`
        },
        configure: (proxy, options) => {
          options.headers = {
            'User-Agent': 'WeatherApp/1.0 (harakeisuke7@gmail.com)',
          }
        },
      },
    },
  },
})
