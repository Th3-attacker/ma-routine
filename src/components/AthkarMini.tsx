import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import type { Day } from '@/db/types'
import { ATHKAR } from '@/features/athkar/data'
import { athkarProgress } from '@/features/athkar/progress'

import { Bar, linkClass, Section } from './Section'

export function AthkarMini({ day }: { day: Day }) {
  const { t, i18n } = useTranslation()
  const ar = i18n.language === 'ar'
  return (
    <Section
      title={t('today.athkarTitle')}
      aside={
        <Link to="/athkar" className={linkClass}>
          {t('today.open')}
        </Link>
      }
    >
      <ul className="grid grid-cols-2 gap-2.5">
        {(['matin', 'soir'] as const).map((set) => {
          const p = athkarProgress(set, day)
          return (
            <li key={set} className="min-w-0">
              <Link
                to="/athkar"
                search={{ set }}
                className="flex h-full min-w-0 flex-col gap-2 rounded-lg bg-card p-3.5 shadow-card"
              >
                <span className="flex items-baseline justify-between gap-2 text-sm font-bold">
                  {t(set === 'matin' ? 'athkar.miniMatin' : 'athkar.miniSoir')}
                  <small className="tabular text-xs font-semibold text-muted-foreground">
                    {p.done}/{p.total}
                  </small>
                </span>
                {!ar && (
                  <span lang="ar" className="font-quran text-[1.0625rem] leading-snug text-ink-2">
                    {ATHKAR[set].ar}
                  </span>
                )}
                <Bar value={p.done / p.total} fill="bg-gold" />
              </Link>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
