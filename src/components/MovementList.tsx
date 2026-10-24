import { XIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/** Liste de remboursements ou de versements, la plus récente en haut, avec suppression. */
export function MovementList({
  items,
  empty,
  render,
  removeLabel,
  onRemove,
}: {
  items: { amount: number; date: string }[]
  empty: string
  render: (m: { amount: number; date: string }) => { amount: ReactNode; date: string; tone?: 'pos' | 'neg' }
  removeLabel: (m: { amount: number; date: string }) => string
  onRemove: (index: number) => void
}) {
  if (!items.length) {
    return <p className="rounded-xl bg-card px-3.5 py-3 text-[0.8125rem] text-muted-foreground shadow-card">{empty}</p>
  }
  return (
    <ul className="overflow-hidden rounded-xl bg-card shadow-card">
      {items
        .map((m, i) => ({ m, i }))
        .reverse()
        .map(({ m, i }) => {
          const r = render(m)
          return (
            <li key={i} className="flex items-center gap-3 border-t border-line px-3.5 py-2 first:border-t-0">
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    'tabular block font-semibold',
                    r.tone === 'pos' && 'text-ok',
                    r.tone === 'neg' && 'text-bad',
                  )}
                >
                  {r.amount}
                </span>
                <time dateTime={m.date} className="block text-[0.78125rem] text-muted-foreground">
                  {r.date}
                </time>
              </span>
              <button
                type="button"
                aria-label={removeLabel(m)}
                onClick={() => onRemove(i)}
                className="grid size-11 flex-none place-items-center rounded-[12px] text-ink-3"
              >
                <XIcon className="size-5" aria-hidden="true" />
              </button>
            </li>
          )
        })}
    </ul>
  )
}
