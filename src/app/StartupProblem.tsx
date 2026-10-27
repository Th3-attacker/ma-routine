import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { LockLayout } from '@/features/security/LockLayout'

export type StartupIssue = 'blocked' | 'slow' | 'error' | 'insecure' | 'noStorage'

/** Écran affiché quand l'app ne peut pas démarrer, avec « Réessayer » et des détails à envoyer. */
export function StartupProblem({ issue, detail }: { issue: StartupIssue; detail?: string }) {
  const { t } = useTranslation()
  const details = [
    detail,
    `secure=${typeof isSecureContext === 'undefined' ? '?' : isSecureContext}`,
    `subtle=${typeof crypto !== 'undefined' && !!crypto.subtle}`,
    `idb=${typeof indexedDB !== 'undefined'}`,
    location.protocol,
    navigator.userAgent,
  ]
    .filter(Boolean)
    .join('\n')

  return (
    <LockLayout>
      <section
        aria-labelledby="startup-title"
        role="alert"
        className="flex w-full flex-col items-center gap-4 text-center"
      >
        <h1 id="startup-title" className="font-display text-xl font-semibold rtl:font-bold">
          {t(`startup.${issue}Title`)}
        </h1>
        <p className="max-w-[38ch] text-ink-2">{t(`startup.${issue}Body`)}</p>
        {issue !== 'insecure' && issue !== 'noStorage' && (
          <Button className="h-12 w-full max-w-xs rounded-[14px] font-bold" onClick={() => location.reload()}>
            {t('startup.retry')}
          </Button>
        )}
        <details className="w-full text-start">
          <summary className="min-h-11 cursor-pointer text-[0.8125rem] font-bold text-muted-foreground">
            {t('startup.details')}
          </summary>
          <pre dir="ltr" className="overflow-x-auto rounded-lg bg-surface-2 p-3 text-[0.6875rem] whitespace-pre-wrap">
            {details}
          </pre>
        </details>
      </section>
    </LockLayout>
  )
}
