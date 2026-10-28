import { Outlet } from '@tanstack/react-router'
import { lazy, Suspense, useCallback, useState } from 'react'

import { AppHeader } from '@/components/AppHeader'
import { PwaPrompt } from '@/components/PwaPrompt'
import { TabBar } from '@/components/TabBar'
import { Skeleton } from '@/components/ui/skeleton'
import { Toaster } from '@/components/ui/sonner'
import { useSettings } from '@/db/settings'
import { useRecurringAutoAdd } from '@/features/budget/useRecurringAutoAdd'
import { whenIdle } from '@/lib/idle'
import { usePushBridge } from '@/push/usePushBridge'

import { OpenSettingsContext } from './settings-drawer'

// Le volet Réglages (formulaires, compte, sauvegarde) n'est téléchargé qu'au besoin.
const loadSettings = () => import('@/components/SettingsDrawer')
const SettingsDrawer = lazy(() => loadSettings().then((m) => ({ default: m.SettingsDrawer })))
whenIdle(() => void loadSettings(), 5000)

export function AppLayout() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsUsed, setSettingsUsed] = useState(false)
  const settings = useSettings()
  useRecurringAutoAdd(settings)
  usePushBridge(settings)

  const openSettings = useCallback(() => {
    setSettingsUsed(true)
    setSettingsOpen(true)
  }, [])

  return (
    <OpenSettingsContext.Provider value={openSettings}>
      <div className="mx-auto max-w-[560px] ps-[max(16px,env(safe-area-inset-left,0px))] pe-[max(16px,env(safe-area-inset-right,0px))] pb-[calc(100px+env(safe-area-inset-bottom,0px))]">
        <AppHeader onOpenSettings={openSettings} />
        <main className="flex flex-col gap-[22px]">
          {settings ? <Outlet /> : <Skeleton className="h-40 w-full rounded-xl" />}
        </main>
      </div>
      <TabBar />
      {settingsUsed && (
        <Suspense fallback={null}>
          <SettingsDrawer open={settingsOpen} onOpenChange={setSettingsOpen} />
        </Suspense>
      )}
      <PwaPrompt />
      <Toaster />
    </OpenSettingsContext.Provider>
  )
}
