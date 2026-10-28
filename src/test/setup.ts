import 'fake-indexeddb/auto'
import '@testing-library/jest-dom/vitest'
import i18n, { i18nReady } from '@/i18n'

import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

await i18nReady
await i18n.loadLanguages(['fr', 'ar'])

afterEach(() => {
  cleanup()
  localStorage.clear()
})

// jsdom n'a pas matchMedia
if (typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}
