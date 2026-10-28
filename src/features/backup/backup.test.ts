import { beforeEach, describe, expect, it } from 'vitest'

import { db } from '@/db/db'
import { getSettings, updateSettings } from '@/db/settings'

import { buildBackup, fromMockup, importBackup, parseBackup } from './backup'

beforeEach(async () => {
  await Promise.all(db.tables.map((t) => t.clear()))
})

// Extrait au format d'export de la maquette (window.claude n'est pas utilisé : c'est le fichier téléchargé).
const MOCKUP = {
  app: 'ELHADJ',
  exportedAt: '2026-10-20T10:00:00.000Z',
  profile: {
    v: 1,
    name: 'Elhadj',
    cityId: 'ndb',
    custom: null,
    method: 'uqa',
    asr: 2,
    tune: { fajr: 2, sunrise: 0, dhuhr: 1, asr: 0, maghrib: 0, isha: 0 },
    hijriAdj: -1,
    currency: 'UM',
    budgets: { food: 30000 },
    qada: 3,
    quran: { goal: 5, page: 120, total: 604, khatmas: 1 },
    habits: [
      { id: 'h1', k: 'sport' },
      { id: 'hx', name: 'Méditer' },
    ],
  },
  days: {
    '2026-10-19': {
      date: '2026-10-19',
      prayers: { fajr: 'jamaa', asr: 'missed' },
      quran: 6,
      fast: true,
      tsbBy: { 0: 33 },
      tasbih: 33,
      journal: { good: 'ma famille', better: '' },
    },
  },
  months: {
    '2026-10': {
      month: '2026-10',
      items: [
        { id: 't1', type: 'out', amt: 1500, cat: 'food', pay: 'bankily', note: 'Pain', date: '2026-10-19', ts: 5 },
        {
          id: 't2',
          type: 'out',
          amt: 40000,
          cat: 'home',
          pay: 'cash',
          note: 'Loyer',
          date: '2026-10-05',
          ts: 6,
          rec: 'r1',
        },
      ],
    },
  },
  projects: {
    p1: {
      id: 'p1',
      name: 'Ouvrir ma boutique',
      why: 'Nourrir ma famille',
      color: '--c1',
      status: 'active',
      deadline: '2026-12-01',
      created: 1,
      tasks: [
        { id: 'k1', t: 'Trouver un local', done: true, doneAt: '2026-10-19' },
        { id: 'k2', t: 'Faire les papiers', done: false, due: '2026-11-01' },
      ],
    },
  },
  finance: {
    debts: {
      items: [
        {
          id: 'd1',
          dir: 'in',
          person: 'Ahmed',
          amt: 5000,
          due: '',
          note: '',
          paid: [{ amt: 1000, date: '2026-10-10' }],
          closed: false,
        },
      ],
    },
    goals: {
      items: [
        {
          id: 'g1',
          name: 'Omra',
          target: 900000,
          deadline: '2027-06-01',
          color: '--c7',
          adds: [{ amt: 100000, date: '2026-10-01' }],
        },
      ],
    },
    recurring: {
      items: [
        {
          id: 'r1',
          type: 'out',
          name: 'Loyer',
          amt: 40000,
          cat: 'home',
          pay: 'cash',
          day: 5,
          on: true,
          last: '2026-10',
        },
      ],
    },
  },
}

describe('sauvegarde', () => {
  it('convertit le JSON de la maquette selon la table de correspondance', () => {
    const b = fromMockup(MOCKUP, 1000)
    expect(b.settings).toMatchObject({
      name: 'Elhadj',
      cityId: 'ndb',
      method: 'uqa',
      asrSchool: 'hanafi',
      hijriAdj: -1,
      qada: 3,
      quran: { goal: 5, page: 120, total: 604, khatmas: 1 },
      habits: [
        { id: 'h1', key: 'sport' },
        { id: 'hx', name: 'Méditer' },
      ],
    })
    expect(b.days[0]).toMatchObject({ id: '2026-10-19', quranPages: 6, fasted: true, tasbihBy: { 0: 33 }, dirty: 1 })
    expect(b.transactions.find((t) => t.id === 't2')).toMatchObject({
      amount: 40000,
      category: 'home',
      recurringId: 'r1',
    })
    expect(b.projects[0]).toMatchObject({ id: 'p1', intention: 'Nourrir ma famille', status: 'active' })
    expect(b.tasks.map((t) => [t.title, t.done, t.doneAt, t.due])).toEqual([
      ['Trouver un local', true, '2026-10-19', ''],
      ['Faire les papiers', false, null, '2026-11-01'],
    ])
    expect(b.debts[0]).toMatchObject({
      direction: 'in',
      amount: 5000,
      payments: [{ amount: 1000, date: '2026-10-10' }],
    })
    expect(b.savingsGoals[0]).toMatchObject({ target: 900000, moves: [{ amount: 100000, date: '2026-10-01' }] })
    expect(b.recurring[0]).toMatchObject({ amount: 40000, day: 5, active: true, lastMonth: '2026-10' })
  })

  it('reconnaît les deux formats et refuse un fichier inconnu', () => {
    expect(parseBackup(JSON.stringify(MOCKUP)).projects).toHaveLength(1)
    expect(() => parseBackup('pas du json')).toThrow()
    expect(() => parseBackup('{"autre":1}')).toThrow()
  })

  it('export puis import : aller-retour sans perte, inscription conservée', async () => {
    await updateSettings({ onboarded: true, name: 'Aïcha' })
    const summary = await importBackup(parseBackup(JSON.stringify(MOCKUP)))
    expect(summary).toMatchObject({
      days: 1,
      transactions: 2,
      projects: 1,
      tasks: 2,
      debts: 1,
      savingsGoals: 1,
      recurring: 1,
    })
    const s = await getSettings()
    expect(s.onboarded).toBe(true)
    expect(s.name).toBe('Elhadj')

    const exported = JSON.stringify(await buildBackup())
    await Promise.all(db.tables.map((t) => t.clear()))
    await importBackup(parseBackup(exported))
    const again = await buildBackup()
    expect(again.transactions.map((t) => t.id).sort()).toEqual(['t1', 't2'])
    expect(again.tasks).toHaveLength(2)
    expect((await getSettings()).quran.khatmas).toBe(1)
  })

  it('le code à 4 chiffres n’est jamais dans la sauvegarde', async () => {
    await db.security.put({
      id: 'device',
      salt: 'c2Vs',
      hash: 'aGFzaA==',
      iterations: 210000,
      failedCount: 0,
      lockedUntil: 0,
      lastHiddenAt: null,
      lockAfterMin: 5,
      passkey: { id: 'cred', publicKey: 'cGs', alg: -7 },
    })
    const text = JSON.stringify(await buildBackup())
    expect(text).not.toContain('aGFzaA==')
    expect(text).not.toContain('cGs')
    expect(text).not.toContain('security')
  })
})
