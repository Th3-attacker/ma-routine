import { createHashHistory, createRootRoute, createRoute, createRouter } from '@tanstack/react-router'

import { AthkarPage } from '@/routes/athkar'
import { BudgetPage } from '@/routes/budget'
import { PrayerPage } from '@/routes/priere'
import { ProjectsPage } from '@/routes/projets'
import { TodayPage } from '@/routes/aujourdhui'

import { AppLayout } from './AppLayout'

const rootRoute = createRootRoute({ component: AppLayout })

const routeTree = rootRoute.addChildren([
  createRoute({ getParentRoute: () => rootRoute, path: '/', component: TodayPage }),
  createRoute({ getParentRoute: () => rootRoute, path: '/priere', component: PrayerPage }),
  createRoute({ getParentRoute: () => rootRoute, path: '/athkar', component: AthkarPage }),
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
