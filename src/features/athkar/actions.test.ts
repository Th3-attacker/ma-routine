import { beforeEach, describe, expect, it } from 'vitest'

import { db, getDay } from '@/db'

import { firstUndone, resetAthkar, tapDhikr, tapTasbih } from './actions'
import { ATHKAR } from './data'

const KEY = '2026-10-23'

beforeEach(async () => {
  await Promise.all(db.tables.map((t) => t.clear()))
})

describe('compteurs d’athkar', () => {
  it('compte jusqu’au nombre de répétitions, puis s’arrête', async () => {
    const i = ATHKAR.matin.items.findIndex((it) => it.n === 3)
    expect(await tapDhikr(KEY, 'matin', i)).toEqual({ count: 1, done: false, seriesDone: false })
    await tapDhikr(KEY, 'matin', i)
    expect(await tapDhikr(KEY, 'matin', i)).toMatchObject({ count: 3, done: true })
    expect(await tapDhikr(KEY, 'matin', i)).toBeNull()
    expect((await getDay(KEY)).athkar.matin?.[i]).toBe(3)
  })

  it('signale la série terminée et la remet à zéro', async () => {
    const items = ATHKAR.nuit.items
    let last = null
    for (const [i, it] of items.entries()) for (let k = 0; k < it.n; k++) last = await tapDhikr(KEY, 'nuit', i)
    expect(last).toMatchObject({ seriesDone: true })
    await resetAthkar(KEY, 'nuit')
    expect((await getDay(KEY)).athkar.nuit).toEqual({})
  })

  it('trouve le prochain dhikr non terminé', () => {
    const n0 = ATHKAR.matin.items[0].n
    expect(firstUndone('matin', {})).toBe(0)
    expect(firstUndone('matin', { 0: n0 })).toBe(1)
    expect(firstUndone('matin', { 0: n0 }, 3)).toBe(4)
  })

  it('additionne le tasbih par formule', async () => {
    await tapTasbih(KEY, 0)
    await tapTasbih(KEY, 0)
    await tapTasbih(KEY, 2)
    const d = await getDay(KEY)
    expect(d.tasbih).toBe(3)
    expect(d.tasbihBy).toEqual({ 0: 2, 2: 1 })
  })
})
