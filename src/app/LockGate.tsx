import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Skeleton } from '@/components/ui/skeleton'
import { db } from '@/db/db'
import { cryptoAvailable, openDatabase, type OpenResult } from '@/db/open'
import { useSettings } from '@/db/settings'
import { CreatePin } from '@/features/security/CreatePin'
import { LockLayout } from '@/features/security/LockLayout'
import { Onboarding } from '@/features/security/Onboarding'
import { getSecurity, markHidden, shouldRelock } from '@/features/security/pin'
import { UnlockScreen } from '@/features/security/UnlockScreen'
import { displayName } from '@/lib/names'

import { usePreferences } from './PreferencesProvider'
import { StartupProblem } from './StartupProblem'

/**
 * Verrou de l'app : tant que le code n'est pas bon, seul l'écran du verrou existe (l'app n'est pas montée).
 * Redemande le code au démarrage, et au retour au premier plan après le délai choisi.
 */
export function LockGate({ children }: { children: ReactNode }) {
  const [opened, setOpened] = useState<OpenResult | null>(null)
  useEffect(() => openDatabase(setOpened), [])

  if (!cryptoAvailable()) return <StartupProblem issue="insecure" />
  if (opened?.status === 'blocked' || opened?.status === 'slow') return <StartupProblem issue={opened.status} />
  if (opened?.status === 'error') return <StartupProblem issue="error" detail={opened.message} />
  if (opened?.status !== 'ok') return <Loading />
  return <Gate>{children}</Gate>
}

function Loading() {
  return (
    <LockLayout>
      <Skeleton className="h-64 w-full max-w-xs rounded-xl" />
    </LockLayout>
  )
}

function Gate({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const { lang } = usePreferences()
  const settings = useSettings()
  const hasPin = useLiveQuery(async () => !!(await db.security.get('device'))?.hash)
  const [unlocked, setUnlocked] = useState(false)
  // Décidé une fois au chargement : l'inscription reste affichée jusqu'à son message de bienvenue,
  // même quand les réglages et le code sont déjà enregistrés.
  const [onboarding, setOnboarding] = useState<boolean | null>(null)
  if (settings && onboarding === null) setOnboarding(!settings.onboarded)

  useEffect(() => {
    const onVisibility = async () => {
      if (document.visibilityState === 'hidden') {
        await markHidden()
        return
      }
      if (shouldRelock(await getSecurity(), Date.now())) setUnlocked(false)
    }
    const handler = () => void onVisibility()
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [])

  if (!settings || hasPin === undefined || onboarding === null) return <Loading />

  // Premier lancement : inscription en 3 étapes.
  if (onboarding && !unlocked) {
    return (
      <Onboarding
        settings={settings}
        onDone={() => {
          setOnboarding(false)
          setUnlocked(true)
        }}
      />
    )
  }

  // Déjà inscrit mais sans code (ancienne version, import, nouvel appareil) : on en crée un avant tout.
  if (!hasPin) {
    return (
      <LockLayout>
        <section aria-labelledby="create-pin" className="flex w-full flex-col items-center gap-4">
          <h1 id="create-pin" className="text-center font-display text-2xl font-semibold rtl:font-bold">
            {t('lock.createTitle')}
          </h1>
          <p className="max-w-[34ch] text-center text-ink-2">{t('lock.createText')}</p>
          <CreatePin onDone={() => setUnlocked(true)} />
        </section>
      </LockLayout>
    )
  }

  if (!unlocked) return <UnlockScreen name={displayName(settings, lang)} onUnlock={() => setUnlocked(true)} />

  return children
}
