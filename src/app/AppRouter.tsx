import { RouterProvider } from '@tanstack/react-router'

import { router } from './router'

/** L'app elle-même (écrans, réglages…), chargée à part : l'écran du code s'affiche sans l'attendre. */
export default function AppRouter() {
  return <RouterProvider router={router} />
}
