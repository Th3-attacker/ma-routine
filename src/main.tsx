import './app/fonts'
import './index.css'
import './i18n'

import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { LockGate } from './app/LockGate'
import { Providers } from './app/Providers'
import { router } from './app/router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <LockGate>
        <RouterProvider router={router} />
      </LockGate>
    </Providers>
  </StrictMode>,
)
