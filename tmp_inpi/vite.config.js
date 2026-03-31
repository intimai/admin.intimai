import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true
      },
      devOptions: {
        enabled: true,
        type: 'module'
      },
      manifest: {
        id: '/',
        name: 'IntimAI',
        short_name: 'IntimAI',
        description: 'Automação de Intimações para Advogados',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        start_url: '/',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: '/screenshot-app.png',
            sizes: '626x581',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: '/screenshot-app.png',
            sizes: '626x581',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, './src'),
    },
  },
  define: {
    'import.meta.env.VITE_ENCRYPTION_KEY': JSON.stringify('8bff1e8c44575fc6ffe496cbb1e9d96b224e35e21e52e3a4aa5b6e0a4c2ad7a0')
  }
})






