import { useLiveQuery } from 'dexie-react-hooks'

import { db } from '@/db/db'
import { liveRows, newId, saveRow, softDelete, updateRow } from '@/db/rows'
import type { Project, ProjectStatus, Task } from '@/db/types'
import { daysBetween } from '@/lib/dates'

export type ProjectWithTasks = Project & { tasks: Task[] }

const STATUS_ORDER: Record<ProjectStatus, number> = { active: 0, paused: 1, done: 2 }

export function progress(tasks: readonly Pick<Task, 'done'>[]): { done: number; total: number; pct: number } {
  const done = tasks.filter((t) => t.done).length
  return { done, total: tasks.length, pct: tasks.length ? Math.round((done / tasks.length) * 100) : 0 }
}

/** En retard : une échéance passée et le projet n'est pas terminé. */
export function isLate(p: Pick<Project, 'deadline' | 'status'>, today: string): boolean {
  return !!p.deadline && p.status !== 'done' && daysBetween(today, p.deadline) < 0
}

/** En cours, puis en pause, puis terminés ; ensuite par échéance (sans échéance à la fin), puis par création. */
export function sortProjects<T extends Pick<Project, 'status' | 'deadline' | 'createdAt'>>(list: readonly T[]): T[] {
  return [...list].sort(
    (a, b) =>
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
      (a.deadline || '9999').localeCompare(b.deadline || '9999') ||
      a.createdAt - b.createdAt,
  )
}

export type ProjectFilter = 'active' | 'done' | 'all'

export function filterProjects<T extends Pick<Project, 'status'>>(list: readonly T[], f: ProjectFilter): T[] {
  return list.filter((p) => (f === 'all' ? true : f === 'done' ? p.status === 'done' : p.status !== 'done'))
}

export function useProjects(): ProjectWithTasks[] | undefined {
  return useLiveQuery(async () => {
    const [projects, tasks] = await Promise.all([liveRows(db.projects), liveRows(db.tasks)])
    const byProject = new Map<string, Task[]>()
    for (const t of tasks.sort((a, b) => a.position - b.position)) {
      byProject.set(t.projectId, [...(byProject.get(t.projectId) ?? []), t])
    }
    return sortProjects(projects).map((p) => ({ ...p, tasks: byProject.get(p.id) ?? [] }))
  })
}

export type ProjectInput = Pick<Project, 'name' | 'intention' | 'deadline' | 'color'>

/** Crée ou modifie un projet ; à la création, les premières étapes (une par ligne) sont ajoutées. */
export async function saveProject(input: ProjectInput, id?: string, firstSteps = ''): Promise<Project> {
  const current = id ? await db.projects.get(id) : undefined
  const p = await saveRow(db.projects, {
    status: 'active' as ProjectStatus,
    createdAt: Date.now(),
    ...current,
    ...input,
    id: id ?? newId(),
  })
  if (!id) {
    const lines = firstSteps
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 30)
    for (const [i, title] of lines.entries()) await addTask(p.id, title, i)
  }
  return p
}

export const setStatus = (id: string, status: ProjectStatus) => updateRow(db.projects, id, () => ({ status }))

export async function deleteProject(id: string): Promise<void> {
  await softDelete(db.projects, id)
  for (const t of await db.tasks.where('projectId').equals(id).toArray()) await softDelete(db.tasks, t.id)
}

export async function addTask(projectId: string, title: string, position?: number): Promise<Task> {
  const pos = position ?? (await db.tasks.where('projectId').equals(projectId).count())
  return saveRow(db.tasks, {
    id: newId(),
    projectId,
    title: title.slice(0, 120),
    done: false,
    due: '',
    position: pos,
    doneAt: null,
  })
}

/** Cocher une étape enregistre le jour (`doneAt`), pour le bilan du soir. */
export const toggleTask = (id: string, today: string) =>
  updateRow(db.tasks, id, (t) => ({ done: !t.done, doneAt: t.done ? null : today }))

export const deleteTask = (id: string) => softDelete(db.tasks, id)
