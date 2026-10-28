import { useForm } from '@tanstack/react-form'
import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { usePreferences } from '@/app/PreferencesProvider'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { db } from '@/db/db'
import { updateDay } from '@/db/days'
import type { Day, Settings } from '@/db/types'
import { useMonthTransactions } from '@/features/budget/transactions'
import { eveningRecap, recapMessage } from '@/features/daily/recap'
import { formatMoney } from '@/lib/money'

import { AppDrawer } from './AppDrawer'
import { Field } from './Field'
import { cardClass, Section, subClass } from './Section'

/** Bilan du soir (muhâsaba) : six tuiles, message bienveillant, journal. */
export function RecapCard({ day, settings }: { day: Day; settings: Settings }) {
  const { t } = useTranslation()
  const { lang } = usePreferences()
  const [open, setOpen] = useState(false)
  const month = useMonthTransactions(day.id.slice(0, 7))
  const steps = useLiveQuery(
    () => db.tasks.filter((x) => !x.deleted && x.done && x.doneAt === day.id).count(),
    [day.id],
  )
  const spent = (month ?? []).filter((x) => x.type === 'out' && x.date === day.id).reduce((a, x) => a + x.amount, 0)
  const r = eveningRecap(day, settings, steps ?? 0, spent)
  const msg = recapMessage(r)
  const j = day.journal

  const tiles: [string, string][] = [
    [`${r.prayed}/5`, r.jamaa ? t('recap.prayersJamaa', { n: r.jamaa }) : t('recap.prayers')],
    [`${r.athkarSets}/2`, t('recap.athkar')],
    [`${r.quranPages}/${r.quranGoal}`, t('recap.quran')],
    [`${r.habitsDone}/${r.habitsTotal}`, t('recap.habits')],
    [String(r.stepsDone), t('recap.steps')],
    [formatMoney(r.spent, settings.currency, lang), t('recap.spent')],
  ]

  return (
    <Section title={t('recap.title')} aside={<span className={subClass}>{t('recap.muhasaba')}</span>}>
      <div className={`${cardClass} flex flex-col gap-3`}>
        <dl className="grid grid-cols-3 gap-2">
          {tiles.map(([value, label]) => (
            <div key={label} className="flex min-w-0 flex-col-reverse rounded-[12px] bg-surface-2 p-2.5">
              <dt className="text-[0.71875rem] font-semibold text-muted-foreground">{label}</dt>
              <dd className="tabular font-display text-[1.1875rem] leading-tight font-semibold [overflow-wrap:anywhere]">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="text-[0.84375rem] text-ink-2">
          {msg.key === 'allDone' ? t('recap.msg.allDone') : t(`recap.msg.${msg.key}`, { count: msg.count })}
        </p>
        {(j.good || j.better) && (
          <p className="rounded-[12px] bg-gold-soft px-3 py-2.5 text-[0.84375rem] [overflow-wrap:anywhere] whitespace-pre-line">
            {[j.good && t('recap.good', { text: j.good }), j.better && t('recap.better', { text: j.better })]
              .filter(Boolean)
              .join('\n')}
          </p>
        )}
        <Button
          variant="secondary"
          className="h-11 rounded-[14px] bg-primary-soft font-bold text-primary"
          onClick={() => setOpen(true)}
        >
          {j.good || j.better ? t('recap.editJournal') : t('recap.write')}
        </Button>
      </div>
      <AppDrawer
        open={open}
        onOpenChange={setOpen}
        title={t('recap.journalTitle')}
        description={t('recap.journalHint')}
      >
        {open && <JournalForm day={day} onDone={() => setOpen(false)} />}
      </AppDrawer>
    </Section>
  )
}

function JournalForm({ day, onDone }: { day: Day; onDone: () => void }) {
  const { t } = useTranslation()
  const form = useForm({
    defaultValues: { good: day.journal.good, better: day.journal.better },
    onSubmit: async ({ value }) => {
      await updateDay(day.id, () => ({
        journal: { good: value.good.trim().slice(0, 300), better: value.better.trim().slice(0, 300) },
      }))
      toast(t('recap.saved'))
      onDone()
    },
  })
  const area = 'min-h-24 rounded-[12px] border-line bg-surface px-3 py-2.5 text-base md:text-base dark:bg-surface'
  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      {(['good', 'better'] as const).map((k) => (
        <form.Field key={k} name={k}>
          {(field) => (
            <Field label={t(k === 'good' ? 'recap.goodLabel' : 'recap.betterLabel')}>
              {(p) => (
                <Textarea
                  {...p}
                  className={area}
                  maxLength={300}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              )}
            </Field>
          )}
        </form.Field>
      ))}
      <Button type="submit" className="h-12 rounded-[14px] text-[0.9375rem] font-bold">
        {t('budget.form.save')}
      </Button>
    </form>
  )
}
