import './app/fonts'
import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { ErrorBoundary } from './app/ErrorBoundary'
import { LazyApp } from './app/LazyApp'
import { LockGate } from './app/LockGate'
import { Providers } from './app/Providers'
import { i18nReady } from './i18n'

// Les textes de la langue choisie d'abord, pour ne jamais afficher de clé de traduction.
await i18nReady

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <ErrorBoundary>
        <LockGate>
          <LazyApp />
        </LockGate>
      </ErrorBoundary>
    </Providers>
  </StrictMode>,
)
