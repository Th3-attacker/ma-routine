import { getRouteApi } from '@tanstack/react-router'
import { ExpandIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import type { AthkarTab } from '@/app/router'
import { DhikrCard } from '@/components/DhikrCard'
import { DhikrReader } from '@/components/DhikrReader'
import { Bar, subClass } from '@/components/Section'
import { TasbihPanel } from '@/components/TasbihPanel'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDay } from '@/db/days'
import { useSettings } from '@/db/settings'
import { ATHKAR_SETS, type AthkarSet, type Day, type Settings } from '@/db/types'
import { resetAthkar, tapDhikr } from '@/features/athkar/actions'
import { ATHKAR } from '@/features/athkar/data'
import { athkarProgress, defaultAthkarSet } from '@/features/athkar/progress'
import { useNow, useToday } from '@/features/prayer/useToday'
import { vibrate } from '@/lib/haptics'
import { prefersReducedMotion } from '@/lib/motion'

const route = getRouteApi('/athkar')
const TABS: readonly AthkarTab[] = [...ATHKAR_SETS, 'tasbih']

const tabClass =
  'h-11 flex-none rounded-full border border-line bg-surface px-3.5 text-[0.8125rem] font-bold text-ink-2 shadow-none after:hidden data-active:border-primary data-active:bg-primary data-active:text-primary-foreground data-active:shadow-none dark:text-ink-2 dark:data-active:border-primary dark:data-active:bg-primary dark:data-active:text-primary-foreground'

export function AthkarPage() {
  const settings = useSettings()
  if (!settings) return <Skeleton className="h-40 w-full rounded-xl" />
  return <Athkar settings={settings} />
}

function Athkar({ settings }: { settings: Settings }) {
  const { t } = useTranslation()
  const navigate = route.useNavigate()
  const search = route.useSearch()
  const now = useNow()
  const { key, today } = useToday(settings, now)
  const day = useDay(key)
  // Série ouverte par défaut selon l'heure, choisie une fois à l'ouverture de l'écran.
  const [fallback] = useState(() => defaultAthkarSet(now, today))
  const tab: AthkarTab = search.set ?? fallback

  return (
    <>
      <h1 className="sr-only">{t('tabs.athkar')}</h1>
      <Tabs
        value={tab}
        onValueChange={(v) => void navigate({ to: '/athkar', search: { set: v as AthkarTab }, replace: true })}
      >
        <TabsList
          aria-label={t('athkar.tabsLabel')}
          className="h-auto w-full flex-wrap justify-start gap-1.5 bg-transparent p-0 group-data-horizontal/tabs:h-auto"
        >
          {TABS.map((s) => (
            <TabsTrigger key={s} value={s} className={tabClass}>
              {t(`athkar.sets.${s}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        {day ? (
          TABS.map((s) => (
            <TabsContent key={s} value={s} className="mt-[22px] text-base">
              {s === 'tasbih' ? <TasbihPanel day={day} /> : <Series set={s} day={day} />}
            </TabsContent>
          ))
        ) : (
          <Skeleton className="mt-[22px] h-40 w-full rounded-xl" />
        )}
      </Tabs>
    </>
  )
}

function Series({ set, day }: { set: AthkarSet; day: Day }) {
  const { t, i18n } = useTranslation()
  const ar = i18n.language === 'ar'
  const series = ATHKAR[set]
  const progress = athkarProgress(set, day)
  const [reading, setReading] = useState(false)
  const cards = useRef<(HTMLButtonElement | null)[]>([])
  const pendingScroll = useRef<number | null>(null)

  // Après un dhikr terminé, on fait défiler jusqu'à la carte suivante non terminée.
  useEffect(() => {
    const i = pendingScroll.current
    if (i === null) return
    pendingScroll.current = null
    const next = series.items.findIndex((it, j) => j > i && (day.athkar[set]?.[j] ?? 0) < it.n)
    if (next >= 0) {
      setTimeout(
        () =>
          cards.current[next]?.scrollIntoView({
            behavior: prefersReducedMotion() ? 'auto' : 'smooth',
            block: 'center',
          }),
        180,
      )
    }
  }, [day, series, set])

  async function tap(i: number) {
    const r = await tapDhikr(day.id, set, i)
    if (!r) return
    vibrate(r.done ? 35 : 8)
    if (r.seriesDone) toast(t('athkar.seriesDone'))
    else if (r.done) pendingScroll.current = i
  }

  return (
    <section aria-labelledby={`athkar-${set}`} className="flex flex-col gap-2.5">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2
            id={`athkar-${set}`}
            className="flex flex-wrap items-baseline gap-2.5 font-display text-[1.375rem] font-semibold rtl:font-bold"
          >
            {ar ? (
              <span className="font-quran font-bold text-gold-ink">{series.ar}</span>
            ) : (
              <>
                {t(`athkar.sets.${set}`)}
                <span lang="ar" className="font-quran font-bold text-gold-ink">
                  {series.ar}
                </span>
              </>
            )}
          </h2>
          <p className={subClass}>{ar ? series.hintAr : series.hintFr}</p>
        </div>
        <p
          className="tabular font-display text-[1.375rem] font-semibold whitespace-nowrap"
          aria-label={t('athkar.progress', progress)}
          dir="ltr"
        >
          {progress.done}/{progress.total}
        </p>
      </div>
      <Bar value={progress.done / progress.total} fill="bg-gold" />
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <p className={subClass}>{t('athkar.tapHint')}</p>
        <Button
          variant="secondary"
          className="h-11 rounded-[14px] bg-primary-soft font-bold text-primary"
          onClick={() => setReading(true)}
        >
          <ExpandIcon aria-hidden="true" />
          {t('athkar.fullscreen')}
        </Button>
      </div>
      <ol className="flex flex-col gap-2.5">
        {series.items.map((it, i) => (
          <li key={i}>
            <DhikrCard
              ref={(el) => {
                cards.current[i] = el
              }}
              item={it}
              count={day.athkar[set]?.[i] ?? 0}
              onTap={() => void tap(i)}
            />
          </li>
        ))}
      </ol>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="secondary" className="h-11 w-full rounded-[14px] font-bold">
            {t('athkar.reset')}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('athkar.resetTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('athkar.resetBody')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11">{t('athkar.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="h-11"
              onClick={() => {
                void resetAthkar(day.id, set)
                window.scrollTo(0, 0)
              }}
            >
              {t('athkar.confirmReset')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <DhikrReader set={set} day={day} open={reading} onClose={() => setReading(false)} />
    </section>
  )
}
