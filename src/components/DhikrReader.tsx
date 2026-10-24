import { ChevronLeftIcon, ChevronRightIcon, XIcon } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import type { AthkarSet, Day } from '@/db/types'
import { firstUndone, tapDhikr } from '@/features/athkar/actions'
import { setReaderOpen } from '@/features/call/speech'
import { ATHKAR } from '@/features/athkar/data'
import { athkarProgress } from '@/features/athkar/progress'
import { vibrate } from '@/lib/haptics'
import { useWakeLock } from '@/lib/wake-lock'
import { cn } from '@/lib/utils'

const iconBtn =
  'grid size-11 flex-none place-items-center rounded-[12px] border border-line bg-surface text-ink-2 disabled:opacity-40'

/**
 * Lecture plein écran : un dhikr à la fois. Toucher le texte (ou Espace / Entrée) compte ; Échap ferme.
 * Passe tout seul au dhikr suivant non terminé, sauf si l'utilisateur a changé de dhikr entre-temps.
 */
export function DhikrReader({
  set,
  day,
  open,
  onClose,
}: {
  set: AthkarSet
  day: Day
  open: boolean
  onClose: () => void
}) {
  useWakeLock(open)
  // Pas d'appel à voix haute pendant la lecture plein écran.
  useEffect(() => {
    setReaderOpen(open)
    return () => setReaderOpen(false)
  }, [open])
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Content className="fixed inset-0 z-[70] bg-background outline-none">
          {/* Le contenu est recréé à chaque ouverture : il repart du premier dhikr non terminé. */}
          <ReaderBody set={set} day={day} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function ReaderBody({ set, day }: { set: AthkarSet; day: Day }) {
  const { t, i18n } = useTranslation()
  const ar = i18n.language === 'ar'
  const series = ATHKAR[set]
  const counts = day.athkar[set]
  const [index, setIndex] = useState(() => firstUndone(set, counts))

  const item = series.items[index]
  const count = Math.min(counts?.[index] ?? 0, item.n)
  const progress = athkarProgress(set, day)
  const note = ar ? item.an : item.fr

  async function tap() {
    const at = index
    if ((counts?.[at] ?? 0) >= item.n) {
      if (at < series.items.length - 1) setIndex(at + 1)
      return
    }
    const r = await tapDhikr(day.id, set, at)
    if (!r) return
    vibrate(r.done ? 35 : 8)
    if (r.seriesDone) toast(t('athkar.seriesDone'))
    else if (r.done) {
      // Passage automatique, sauf si l'utilisateur a changé de dhikr entre-temps.
      setTimeout(() => setIndex((cur) => (cur === at ? firstUndone(set, { ...counts, [at]: r.count }, at) : cur)), 450)
    }
  }

  return (
    <div
      className="flex h-full flex-col ps-[max(16px,env(safe-area-inset-left,0px))] pe-[max(16px,env(safe-area-inset-right,0px))] pt-[calc(10px+env(safe-area-inset-top,0px))] pb-[calc(16px+env(safe-area-inset-bottom,0px))]"
      onKeyDown={(e) => {
        if ((e.key === ' ' || e.key === 'Enter') && !(e.target as HTMLElement).closest('button')) {
          e.preventDefault()
          void tap()
        }
      }}
    >
      <header className="flex items-center justify-between gap-2.5">
        <Dialog.Close className={iconBtn} aria-label={t('header.close')}>
          <XIcon className="size-5" aria-hidden="true" />
        </Dialog.Close>
        <Dialog.Title className="flex-1 text-center font-display text-lg font-semibold rtl:font-bold">
          {ar ? series.ar : t(`athkar.sets.${set}`)}
        </Dialog.Title>
        <span className="tabular min-w-[38px] text-end text-[0.8125rem] font-bold text-muted-foreground">
          {progress.done}/{progress.total}
        </span>
      </header>
      <Dialog.Description className="sr-only">{t('reader.hint')}</Dialog.Description>

      <div
        role="button"
        tabIndex={0}
        aria-label={`${t('reader.count')} · ${t('athkar.repetition', { c: count, n: item.n })}`}
        onClick={() => void tap()}
        className="flex min-h-0 flex-1 cursor-pointer flex-col justify-center gap-4 overflow-auto py-4 text-center select-none"
      >
        <p lang="ar" dir="rtl" className="font-quran text-[1.875rem] leading-[2.1] whitespace-pre-line">
          {item.ar}
        </p>
        {note && <p className="mx-auto max-w-[52ch] text-sm text-ink-2">{note}</p>}
      </div>

      <ol
        className="flex flex-wrap justify-center gap-1"
        aria-label={t('reader.position', { i: index + 1, n: series.items.length })}
      >
        {series.items.map((it, j) => (
          <li
            key={j}
            className={cn(
              'size-[7px] rounded-full',
              j === index ? 'bg-gold' : (counts?.[j] ?? 0) >= it.n ? 'bg-ok' : 'bg-surface-2',
            )}
          />
        ))}
      </ol>

      <footer className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          className={iconBtn}
          aria-label={t('reader.prev')}
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          <ChevronLeftIcon className="rtl-flip size-5" aria-hidden="true" />
        </button>
        <div className="text-center" aria-live="polite">
          <p className="tabular font-display text-[1.875rem] font-semibold" dir="ltr">
            {count} / {item.n}
          </p>
          <p className="text-[0.8125rem] text-muted-foreground">
            {progress.done === progress.total ? t('reader.done') : t('reader.hint')}
          </p>
        </div>
        <button
          type="button"
          className={iconBtn}
          aria-label={t('reader.next')}
          disabled={index >= series.items.length - 1}
          onClick={() => setIndex((i) => Math.min(series.items.length - 1, i + 1))}
        >
          <ChevronRightIcon className="rtl-flip size-5" aria-hidden="true" />
        </button>
      </footer>
    </div>
  )
}
