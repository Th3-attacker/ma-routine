import { QueryClient } from '@tanstack/react-query'

// Local d'abord : les requêtes attendent le retour du réseau au lieu d'échouer, puis reprennent seules.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { networkMode: 'offlineFirst', staleTime: 60_000, refetchOnWindowFocus: true },
    mutations: { networkMode: 'offlineFirst' },
  },
})
