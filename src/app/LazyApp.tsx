import { lazy, Suspense } from 'react'

import { whenIdle } from '@/lib/idle'

// Le reste de l'app se télécharge pendant que l'écran de bienvenue ou du code s'affiche (dès que le
// téléphone est libre, pour ne pas ralentir ce premier écran).
const loadApp = () => import('./AppRouter')
const AppRouter = lazy(loadApp)
whenIdle(() => void loadApp())

export function LazyApp() {
  return (
    <Suspense fallback={null}>
      <AppRouter />
    </Suspense>
  )
}
