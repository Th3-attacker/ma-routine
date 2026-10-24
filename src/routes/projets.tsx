import { useForm } from '@tanstack/react-form'
import { CheckIcon, PlusIcon, Trash2Icon, XIcon } from 'lucide-react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import { usePreferences } from '@/app/PreferencesProvider'
import { AppDrawer } from '@/components/AppDrawer'
import { ChipGroup } from '@/components/ChipGroup'
import { ColorPicker } from '@/components/ColorPicker'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Field, inputClass, labelClass } from '@/components/Field'
import { Badge, EmptyState, ItemCard } from '@/components/ItemCard'
import { PageTitle } from '@/components/PageTitle'
import { subClass } from '@/components/Section'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useSettings } from '@/db/settings'
import type { ProjectStatus } from '@/db/types'
import { PICK_COLORS } from '@/features/budget/categories'
import { resolvePlace } from '@/features/prayer/cities'
import { useNow } from '@/features/prayer/useToday'
import {
  addTask,
  deleteProject,
  deleteTask,
  filterProjects,
  isLate,
  progress,
  saveProject,
  setStatus,
  toggleTask,
  useProjects,
  type ProjectFilter,
  type ProjectWithTasks,
} from '@/features/projects/projects'
import { dayKey, formatShortDate } from '@/lib/dates'
import { readLocal, writeLocal } from '@/lib/storage'
import { cn } from '@/lib/utils'
import { useDeadlineText } from '@/lib/useDeadlineText'

const FILTERS: readonly ProjectFilter[] = ['active', 'done', 'all']
const STATUSES: readonly ProjectStatus[] = ['active', 'paused', 'done']
const FILTER_KEY = 'elhadj.projectFilter'

export function ProjectsPage() {
  const { t } = useTranslation()
  const settings = useSettings()
  const projects = useProjects()
  const deadline = useDeadlineText()
  const now = useNow(60_000)
  const [filter, setFilterState] = useState<ProjectFilter>(() => {
    const v = readLocal(FILTER_KEY)
    return FILTERS.includes(v as ProjectFilter) ? (v as ProjectFilter) : 'active'
  })
  const [openId, setOpenId] = useState<string | null>(null)
  const [form, setForm] = useState<{ edit?: ProjectWithTasks } | null>(null)

  if (!settings || !projects) return <Skeleton className="h-40 w-full rounded-xl" />
  const today = dayKey(now, resolvePlace(settings).timezone)
  const setFilter = (f: ProjectFilter) => {
    setFilterState(f)
    writeLocal(FILTER_KEY, f)
  }
  const list = filterProjects(projects, filter)
  const active = projects.filter((p) => p.status === 'active')
  const open = active.reduce((a, p) => a + p.tasks.filter((x) => !x.done).length, 0)
  const current = projects.find((p) => p.id === openId) ?? null

  return (
    <>
      <section aria-labelledby="projects-title" className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-2.5">
          <PageTitle>
            <span id="projects-title">{t('projects.title')}</span>
          </PageTitle>
          <p className={subClass}>
            {t('projects.activeCount', { count: active.length })} · {t('projects.openCount', { count: open })}
          </p>
        </div>
        <ChipGroup
          label={t('projects.filterLabel')}
          value={filter}
          onChange={setFilter}
          options={FILTERS.map((f) => ({ value: f, label: t(`projects.filters.${f}`) }))}
        />
        <Button className="h-11 rounded-[14px] font-bold" onClick={() => setForm({})}>
          <PlusIcon aria-hidden="true" />
          {t('projects.new')}
        </Button>
      </section>

      {list.length ? (
        <ul className="flex flex-col gap-2.5">
          {list.map((p) => {
            const pr = progress(p.tasks)
            const late = isLate(p, today)
            return (
              <li key={p.id}>
                <ItemCard
                  color={p.color}
                  title={p.name}
                  badge={
                    <Badge
                      tone={late ? 'late' : p.status === 'done' ? 'done' : p.status === 'active' ? 'active' : 'neutral'}
                    >
                      {late ? t('projects.late') : t(`projects.status.${p.status}`)}
                    </Badge>
                  }
                  note={p.intention || undefined}
                  progress={pr.pct / 100}
                  meta={[
                    pr.total ? t('projects.steps', pr) : t('projects.noSteps'),
                    deadline(p.deadline, today, p.status === 'done'),
                  ]}
                  onOpen={() => setOpenId(p.id)}
                />
              </li>
            )
          })}
        </ul>
      ) : projects.length ? (
        <EmptyState title={t('projects.emptyFilterTitle')}>{t('projects.emptyFilterBody')}</EmptyState>
      ) : (
        <EmptyState title={t('projects.emptyTitle')}>{t('projects.emptyBody')}</EmptyState>
      )}

      <AppDrawer open={!!current} onOpenChange={(o) => !o && setOpenId(null)} title={current?.name ?? ''}>
        {current && (
          <ProjectDetail
            project={current}
            today={today}
            onEdit={() => {
              setOpenId(null)
              setForm({ edit: current })
            }}
            onDeleted={() => setOpenId(null)}
          />
        )}
      </AppDrawer>
      <AppDrawer
        open={!!form}
        onOpenChange={(o) => !o && setForm(null)}
        title={form?.edit ? t('projects.edit') : t('projects.new')}
      >
        {form && (
          <ProjectForm
            editing={form.edit ?? null}
            defaultColor={PICK_COLORS[projects.length % PICK_COLORS.length]}
            onDone={(id) => {
              setForm(null)
              if (id) setOpenId(id)
            }}
          />
        )}
      </AppDrawer>
    </>
  )
}

function ProjectDetail({
  project,
  today,
  onEdit,
  onDeleted,
}: {
  project: ProjectWithTasks
  today: string
  onEdit: () => void
  onDeleted: () => void
}) {
  const { t } = useTranslation()
  const { lang } = usePreferences()
  const deadline = useDeadlineText()
  const pr = progress(project.tasks)
  const btn = 'h-11 flex-auto rounded-[14px] font-bold'

  return (
    <>
      <ChipGroup
        label={t('projects.statusLabel')}
        value={project.status}
        onChange={(s) => void setStatus(project.id, s)}
        options={STATUSES.map((s) => ({ value: s, label: t(`projects.status.${s}`) }))}
      />
      {project.intention && (
        <p className="text-sm [overflow-wrap:anywhere] text-ink-2 italic">
          {t('projects.niyya', { text: project.intention })}
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        <p className={cn(subClass, 'flex justify-between gap-2.5')}>
          <span className="tabular">{t('projects.steps', pr)}</span>
          <span>{deadline(project.deadline, today, project.status === 'done')}</span>
        </p>
        <span className="block h-2 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
          <i
            className="block h-full rounded-full"
            style={{ width: `${pr.pct}%`, background: `var(${project.color})` }}
          />
        </span>
      </div>

      <section aria-labelledby="project-steps" className="flex flex-col gap-2.5">
        <h3 id="project-steps" className="font-display text-lg font-semibold rtl:font-bold">
          {t('projects.stepsTitle')}
        </h3>
        {project.tasks.length ? (
          <ul className="overflow-hidden rounded-xl bg-card shadow-card">
            {project.tasks.map((task) => (
              <li key={task.id} className="flex items-center gap-2 border-t border-line px-2 py-1 first:border-t-0">
                <button
                  type="button"
                  aria-pressed={task.done}
                  aria-label={
                    task.done
                      ? t('projects.reopen', { title: task.title })
                      : t('projects.finish', { title: task.title })
                  }
                  onClick={() => void toggleTask(task.id, today)}
                  className="grid size-11 flex-none place-items-center"
                >
                  <span
                    className={cn(
                      'grid size-6 place-items-center rounded-[8px] border-2 text-primary-foreground',
                      task.done ? 'border-ok bg-ok' : 'border-line',
                    )}
                  >
                    <CheckIcon
                      className={cn('size-3.5', !task.done && 'opacity-0')}
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                  </span>
                </button>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block text-[0.90625rem] font-semibold [overflow-wrap:anywhere]',
                      task.done && 'text-muted-foreground line-through',
                    )}
                  >
                    {task.title}
                  </span>
                  {task.due && (
                    <span className="block text-xs text-muted-foreground">{formatShortDate(task.due, lang)}</span>
                  )}
                </span>
                <button
                  type="button"
                  aria-label={t('projects.deleteStep', { title: task.title })}
                  onClick={() => void deleteTask(task.id)}
                  className="grid size-11 flex-none place-items-center rounded-[12px] text-ink-3"
                >
                  <XIcon className="size-5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl bg-card px-3.5 py-3 text-[0.8125rem] text-muted-foreground shadow-card">
            {t('projects.noStepsLong')}
          </p>
        )}
        <AddStepForm projectId={project.id} />
      </section>

      <p className={subClass}>{t('projects.suggestLater')}</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" className={btn} onClick={onEdit}>
          {t('debts.edit')}
        </Button>
        <ConfirmDialog
          trigger={
            <Button variant="destructive" className={btn}>
              <Trash2Icon aria-hidden="true" />
              {t('debts.delete')}
            </Button>
          }
          title={t('projects.deleteTitle')}
          body={t('projects.deleteBody')}
          confirm={t('debts.delete')}
          cancel={t('budget.form.cancel')}
          onConfirm={() => void deleteProject(project.id).then(onDeleted)}
        />
      </div>
    </>
  )
}

function AddStepForm({ projectId }: { projectId: string }) {
  const { t } = useTranslation()
  const id = useId()
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  return (
    <form
      noValidate
      className="flex flex-col gap-[7px]"
      onSubmit={(e) => {
        e.preventDefault()
        if (!value.trim()) {
          setError(true)
          return
        }
        setError(false)
        void addTask(projectId, value.trim()).then(() => setValue(''))
      }}
    >
      <label htmlFor={id} className={labelClass}>
        {t('projects.newStep')}
      </label>
      <div className="flex gap-2.5">
        <Input
          id={id}
          className={cn(inputClass, 'flex-1')}
          maxLength={120}
          autoComplete="off"
          placeholder={t('projects.newStepPlaceholder')}
          aria-invalid={error || undefined}
          aria-describedby={error ? `${id}-err` : undefined}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button type="submit" className="size-11 rounded-[14px] p-0" aria-label={t('projects.addStep')}>
          <PlusIcon aria-hidden="true" />
        </Button>
      </div>
      {error && (
        <p id={`${id}-err`} className="text-[0.8125rem] font-semibold text-bad">
          {t('errors.step')}
        </p>
      )}
    </form>
  )
}

function ProjectForm({
  editing,
  defaultColor,
  onDone,
}: {
  editing: ProjectWithTasks | null
  defaultColor: string
  onDone: (openId?: string) => void
}) {
  const { t } = useTranslation()
  const schema = z.object({
    name: z.string().trim().min(1, 'errors.projectName').max(80, 'errors.tooLong?max=80'),
    intention: z.string().max(200, 'errors.tooLong?max=200'),
    deadline: z.string(),
    color: z.string(),
    steps: z.string(),
  })
  const form = useForm({
    defaultValues: {
      name: editing?.name ?? '',
      intention: editing?.intention ?? '',
      deadline: editing?.deadline ?? '',
      color: editing?.color ?? defaultColor,
      steps: '',
    },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      const p = await saveProject(
        { name: value.name.trim(), intention: value.intention.trim(), deadline: value.deadline, color: value.color },
        editing?.id,
        value.steps,
      )
      toast(editing ? t('projects.updated') : t('projects.created'))
      onDone(p.id)
    },
  })

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field name="name">
        {(field) => (
          <Field label={t('projects.name')} errors={field.state.meta.errors}>
            {(p) => (
              <Input
                {...p}
                autoFocus={!editing}
                className={inputClass}
                maxLength={80}
                placeholder={t('projects.namePlaceholder')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </Field>
        )}
      </form.Field>
      <form.Field name="intention">
        {(field) => (
          <Field label={t('projects.intention')} errors={field.state.meta.errors}>
            {(p) => (
              <Textarea
                {...p}
                className="min-h-20 rounded-[12px] border-line bg-surface px-3 py-2.5 text-base md:text-base dark:bg-surface"
                maxLength={200}
                placeholder={t('projects.intentionPlaceholder')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </Field>
        )}
      </form.Field>
      <form.Field name="deadline">
        {(field) => (
          <Field label={t('projects.deadline')}>
            {(p) => (
              <Input
                {...p}
                type="date"
                dir="ltr"
                className={inputClass}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </Field>
        )}
      </form.Field>
      <form.Field name="color">
        {(field) => <ColorPicker label={t('goals.color')} value={field.state.value} onChange={field.handleChange} />}
      </form.Field>
      {!editing && (
        <form.Field name="steps">
          {(field) => (
            <Field label={t('projects.firstSteps')}>
              {(p) => (
                <Textarea
                  {...p}
                  className="min-h-24 rounded-[12px] border-line bg-surface px-3 py-2.5 text-base md:text-base dark:bg-surface"
                  placeholder={t('projects.firstStepsPlaceholder')}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              )}
            </Field>
          )}
        </form.Field>
      )}
      <Button type="submit" className="h-12 rounded-[14px] text-[0.9375rem] font-bold">
        {editing ? t('budget.form.save') : t('projects.create')}
      </Button>
    </form>
  )
}
