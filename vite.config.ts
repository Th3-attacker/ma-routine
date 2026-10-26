import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Nom du dépôt GitHub : l'app est servie sur https://<compte>.github.io/ma-routine/
const base = '/ma-routine/'

export default defineConfig(({ mode }) => ({
  base,
  plugins: [
    // « pnpm dev:phone » : HTTPS sur le Wi-Fi, pour tester sur un téléphone (le code à 4 chiffres a besoin d'une page sécurisée).
    mode === 'phone' && basicSsl(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      // Service worker écrit à la main (src/sw.ts) : précache + notifications d'adhan.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: { globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'] },
      includeAssets: ['favicon.ico', 'logo.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Sama Jàmm · سلامي',
        short_name: 'Sama Jàmm',
        description: 'Une vie organisée, un cœur apaisé. Prières, athkar, Coran, budget et projets au quotidien.',
        lang: 'fr',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F1F2F7',
        theme_color: '#2C3B8F',
        categories: ['lifestyle', 'productivity'],
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
}))
