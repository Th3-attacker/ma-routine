import { beforeEach, describe, expect, it } from 'vitest'

import { db } from '@/db/db'

import {
  changePin,
  getSecurity,
  hashPin,
  hasPin,
  lockoutMs,
  markHidden,
  pinProblem,
  PBKDF2_ITERATIONS,
  setPin,
  shouldRelock,
  verifyPin,
} from './pin'

beforeEach(async () => {
  await Promise.all(db.tables.map((t) => t.clear()))
})

describe('codes trop simples', () => {
  it('refuse les chiffres identiques et les suites', () => {
    for (const p of ['0000', '1111', '9999']) expect(pinProblem(p)).toBe('repeated')
    for (const p of ['1234', '2345', '6789', '0123', '4321', '3210', '9876']) expect(pinProblem(p)).toBe('sequence')
    for (const p of ['123', '12a4', '12345', '']) expect(pinProblem(p)).toBe('format')
    for (const p of ['1357', '2580', '1122', '1243', '7890']) expect(pinProblem(p)).toBeNull()
  })
})

describe('hachage', () => {
  it('ne stocke jamais le code en clair et utilise PBKDF2 avec un sel aléatoire', async () => {
    await setPin('2580')
    const s = await getSecurity()
    expect(JSON.stringify(s)).not.toContain('2580')
    expect(s.iterations).toBeGreaterThanOrEqual(210_000)
    expect(atob(s.salt!)).toHaveLength(16)
    expect(await hasPin()).toBe(true)
    await setPin('2580')
    expect((await getSecurity()).salt).not.toBe(s.salt)
  })

  it('donne le même hachage pour le même code et le même sel', async () => {
    const salt = new Uint8Array(16).fill(7)
    expect(await hashPin('1357', salt, 1000)).toBe(await hashPin('1357', salt, 1000))
    expect(await hashPin('1357', salt, 1000)).not.toBe(await hashPin('1358', salt, 1000))
    expect(PBKDF2_ITERATIONS).toBe(210_000)
  })

  it('refuse d’enregistrer un code trop simple', async () => {
    await expect(setPin('1234')).rejects.toThrow()
  })
})

describe('vérification et paliers d’attente', () => {
  it('accepte le bon code et refuse un code faux', async () => {
    await setPin('2580')
    expect(await verifyPin('2580')).toEqual({ ok: true })
    expect(await verifyPin('2581')).toMatchObject({ ok: false, reason: 'wrong', lockedUntil: 0 })
  })

  it('bloque après 5 erreurs : 30 s, puis 1 min, 5 min, et 15 min au maximum', async () => {
    expect([1, 4, 5, 6, 7, 8, 12].map(lockoutMs)).toEqual([0, 0, 30_000, 60_000, 300_000, 900_000, 900_000])
    await setPin('2580')
    let now = 1_000_000
    for (let i = 0; i < 4; i++) await verifyPin('0001', now)
    expect(await verifyPin('0001', now)).toEqual({ ok: false, reason: 'wrong', lockedUntil: now + 30_000 })
    // Pendant l'attente, même le bon code est refusé
    expect(await verifyPin('2580', now + 10_000)).toMatchObject({ ok: false, reason: 'locked' })
    now += 30_000
    expect(await verifyPin('0001', now)).toMatchObject({ lockedUntil: now + 60_000 })
  })

  it('les erreurs survivent à un rechargement et sont effacées par un bon code', async () => {
    await setPin('2580')
    for (let i = 0; i < 3; i++) await verifyPin('0001', 0)
    db.close()
    await db.open()
    expect((await getSecurity()).failedCount).toBe(3)
    expect(await verifyPin('2580', 0)).toEqual({ ok: true })
    expect((await getSecurity()).failedCount).toBe(0)
  })

  it('change le code seulement si l’ancien est bon', async () => {
    await setPin('2580')
    expect((await changePin('1111', '1357')).ok).toBe(false)
    expect((await changePin('2580', '1357')).ok).toBe(true)
    expect((await verifyPin('1357')).ok).toBe(true)
  })
})

describe('verrouillage automatique', () => {
  it('redemande le code après 5 min en arrière-plan, mais pas après 4 min', async () => {
    const t0 = 10_000_000
    await markHidden(t0)
    const s = await getSecurity()
    expect(s.lockAfterMin).toBe(5)
    expect(shouldRelock(s, t0 + 4 * 60_000)).toBe(false)
    expect(shouldRelock(s, t0 + 5 * 60_000)).toBe(true)
    expect(shouldRelock({ ...s, lockAfterMin: 0 }, t0 + 1000)).toBe(true)
    expect(shouldRelock({ ...s, lastHiddenAt: null }, t0 + 3_600_000)).toBe(false)
  })
})
