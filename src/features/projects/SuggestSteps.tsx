import { CheckIcon, SparklesIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { AppSelect } from '@/components/AppSelect'
import { Field, labelClass } from '@/components/Field'
import { subClass } from '@/components/Section'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { addTask, type ProjectWithTasks } from './projects'
import { spreadDueDates, suggestTemplate, TEMPLATES, type TemplateId } from './templates'

/**
 * « Proposer des étapes » (sans IA) : modèle le plus proche du nom du projet, choix d'un autre modèle,
 * étapes à cocher ; les dates sont réparties jusqu'à l'échéance.
 */
export function SuggestSteps({ project, today }: { project: ProjectWithTasks; today: string }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'fr'
  const [open, setOpen] = useState(false)
  const matched = suggestTemplate(project.name)
  const [templateId, setTemplateId] = useState<TemplateId | ''>(matched ?? '')
  const [picked, setPicked] = useState<boolean[]>([])
  const template = TEMPLATES.find((x) => x.id === templateId)

  const pick = (id: TemplateId | '') => {
    setTemplateId(id)
    setPicked((TEMPLATES.find((x) => x.id === id)?.steps ?? []).map(() => true))
  }

  if (!open) {
    return (
      <Button
        variant="secondary"
        className="h-11 rounded-[14px] bg-primary-soft font-bold text-primary"
        onClick={() => {
          pick(matched ?? '')
          setOpen(true)
        }}
      >
        <SparklesIcon aria-hidden="true" />
        {t('suggest.button')}
      </Button>
    )
  }

  const chosen = template ? template.steps.filter((_, i) => picked[i]) : []
  async function add() {
    if (!template || !chosen.length) return
    const dues = spreadDueDates(chosen.length, today, project.deadline)
    const start = project.tasks.length
    for (const [i, s] of chosen.entries()) await addTask(project.id, s[lang], start + i, dues[i])
    toast(t('suggest.added', { count: chosen.length }))
    setOpen(false)
  }

  return (
    <section aria-labelledby="suggest-title" className="flex flex-col gap-3 rounded-xl border border-line p-3.5">
      <h3 id="suggest-title" className="font-display text-lg font-semibold rtl:font-bold">
        {t('suggest.title')}
      </h3>
      <Field label={t('suggest.template')}>
        {(p) => (
          <AppSelect<TemplateId | ''>
            {...p}
            value={templateId}
            onChange={pick}
            options={[
              ...(templateId ? [] : [{ value: '' as const, label: t('suggest.choose') }]),
              ...TEMPLATES.map((x) => ({ value: x.id, label: t(`templates.${x.id}`) })),
            ]}
          />
        )}
      </Field>
      {matched && templateId === matched && <p className={subClass}>{t('suggest.matched')}</p>}
      {template && (
        <fieldset className="flex min-w-0 flex-col gap-[7px]">
          <legend className={cn(labelClass, 'mb-[7px]')}>{t('suggest.steps')}</legend>
          <ul className="overflow-hidden rounded-xl bg-card shadow-card">
            {template.steps.map((s, i) => (
              <li key={i} className="border-t border-line first:border-t-0">
                <label className="flex min-h-12 cursor-pointer items-center gap-3 px-3 py-2">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={!!picked[i]}
                    onChange={() => setPicked((p) => p.map((v, j) => (j === i ? !v : v)))}
                  />
                  <span
                    aria-hidden="true"
                    className="grid size-6 flex-none place-items-center rounded-[8px] border-2 border-line text-primary-foreground peer-checked:border-ok peer-checked:bg-ok peer-focus-visible:outline-2 peer-focus-visible:outline-primary"
                  >
                    <CheckIcon className={cn('size-3.5', !picked[i] && 'opacity-0')} strokeWidth={3} />
                  </span>
                  <span className="min-w-0 text-[0.90625rem] [overflow-wrap:anywhere]">{s[lang]}</span>
                </label>
              </li>
            ))}
          </ul>
          {project.deadline && <p className={subClass}>{t('suggest.datesHint')}</p>}
        </fieldset>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          className="h-11 flex-auto rounded-[14px] font-bold"
          disabled={!chosen.length}
          onClick={() => void add()}
        >
          {t('suggest.add', { count: chosen.length })}
        </Button>
        <Button variant="secondary" className="h-11 flex-auto rounded-[14px] font-bold" onClick={() => setOpen(false)}>
          {t('suggest.cancel')}
        </Button>
      </div>
    </section>
  )
}
