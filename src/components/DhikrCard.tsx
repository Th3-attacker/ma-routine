import { forwardRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import type { Dhikr } from '@/features/athkar/data'
import { cn } from '@/lib/utils'

import { ProgressRing } from './ProgressRing'

/**
 * Carte d'un dhikr : un toucher = +1 ; verte quand le compte est atteint.
 * « audio » : bouton d'écoute posé dans le coin bas de la carte (à côté du bouton, pas dedans).
 */
export const DhikrCard = forwardRef<
  HTMLButtonElement,
  { item: Dhikr; count: number; onTap: () => void; audio?: ReactNode }
>(function DhikrCard({ item, count, onTap, audio }, ref) {
  const { t, i18n } = useTranslation()
  const done = count >= item.n
  const c = Math.min(count, item.n)
  const note = i18n.language === 'ar' ? item.an : item.fr

  const card = (
    <button
      ref={ref}
      type="button"
      onClick={onTap}
      data-done={done || undefined}
      aria-label={t('athkar.repetition', { c, n: item.n })}
      className={cn(
        'flex w-full flex-col gap-2.5 rounded-[18px] border border-line bg-surface p-4 text-start transition-colors',
        done && 'border-transparent bg-ok-soft',
      )}
    >
      <span
        lang="ar"
        dir="rtl"
        className={cn(
          'block font-quran text-[1.375rem] leading-[2.05] whitespace-pre-line',
          done ? 'text-ink-2' : 'text-ink',
        )}
      >
        {item.ar}
      </span>
      {note && <span className="block text-[0.8125rem] text-ink-2">{note}</span>}
      <span className="flex items-center justify-between gap-2.5">
        <span className={cn('text-xs font-semibold text-muted-foreground', audio && 'ps-12')}>
          {item.n > 1 ? t('athkar.times', { n: item.n }) : t('athkar.once')}
        </span>
        <span
          className={cn(
            'tabular flex flex-none items-center gap-2 text-[0.8125rem] font-extrabold',
            done ? 'text-ok' : 'text-primary',
          )}
          dir="ltr"
        >
          {c} / {item.n}
          <ProgressRing
            value={c / item.n}
            r={15}
            stroke={4}
            className="size-[38px]"
            fillClass={done ? 'stroke-ok' : 'stroke-primary'}
          />
        </span>
      </span>
    </button>
  )
  if (!audio) return card
  return (
    <div className="relative">
      {card}
      <div className="absolute start-3 bottom-3">{audio}</div>
    </div>
  )
})
