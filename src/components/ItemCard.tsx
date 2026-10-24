import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type BadgeTone = 'neutral' | 'active' | 'done' | 'late'

const TONE: Record<BadgeTone, string> = {
  neutral: 'bg-surface-2 text-ink-2',
  active: 'bg-primary-soft text-primary',
  done: 'bg-ok-soft text-ok',
  late: 'bg-bad-soft text-bad',
}

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={cn(
        'rounded-full px-2 py-1 text-[0.6875rem] font-extrabold tracking-[0.05em] whitespace-nowrap uppercase rtl:text-xs rtl:tracking-normal rtl:normal-case',
        TONE[tone],
      )}
    >
      {children}
    </span>
  )
}

/**
 * Carte d'une dette, d'un objectif ou d'un projet (`.pcard` de la maquette) : un bouton qui ouvre le détail.
 * `color` est un token comme '--c7'.
 */
export function ItemCard({
  color,
  title,
  badge,
  note,
  progress,
  meta,
  onOpen,
}: {
  color: string
  title: string
  badge?: ReactNode
  note?: string
  progress: number
  meta: [ReactNode, ReactNode]
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full flex-col gap-2.5 rounded-xl bg-card p-4 text-start shadow-card"
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <i aria-hidden="true" className="size-3 flex-none rounded-[4px]" style={{ background: `var(${color})` }} />
        <b className="min-w-0 flex-1 text-base font-extrabold [overflow-wrap:anywhere]">{title}</b>
        {badge}
      </span>
      {note && <span className="text-[0.8125rem] [overflow-wrap:anywhere] text-ink-2 italic">{note}</span>}
      <span className="block h-2 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
        <i
          className="block h-full rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%`, background: `var(${color})` }}
        />
      </span>
      <span className="tabular flex flex-wrap justify-between gap-x-2.5 gap-y-1 text-[0.78125rem] font-semibold text-muted-foreground">
        <span>{meta[0]}</span>
        <span>{meta[1]}</span>
      </span>
    </button>
  )
}

/** Deux totaux côte à côte (`.tot2`). */
export function TotalsPair({ items }: { items: [string, ReactNode, string?][] }) {
  return (
    <dl className="grid grid-cols-2 gap-2.5">
      {items.map(([label, value, color]) => (
        <div key={label} className="min-w-0 rounded-lg bg-card p-3.5 shadow-card">
          <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
          <dd className={cn('tabular font-display text-[1.375rem] font-semibold [overflow-wrap:anywhere]', color)}>
            {value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/** État vide (bordure en pointillés). */
export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col items-start gap-2.5 rounded-xl border-[1.5px] border-dashed border-line p-[18px] text-sm text-ink-2">
      <h3 className="text-[0.9375rem] font-bold text-foreground">{title}</h3>
      <p>{children}</p>
    </section>
  )
}
