import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { usePreferences } from '@/app/PreferencesProvider'
import { toggleTask, useProjects } from '@/features/projects/projects'
import { formatShortDate } from '@/lib/dates'

import { EmptyState } from './ItemCard'
import { linkClass, Section } from './Section'

/** Les 4 prochaines étapes des projets en cours (par échéance). */
export function NextSteps({ today }: { today: string }) {
  const { t } = useTranslation()
  const { lang } = usePreferences()
  const projects = useProjects()
  if (!projects) return null

  const items = projects
    .filter((p) => p.status === 'active')
    .flatMap((p) => p.tasks.filter((x) => !x.done).map((task) => ({ p, task })))
    .sort((a, b) => (a.task.due || a.p.deadline || '9999').localeCompare(b.task.due || b.p.deadline || '9999'))
    .slice(0, 4)

  return (
    <Section
      title={t('steps.title')}
      aside={
        <Link to="/projets" className={linkClass}>
          {t('steps.link')}
        </Link>
      }
    >
      {!projects.length ? (
        <EmptyState title={t('steps.noneTitle')}>
          {t('steps.noneBody')}{' '}
          <Link to="/projets" className="font-bold text-primary">
            {t('steps.create')}
          </Link>
        </EmptyState>
      ) : !items.length ? (
        <EmptyState title={t('steps.doneTitle')}>{t('steps.doneBody')}</EmptyState>
      ) : (
        <ul className="overflow-hidden rounded-xl bg-card shadow-card">
          {items.map(({ p, task }) => (
            <li key={task.id} className="flex items-center gap-2 border-t border-line px-2 py-1 first:border-t-0">
              <button
                type="button"
                aria-pressed={false}
                aria-label={t('projects.finish', { title: task.title })}
                onClick={() => void toggleTask(task.id, today)}
                className="grid size-11 flex-none place-items-center"
              >
                <span className="size-6 rounded-[8px] border-2 border-line" />
              </button>
              <Link to="/projets" className="min-w-0 flex-1 py-1.5">
                <span className="block text-[0.90625rem] font-semibold [overflow-wrap:anywhere]">{task.title}</span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <i aria-hidden="true" className="size-2 rounded-[3px]" style={{ background: `var(${p.color})` }} />
                  {p.name}
                  {task.due && ` · ${formatShortDate(task.due, lang)}`}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
