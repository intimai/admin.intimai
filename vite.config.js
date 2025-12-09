import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
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
        skipWaiting: true,
        navigateFallback: null, // Não usar fallback de navegação para evitar conflitos com SPA router se algo der errado
        runtimeCaching: [
            {
                urlPattern: /^https:\/\/.*\.supabase\.co\/.*$/,
                handler: 'NetworkOnly', // Força rede para chamadas do Supabase
            },
            {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
                handler: 'CacheFirst',
                options: {
                    cacheName: 'google-fonts-cache',
                    expiration: {
                        maxEntries: 10,
                        maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                    },
                    cacheableResponse: {
                        statuses: [0, 200]
                    }
                }
            }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      },
      manifest: {
        id: 'intimai-admin', // ID único para diferenciar do app principal
        name: 'IntimAI Admin',
        short_name: 'IntimAI Admin',
        description: 'Painel Administrativo do IntimAI',
        theme_color: '#09090b', // Cor de fundo escura do app
        background_color: '#09090b',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '354x354',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-512.png',
            sizes: '354x354',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: '/screenshot-app.png',
            sizes: '626x581', // Ajustado para o tamanho real reportado pelo navegador
            type: 'image/png',
            form_factor: 'wide',
            label: 'Painel Administrativo'
          },
          {
            src: '/screenshot-app.png',
            sizes: '626x581', // Ajustado para o tamanho real reportado pelo navegador
            type: 'image/png',
            label: 'Painel Administrativo Mobile'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})