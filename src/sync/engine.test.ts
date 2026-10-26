import { beforeEach, describe, expect, it } from 'vitest'

import { db } from '@/db/db'
import { getDay, updateDay } from '@/db/days'
import { saveRow } from '@/db/rows'
import { updateSettings } from '@/db/settings'
import type { Day } from '@/db/types'

import { clearLocalData, hasLocalData, markAllDirty, mergeDays, syncOnce, type Remote, type RemoteRow } from './engine'

/** Faux serveur en mémoire : une « table » par nom, synced_at croissant. */
function fakeRemote() {
  const tables = new Map<string, Map<string, RemoteRow>>()
  let tick = 0
  const remote: Remote = {
    async pull(table, since) {
      return [...(tables.get(table)?.values() ?? [])]
        .filter((r) => !since || r.synced_at > since)
        .sort((a, b) => a.synced_at.localeCompare(b.synced_at))
    },
    async push(table, rows) {
      const t = tables.get(table) ?? new Map()
      tables.set(table, t)
      for (const r of rows) t.set(r.id, { ...r, synced_at: String(++tick).padStart(8, '0') })
    },
  }
  return { remote, tables }
}

const wipe = async () => {
  await Promise.all(db.tables.map((t) => t.clear()))
  localStorage.clear()
}

beforeEach(wipe)

describe('synchro', () => {
  it('envoie les lignes modifiées puis les marque comme synchronisées', async () => {
    const { remote, tables } = fakeRemote()
    await updateSettings({ name: 'Elhadj' })
    await updateDay('2026-10-23', () => ({ quranPages: 3 }))
    expect(await syncOnce(remote, 'u1')).toEqual({ pulled: 0, pushed: 2 })
    expect(tables.get('days')?.get('2026-10-23')?.data).toMatchObject({ quranPages: 3 })
    expect((await db.days.get('2026-10-23'))?.dirty).toBe(0)
    expect(await syncOnce(remote, 'u1')).toEqual({ pulled: 2, pushed: 0 })
    expect(await syncOnce(remote, 'u1')).toEqual({ pulled: 0, pushed: 0 })
  })

  it('un deuxième téléphone récupère tout ; la modification la plus récente gagne', async () => {
    const { remote } = fakeRemote()
    await saveRow(db.debts, {
      id: 'd1',
      direction: 'in',
      person: 'Ahmed',
      amount: 5000,
      due: '',
      note: '',
      payments: [],
      closed: false,
      createdAt: 1,
    })
    await syncOnce(remote, 'u1')

    // Téléphone B (base vide, autre curseur)
    await wipe()
    await syncOnce(remote, 'u1')
    expect((await db.debts.get('d1'))?.person).toBe('Ahmed')
    expect((await db.debts.get('d1'))?.dirty).toBe(0)

    // B modifie, A (simulé par un upsert plus ancien) ne doit pas écraser
    await db.debts.update('d1', { person: 'Ahmed B.', updatedAt: Date.now() + 1000, dirty: 1 })
    await syncOnce(remote, 'u1')
    await remote.push('debts', [{ id: 'd1', data: { person: 'Vieux' }, updated_at: 1, deleted: false }])
    await syncOnce(remote, 'u1')
    expect((await db.debts.get('d1'))?.person).toBe('Ahmed B.')
  })

  it('les suppressions douces se propagent', async () => {
    const { remote } = fakeRemote()
    await saveRow(db.projects, {
      id: 'p1',
      name: 'X',
      intention: '',
      deadline: '',
      color: '--c2',
      status: 'active',
      createdAt: 1,
    })
    await syncOnce(remote, 'u1')
    await wipe()
    await syncOnce(remote, 'u1')
    await db.projects.update('p1', { deleted: 1, updatedAt: Date.now() + 10, dirty: 1 })
    await syncOnce(remote, 'u1')
    await wipe()
    await syncOnce(remote, 'u1')
    expect((await db.projects.get('p1'))?.deleted).toBe(1)
  })

  it('fusionne une journée champ par champ entre deux téléphones', () => {
    const base = { id: '2026-10-23', deleted: 0, dirty: 0 } as const
    const local = {
      ...base,
      prayers: { fajr: 'jamaa' },
      quranPages: 0,
      updatedAt: 200,
      fieldTimes: { prayers: 200 },
    } as unknown as Day
    const remote = {
      ...base,
      prayers: {},
      quranPages: 5,
      updatedAt: 150,
      fieldTimes: { quranPages: 150 },
    } as unknown as Day
    const { merged, localWins } = mergeDays(local, remote)
    expect(merged.prayers).toEqual({ fajr: 'jamaa' })
    expect(merged.quranPages).toBe(5)
    expect(localWins).toBe(true)
    expect(merged.dirty).toBe(1)
  })

  it('fusion réelle : prières sur A, Coran sur B, rien n’est perdu', async () => {
    const { remote } = fakeRemote()
    await updateDay('2026-10-23', () => ({ quranPages: 4 }))
    await syncOnce(remote, 'u1')
    // Téléphone B : récupère, puis note une prière
    await wipe()
    await syncOnce(remote, 'u1')
    await new Promise((r) => setTimeout(r, 5))
    await updateDay('2026-10-23', (d) => ({ prayers: { ...d.prayers, fajr: 'ontime' } }))
    await syncOnce(remote, 'u1')
    const d = await getDay('2026-10-23')
    expect(d.quranPages).toBe(4)
    expect(d.prayers.fajr).toBe('ontime')
  })

  it('première connexion : données locales, remplacer ou fusionner', async () => {
    expect(await hasLocalData()).toBe(false)
    await updateDay('2026-10-23', () => ({ quranPages: 1 }))
    expect(await hasLocalData()).toBe(true)
    await db.days.update('2026-10-23', { dirty: 0 })
    await markAllDirty()
    expect((await db.days.get('2026-10-23'))?.dirty).toBe(1)
    await updateSettings({ name: 'Local' })
    await clearLocalData('u1')
    expect(await hasLocalData()).toBe(false)
    // Réglages gardés, mais ceux du compte gagneront
    expect(await db.settings.get('me')).toMatchObject({ name: 'Local', updatedAt: 0, dirty: 0 })
  })
})
