import { CheckIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { updateDay, useDays } from '@/db/days'
import type { Day, Settings } from '@/db/types'
import { useHabitName } from '@/features/settings/useHabitName'
import { lastDays } from '@/lib/dates'
import { cn } from '@/lib/utils'

import { Section, subClass } from './Section'

/** Habitudes du jour à cocher, avec les 7 derniers jours en points. */
export function HabitsCard({ day, settings }: { day: Day; settings: Settings }) {
  const { t } = useTranslation()
  const habitName = useHabitName()
  const week = useDays(lastDays(day.id, 7))
  const habits = settings.habits
  if (!habits.length) return null
  const done = habits.filter((h) => day.habits[h.id]).length

  return (
    <Section
      title={t('today.habits')}
      aside={<span className={`${subClass} tabular`}>{`${done}/${habits.length}`}</span>}
    >
      <ul className="overflow-hidden rounded-xl bg-card shadow-card">
        {habits.map((h) => {
          const on = !!day.habits[h.id]
          return (
            <li key={h.id} className="border-t border-line first:border-t-0">
              <button
                type="button"
                aria-pressed={on}
                onClick={() => void updateDay(day.id, (d) => ({ habits: { ...d.habits, [h.id]: !d.habits[h.id] } }))}
                className="flex min-h-12 w-full min-w-0 items-center gap-3 px-3.5 py-3 text-start"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'grid size-6 flex-none place-items-center rounded-[8px] border-2 text-primary-foreground',
                    on ? 'border-ok bg-ok' : 'border-line',
                  )}
                >
                  <CheckIcon className={cn('size-3.5', !on && 'opacity-0')} strokeWidth={3} />
                </span>
                <span className="min-w-0 flex-1 text-[0.90625rem] font-semibold [overflow-wrap:anywhere]">
                  {habitName(h)}
                </span>
                <span
                  className="flex flex-none gap-[3px]"
                  role="img"
                  aria-label={t('today.last7', { n: (week ?? []).filter((d) => d.habits[h.id]).length })}
                >
                  {(week ?? []).map((d: Day) => (
                    <i
                      key={d.id}
                      className={cn('size-[7px] rounded-full', d.habits[h.id] ? 'bg-ok' : 'bg-surface-2')}
                    />
                  ))}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
