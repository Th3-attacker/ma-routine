import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import type { DailyText } from '@/features/daily/verses'

import { cardClass } from './Section'

/** Verset ou hadith du jour : texte arabe, sens en français (masqué en arabe), source. */
export function VerseCard({ text }: { text: DailyText }) {
  const { t, i18n } = useTranslation()
  const id = useId()
  const ar = i18n.language === 'ar'
  return (
    <section aria-labelledby={id} className={`${cardClass} flex flex-col items-center gap-2 text-center`}>
      <h2
        id={id}
        className="text-[0.6875rem] font-bold tracking-[0.09em] text-gold uppercase rtl:text-[0.78125rem] rtl:tracking-normal rtl:normal-case"
      >
        {text.hadith ? t('today.hadithOfDay') : t('today.verseOfDay')}
      </h2>
      <figure className="flex flex-col items-center gap-2">
        <blockquote lang="ar" dir="rtl" className="font-quran text-[1.4375rem] leading-loose">
          {text.ar}
        </blockquote>
        {!ar && <p className="max-w-[46ch] text-[0.84375rem] text-ink-2">{text.fr}</p>}
        <figcaption className="text-[0.8125rem] text-muted-foreground">{ar ? text.refAr : text.refFr}</figcaption>
      </figure>
    </section>
  )
}
