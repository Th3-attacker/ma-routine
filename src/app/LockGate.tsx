import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState, type ReactNode } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { db } from '@/db/db'
import { cryptoAvailable, openDatabase, type OpenResult } from '@/db/open'
import { resetPrayerCalc, useSettings } from '@/db/settings'
import { LockLayout } from '@/features/security/LockLayout'
import { Onboarding } from '@/features/security/Onboarding'
import { getSecurity, markHidden, shouldRelock } from '@/features/security/pin'
import { UnlockScreen } from '@/features/security/UnlockScreen'
import { displayName } from '@/lib/names'
import { writeLocal } from '@/lib/storage'

import { usePreferences } from './PreferencesProvider'
import { StartupProblem } from './StartupProblem'

/**
 * Verrou de l'app : tant que le code n'est pas bon, seul l'écran du verrou existe (l'app n'est pas montée).
 * Redemande le code au démarrage, et au retour au premier plan après le délai choisi.
 */
export function LockGate({ children }: { children: ReactNode }) {
  const [opened, setOpened] = useState<OpenResult | null>(null)
  useEffect(() => openDatabase(setOpened), [])
  useEffect(() => {
    if (opened?.status === 'ok') void resetPrayerCalc()
  }, [opened?.status])

  if (!cryptoAvailable()) return <StartupProblem issue="insecure" />
  // Pas de base de données (Chrome ou Firefox sur iPhone avec l'adresse de test, navigation privée…)
  if (typeof indexedDB === 'undefined') return <StartupProblem issue="noStorage" />
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
  const { lang } = usePreferences()
  const settings = useSettings()
  const hasPin = useLiveQuery(async () => !!(await db.security.get('device'))?.hash)
  const [unlocked, setUnlocked] = useState(false)
  // Décidé une fois au chargement : l'inscription reste affichée jusqu'à son message de bienvenue,
  // même quand les réglages et le code sont déjà enregistrés.
  const [onboarding, setOnboarding] = useState<boolean | null>(null)
  if (settings && onboarding === null) setOnboarding(!settings.onboarded)
  // Sans code (facultatif, Réglages → Sécurité), l'app s'ouvre directement ; un code créé ensuite ne la
  // referme pas tout de suite, seulement au prochain lancement ou après le délai.
  if (hasPin === false && !unlocked) setUnlocked(true)
  // Pour l'écran pré-dessiné d'index.html (src/app/shell.ts) : bienvenue, écran du code, ou rien.
  useEffect(() => {
    if (settings?.onboarded) writeLocal('elhadj.onboarded', '1')
  }, [settings?.onboarded])
  useEffect(() => {
    if (hasPin !== undefined) writeLocal('elhadj.locked', hasPin ? '1' : '0')
  }, [hasPin])
  // Pour la salutation de l'écran d'ouverture (src/app/opening.ts), affichée avant le chargement de la base.
  useEffect(() => {
    if (settings?.name)
      writeLocal('elhadj.greet', JSON.stringify({ fr: settings.name, ar: settings.nameAr.trim() || settings.name }))
  }, [settings?.name, settings?.nameAr])

  useEffect(() => {
    const onVisibility = async () => {
      if (document.visibilityState === 'hidden') {
        await markHidden()
        return
      }
      const security = await getSecurity()
      if (security.hash && shouldRelock(security, Date.now())) setUnlocked(false)
    }
    const handler = () => void onVisibility()
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [])

  if (!settings || hasPin === undefined || onboarding === null) return <Loading />

  // Premier lancement : inscription en 2 étapes (bienvenue, prénom et lieu).
  if (onboarding) {
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

  if (!unlocked) return <UnlockScreen name={displayName(settings, lang)} onUnlock={() => setUnlocked(true)} />

  return children
}
