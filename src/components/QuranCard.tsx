import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { usePreferences } from '@/app/PreferencesProvider'
import { Button } from '@/components/ui/button'
import { db } from '@/db/db'
import { getDay } from '@/db/days'
import { getSettings } from '@/db/settings'
import type { Day, Settings } from '@/db/types'
import { addPages, khatmaDate } from '@/features/quran/khatma'
import { formatShortDate } from '@/lib/dates'
import { vibrate } from '@/lib/haptics'

import { Bar, cardClass, Section, subClass } from './Section'

const btn = 'h-11 flex-auto rounded-[14px] font-bold'

/** Wird du Coran : +1, +wird, −1, page actuelle, khatma prévue et khatmas terminées. */
export function QuranCard({ day, settings }: { day: Day; settings: Settings }) {
  const { t } = useTranslation()
  const { lang } = usePreferences()
  const q = settings.quran
  const goal = Math.max(1, q.goal)
  const read = day.quranPages

  async function add(n: number) {
    const done = await db.transaction('rw', db.days, db.settings, async () => {
      const [s, d] = [await getSettings(), await getDay(day.id)]
      const r = addPages(s.quran, d.quranPages, n)
      if (!r) return false
      const now = Date.now()
      await db.days.put({
        ...d,
        quranPages: r.pagesToday,
        fieldTimes: { ...d.fieldTimes, quranPages: now },
        updatedAt: now,
        dirty: 1,
      })
      await db.settings.put({ ...s, quran: r.quran, updatedAt: now, dirty: 1 })
      return r.khatmaDone
    })
    if (done) {
      toast(t('quran.khatmaDone'))
      vibrate([30, 60, 30])
    }
  }

  return (
    <Section
      title={t('quran.title')}
      aside={<span className={`${subClass} tabular`}>{t('quran.page', { page: q.page, total: q.total })}</span>}
    >
      <div className={`${cardClass} flex flex-col gap-2.5`}>
        <p className="flex items-baseline justify-between gap-2.5">
          <b className="tabular text-[0.9375rem]">{t('quran.today', { read, goal })}</b>
          <span className={subClass}>{read >= goal ? t('quran.done') : t('quran.left', { n: goal - read })}</span>
        </p>
        <Bar value={read / goal} fill="bg-ok" />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" className={`${btn} bg-primary-soft text-primary`} onClick={() => void add(1)}>
            {t('quran.plusOne')}
          </Button>
          <Button variant="secondary" className={`${btn} bg-primary-soft text-primary`} onClick={() => void add(goal)}>
            {t('quran.plusWird', { goal })}
          </Button>
          <Button variant="secondary" className={btn} aria-label={t('quran.minusOne')} onClick={() => void add(-1)}>
            <span dir="ltr">−1</span>
          </Button>
        </div>
        <p className={subClass}>
          {t('quran.eta', { date: formatShortDate(khatmaDate(day.id, q), lang) })}
          {q.khatmas > 0 && t('quran.khatmas', { count: q.khatmas })}
        </p>
      </div>
    </Section>
  )
}
