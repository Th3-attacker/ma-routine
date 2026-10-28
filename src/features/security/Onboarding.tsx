import { lazy, Suspense, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { usePreferences } from '@/app/PreferencesProvider'
import { ChipGroup } from '@/components/ChipGroup'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { updateSettings } from '@/db/settings'
import type { Settings } from '@/db/types'
import { whenIdle } from '@/lib/idle'
import { displayName } from '@/lib/names'

import { LockLayout } from './LockLayout'

const loadProfile = () => import('./OnboardingProfile')
const OnboardingProfile = lazy(loadProfile)

const btn = 'h-12 w-full rounded-[14px] text-[0.9375rem] font-bold'

export function Onboarding({ settings, onDone }: { settings: Settings; onDone: () => void }) {
  const { t } = useTranslation()
  const { lang, setLang } = usePreferences()
  const [step, setStep] = useState<1 | 2 | 'done'>(1)
  // Le formulaire de l'étape 2 se télécharge pendant qu'on lit la bienvenue.
  useEffect(() => whenIdle(() => void loadProfile()), [])

  const languageChoice = (
    <ChipGroup
      label={t('lock.languageLabel')}
      value={lang}
      onChange={setLang}
      options={[
        { value: 'fr', label: 'FR', lang: 'fr' },
        { value: 'ar', label: 'ع', lang: 'ar' },
      ]}
    />
  )

  if (step === 'done') {
    return (
      <LockLayout>
        <h1 className="text-center font-display text-[1.75rem] font-semibold rtl:font-bold" role="status">
          {t('lock.welcomeName', { name: displayName(settings) })}
        </h1>
      </LockLayout>
    )
  }

  return (
    <LockLayout top={step === 1 ? languageChoice : undefined}>
      <p className="text-[0.8125rem] font-semibold text-muted-foreground">{t('lock.step', { n: step })}</p>

      {step === 1 && (
        <section aria-labelledby="ob-welcome" className="flex w-full flex-col items-center gap-5 text-center">
          <h1 id="ob-welcome" className="font-display text-[1.75rem] font-semibold rtl:font-bold">
            {t('lock.welcomeTitle')}
          </h1>
          <p className="max-w-[36ch] text-ink-2">{t('lock.welcomeText')}</p>
          <Button className={btn} onClick={() => setStep(2)}>
            {t('lock.next')}
          </Button>
        </section>
      )}

      {step === 2 && (
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
          <OnboardingProfile
            settings={settings}
            onBack={() => setStep(1)}
            onNext={async () => {
              await updateSettings({ onboarded: true })
              setStep('done')
              setTimeout(onDone, 1600)
            }}
          />
        </Suspense>
      )}
    </LockLayout>
  )
}
