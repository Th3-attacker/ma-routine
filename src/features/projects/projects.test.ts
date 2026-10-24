import { beforeEach, describe, expect, it } from 'vitest'

import { db } from '@/db/db'
import { liveRows } from '@/db/rows'

import {
  addTask,
  deleteProject,
  filterProjects,
  isLate,
  progress,
  saveProject,
  setStatus,
  sortProjects,
  toggleTask,
} from './projects'

beforeEach(async () => {
  await Promise.all(db.tables.map((t) => t.clear()))
})

describe('projets', () => {
  it('progression, retard, tri et filtres', () => {
    expect(progress([{ done: true }, { done: false }, { done: true }])).toEqual({ done: 2, total: 3, pct: 67 })
    expect(progress([])).toEqual({ done: 0, total: 0, pct: 0 })
    expect(isLate({ deadline: '2026-10-20', status: 'active' }, '2026-10-23')).toBe(true)
    expect(isLate({ deadline: '2026-10-20', status: 'done' }, '2026-10-23')).toBe(false)
    expect(isLate({ deadline: '', status: 'active' }, '2026-10-23')).toBe(false)
    const list = [
      { id: 'd', status: 'done' as const, deadline: '', createdAt: 1 },
      { id: 'b', status: 'active' as const, deadline: '', createdAt: 2 },
      { id: 'a', status: 'active' as const, deadline: '2026-12-01', createdAt: 3 },
      { id: 'p', status: 'paused' as const, deadline: '', createdAt: 4 },
    ]
    expect(sortProjects(list).map((p) => p.id)).toEqual(['a', 'b', 'p', 'd'])
    expect(filterProjects(list, 'active').map((p) => p.id)).toEqual(['b', 'a', 'p'])
    expect(filterProjects(list, 'done').map((p) => p.id)).toEqual(['d'])
  })

  it('création avec premières étapes, cocher avec la date, supprimer', async () => {
    const p = await saveProject(
      { name: 'Mémoriser Juz ‘Amma', intention: 'Pour Allah', deadline: '', color: '--c2' },
      undefined,
      'Choisir un horaire\n\n  Trouver un professeur  \n',
    )
    const tasks = (await liveRows(db.tasks)).sort((a, b) => a.position - b.position)
    expect(tasks.map((t) => t.title)).toEqual(['Choisir un horaire', 'Trouver un professeur'])
    await toggleTask(tasks[0].id, '2026-10-23')
    expect(await db.tasks.get(tasks[0].id)).toMatchObject({ done: true, doneAt: '2026-10-23' })
    await toggleTask(tasks[0].id, '2026-10-24')
    expect(await db.tasks.get(tasks[0].id)).toMatchObject({ done: false, doneAt: null })
    await addTask(p.id, 'Réviser')
    expect((await db.tasks.where('projectId').equals(p.id).toArray()).at(-1)?.position).toBe(2)
    await setStatus(p.id, 'paused')
    expect((await db.projects.get(p.id))?.status).toBe('paused')
    await deleteProject(p.id)
    expect(await liveRows(db.projects)).toEqual([])
    expect(await liveRows(db.tasks)).toEqual([])
  })
})
