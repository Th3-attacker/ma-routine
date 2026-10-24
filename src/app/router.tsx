import { createHashHistory, createRootRoute, createRoute, createRouter } from '@tanstack/react-router'

import { AthkarPage } from '@/routes/athkar'
import { BudgetPage } from '@/routes/budget'
import { PrayerPage } from '@/routes/priere'
import { ProjectsPage } from '@/routes/projets'
import { TodayPage } from '@/routes/aujourdhui'

import { ATHKAR_SETS } from '@/db/types'

import { AppLayout } from './AppLayout'

export type AthkarTab = (typeof ATHKAR_SETS)[number] | 'tasbih'
const ATHKAR_TABS: readonly string[] = [...ATHKAR_SETS, 'tasbih']

const rootRoute = createRootRoute({ component: AppLayout })

const routeTree = rootRoute.addChildren([
  createRoute({ getParentRoute: () => rootRoute, path: '/', component: TodayPage }),
  createRoute({ getParentRoute: () => rootRoute, path: '/priere', component: PrayerPage }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/athkar',
    component: AthkarPage,
    // #/athkar?set=soir ouvre directement une série
    validateSearch: (s: Record<string, unknown>): { set?: AthkarTab } =>
      typeof s.set === 'string' && ATHKAR_TABS.includes(s.set) ? { set: s.set as AthkarTab } : {},
  }),
  createRoute({ getParentRoute: () => rootRoute, path: '/budget', component: BudgetPage }),
  createRoute({ getParentRoute: () => rootRoute, path: '/projets', component: ProjectsPage }),
])

// Historique en « hash » (#/priere) : GitHub Pages ne renvoie pas de 404 au rechargement.
export function createAppRouter(history = createHashHistory()) {
  return createRouter({ routeTree, history, scrollRestoration: true })
}

export const router = createAppRouter()

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
