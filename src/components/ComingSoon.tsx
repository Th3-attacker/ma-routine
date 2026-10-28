import { useTranslation } from 'react-i18next'

/** État vide provisoire des écrans qui arrivent dans les prochaines phases. */
export function ComingSoon() {
  const { t } = useTranslation()
  return (
    <section
      aria-labelledby="soon-title"
      className="flex flex-col items-start gap-2.5 rounded-xl border-[1.5px] border-dashed border-line p-[18px] text-sm text-ink-2"
    >
      <h2 id="soon-title" className="text-[0.9375rem] font-bold text-foreground">
        {t('soon.title')}
      </h2>
      <p>{t('soon.body')}</p>
    </section>
  )
}
