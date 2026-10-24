import { Outlet } from '@tanstack/react-router'
import { useCallback, useState } from 'react'

import { AppHeader } from '@/components/AppHeader'
import { PwaPrompt } from '@/components/PwaPrompt'
import { SettingsDrawer } from '@/components/SettingsDrawer'
import { TabBar } from '@/components/TabBar'
import { Skeleton } from '@/components/ui/skeleton'
import { Toaster } from '@/components/ui/sonner'
import { useSettings } from '@/db/settings'
import { WelcomeScreen } from '@/features/settings/WelcomeScreen'

import { OpenSettingsContext } from './settings-drawer'

export function AppLayout() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settings = useSettings()

  const openSettings = useCallback(() => setSettingsOpen(true), [])

  return (
    <OpenSettingsContext.Provider value={openSettings}>
      <div className="mx-auto max-w-[560px] ps-[max(16px,env(safe-area-inset-left,0px))] pe-[max(16px,env(safe-area-inset-right,0px))] pb-[calc(100px+env(safe-area-inset-bottom,0px))]">
        <AppHeader onOpenSettings={openSettings} />
        <main className="flex flex-col gap-[22px]">
          {!settings ? (
            <Skeleton className="h-40 w-full rounded-xl" />
          ) : settings.onboarded ? (
            <Outlet />
          ) : (
            <WelcomeScreen settings={settings} />
          )}
        </main>
      </div>
      <TabBar />
      <SettingsDrawer open={settingsOpen} onOpenChange={setSettingsOpen} />
      <PwaPrompt />
      <Toaster />
    </OpenSettingsContext.Provider>
  )
}
