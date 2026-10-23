import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Icônes PWA générées depuis le logo. Si logo.jpg / logo.png (photo) est ajouté, on remplacera la source.
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#2C3B8F' } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background: '#2C3B8F' } },
  },
  images: ['public/logo.svg'],
})
