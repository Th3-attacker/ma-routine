import { db } from '@/db/db'
import { normalizeSettings } from '@/db/settings'
import type {
  Allocation,
  Day,
  Debt,
  Habit,
  HabitKey,
  Project,
  ProjectStatus,
  Recurring,
  SavingsGoal,
  Settings,
  Task,
  Transaction,
} from '@/db/types'
import { HABIT_KEYS, METHOD_IDS } from '@/db/types'
import { deviceTimezone } from '@/features/settings/form'

/** Contenu d'une sauvegarde ELHADJ (les préférences de l'appareil et le code ne sont jamais exportés). */
export type Backup = {
  app: 'ELHADJ'
  version: 1
  exportedAt: string
  settings: Partial<Settings>
  days: Day[]
  transactions: Transaction[]
  projects: Project[]
  tasks: Task[]
  debts: Debt[]
  savingsGoals: SavingsGoal[]
  recurring: Recurring[]
  /** Enveloppes du budget (absent des anciennes sauvegardes). */
  allocations: Allocation[]
}

const TABLES = [
  'days',
  'transactions',
  'projects',
  'tasks',
  'debts',
  'savingsGoals',
  'recurring',
  'allocations',
] as const
type TableName = (typeof TABLES)[number]

export async function buildBackup(): Promise<Backup> {
  const live = async <T extends { deleted: number }>(rows: Promise<T[]>) => (await rows).filter((r) => !r.deleted)
  return {
    app: 'ELHADJ',
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: (await db.settings.get('me')) ?? {},
    days: await live(db.days.toArray()),
    transactions: await live(db.transactions.toArray()),
    projects: await live(db.projects.toArray()),
    tasks: await live(db.tasks.toArray()),
    debts: await live(db.debts.toArray()),
    savingsGoals: await live(db.savingsGoals.toArray()),
    recurring: await live(db.recurring.toArray()),
    allocations: await live(db.allocations.toArray()),
  }
}

/** Télécharge la sauvegarde en fichier .json. */
export async function downloadBackup(today: string): Promise<void> {
  const data = JSON.stringify(await buildBackup(), null, 2)
  const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `elhadj-sauvegarde-${today}.json`
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ── Import du JSON de la maquette ──

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v)
const str = (v: unknown, d = '') => (typeof v === 'string' ? v : d)
const num = (v: unknown, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : Number(v) || d)
const int = (v: unknown) => Math.round(num(v))
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])
const meta = (now: number) => ({ updatedAt: now, deleted: 0 as const, dirty: 1 as const })
const ymd = (v: unknown) => (/^\d{4}-\d{2}-\d{2}$/.test(str(v)) ? str(v) : '')
const moves = (v: unknown) =>
  arr(v)
    .filter(isObj)
    .map((m) => ({ amount: int(m.amt), date: ymd(m.date) }))

function fromMockupProfile(p: Obj): Partial<Settings> {
  const custom = isObj(p.custom) && Number.isFinite(num(p.custom.lat, NaN)) && Number.isFinite(num(p.custom.lng, NaN))
  const habits: Habit[] = arr(p.habits)
    .filter(isObj)
    .map((h) => {
      const k = str(h.k)
      return HABIT_KEYS.includes(k as HabitKey)
        ? { id: str(h.id), key: k as HabitKey }
        : { id: str(h.id), name: str(h.name).slice(0, 50) }
    })
    .filter((h) => h.id)
  const quran = isObj(p.quran) ? p.quran : {}
  return {
    name: str(p.name).slice(0, 40),
    cityId: str(p.cityId, 'nkc'),
    custom: custom
      ? { lat: num((p.custom as Obj).lat), lng: num((p.custom as Obj).lng), timezone: deviceTimezone() }
      : null,
    method: METHOD_IDS.includes(str(p.method) as never) ? (str(p.method) as Settings['method']) : 'mwl',
    asrSchool: num(p.asr) === 2 ? 'hanafi' : 'standard',
    tune: isObj(p.tune)
      ? (Object.fromEntries(Object.entries(p.tune).map(([k, v]) => [k, int(v)])) as Settings['tune'])
      : undefined,
    hijriAdj: Math.max(-2, Math.min(2, int(p.hijriAdj))),
    currency: str(p.currency, 'UM') || 'UM',
    budgets: isObj(p.budgets) ? Object.fromEntries(Object.entries(p.budgets).map(([k, v]) => [k, int(v)])) : {},
    qada: Math.max(0, int(p.qada)),
    quran: {
      goal: Math.max(1, int(quran.goal) || 4),
      page: Math.max(1, int(quran.page) || 1),
      total: Math.max(1, int(quran.total) || 604),
      khatmas: Math.max(0, int(quran.khatmas)),
    },
    ...(habits.length ? { habits } : {}),
  }
}

function fromMockupDay(key: string, d: Obj, now: number): Day {
  return {
    id: key,
    ...meta(now),
    prayers: isObj(d.prayers) ? (d.prayers as Day['prayers']) : {},
    sunna: isObj(d.sunna) ? (d.sunna as Day['sunna']) : {},
    athkar: isObj(d.athkar) ? (d.athkar as Day['athkar']) : {},
    tasbih: int(d.tasbih),
    tasbihBy: isObj(d.tsbBy) ? (d.tsbBy as Day['tasbihBy']) : {},
    habits: isObj(d.habits) ? (d.habits as Day['habits']) : {},
    quranPages: int(d.quran),
    friday: isObj(d.friday) ? (d.friday as Day['friday']) : {},
    fasted: !!d.fast,
    tarawih: !!d.tarawih,
    journal: {
      good: str(isObj(d.journal) ? d.journal.good : '').slice(0, 300),
      better: str(isObj(d.journal) ? d.journal.better : '').slice(0, 300),
    },
  }
}

/** Convertit le JSON exporté par la maquette (profile, days, months, projects, finance) en sauvegarde ELHADJ. */
export function fromMockup(json: Obj, now = Date.now()): Backup {
  const days = isObj(json.days)
    ? Object.entries(json.days)
        .filter(([k, v]) => /^\d{4}-\d{2}-\d{2}$/.test(k) && isObj(v))
        .map(([k, v]) => fromMockupDay(k, v as Obj, now))
    : []
  const transactions: Transaction[] = isObj(json.months)
    ? Object.values(json.months)
        .filter(isObj)
        .flatMap((m) => arr(m.items))
        .filter(isObj)
        .filter((it) => ymd(it.date) && int(it.amt) > 0)
        .map((it) => ({
          id: str(it.id) || `m${Math.random().toString(36).slice(2, 10)}`,
          ...meta(now),
          type: it.type === 'in' ? 'in' : 'out',
          amount: int(it.amt),
          category: str(it.cat, 'other'),
          payMethod: str(it.pay, 'cash'),
          note: str(it.note).slice(0, 80),
          date: ymd(it.date),
          createdAt: num(it.ts, now),
          ...(str(it.rec) ? { recurringId: str(it.rec) } : {}),
        }))
    : []
  const projects: Project[] = []
  const tasks: Task[] = []
  if (isObj(json.projects)) {
    for (const p of Object.values(json.projects).filter(isObj)) {
      if (!str(p.id) || !str(p.name)) continue
      const status = (['active', 'paused', 'done'] as const).includes(str(p.status) as ProjectStatus)
        ? (str(p.status) as ProjectStatus)
        : 'active'
      projects.push({
        id: str(p.id),
        ...meta(now),
        name: str(p.name).slice(0, 80),
        intention: str(p.why).slice(0, 200),
        deadline: ymd(p.deadline),
        color: str(p.color, '--c2'),
        status,
        createdAt: num(p.created, now),
      })
      arr(p.tasks)
        .filter(isObj)
        .forEach((t, i) =>
          tasks.push({
            id: str(t.id) || `${str(p.id)}-${i}`,
            ...meta(now),
            projectId: str(p.id),
            title: str(t.t).slice(0, 120),
            done: !!t.done,
            due: ymd(t.due),
            position: i,
            doneAt: ymd(t.doneAt) || null,
          }),
        )
    }
  }
  const fin = isObj(json.finance) ? json.finance : {}
  const items = (k: string) => (isObj(fin[k]) ? arr((fin[k] as Obj).items).filter(isObj) : [])
  const debts: Debt[] = items('debts').map((d) => ({
    id: str(d.id),
    ...meta(now),
    direction: d.dir === 'in' ? 'in' : 'out',
    person: str(d.person).slice(0, 60),
    amount: int(d.amt),
    due: ymd(d.due),
    note: str(d.note).slice(0, 80),
    payments: moves(d.paid),
    closed: !!d.closed,
    createdAt: num(d.created, now),
  }))
  const savingsGoals: SavingsGoal[] = items('goals').map((g) => ({
    id: str(g.id),
    ...meta(now),
    name: str(g.name).slice(0, 60),
    target: int(g.target),
    deadline: ymd(g.deadline),
    color: str(g.color, '--c7'),
    moves: moves(g.adds),
    createdAt: num(g.created, now),
  }))
  const recurring: Recurring[] = items('recurring').map((r) => ({
    id: str(r.id),
    ...meta(now),
    type: r.type === 'in' ? 'in' : 'out',
    name: str(r.name).slice(0, 60),
    amount: int(r.amt),
    category: str(r.cat, 'bills'),
    payMethod: str(r.pay, 'cash'),
    day: Math.max(1, Math.min(28, int(r.day) || 1)),
    active: r.on !== false,
    lastMonth: /^\d{4}-\d{2}$/.test(str(r.last)) ? str(r.last) : '',
  }))
  return {
    app: 'ELHADJ',
    version: 1,
    exportedAt: new Date(now).toISOString(),
    settings: isObj(json.profile) ? fromMockupProfile(json.profile) : {},
    days,
    transactions,
    projects,
    tasks,
    debts: debts.filter((d) => d.id),
    savingsGoals: savingsGoals.filter((g) => g.id),
    recurring: recurring.filter((r) => r.id),
    allocations: [],
  }
}

export type ImportSummary = Record<TableName, number>

/** Lit un fichier : sauvegarde ELHADJ, ou export de la maquette. Lève une erreur si le format est inconnu. */
export function parseBackup(text: string): Backup {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error('invalid')
  }
  if (!isObj(json)) throw new Error('invalid')
  if (json.app === 'ELHADJ' && json.version === 1 && isObj(json.settings)) {
    const b = json as Obj
    return {
      ...(b as unknown as Backup),
      ...Object.fromEntries(TABLES.map((t) => [t, arr(b[t]).filter(isObj)])),
    } as Backup
  }
  if (isObj(json.profile) || isObj(json.days) || isObj(json.months)) return fromMockup(json)
  throw new Error('invalid')
}

/**
 * Importe une sauvegarde en fusionnant : chaque ligne du fichier remplace celle qui a le même identifiant.
 * Les réglages du fichier complètent les réglages actuels ; l'inscription reste faite (pas de nouvel écran d'accueil).
 */
export async function importBackup(b: Backup): Promise<ImportSummary> {
  const now = Date.now()
  const touch = <T extends object>(rows: T[]) =>
    rows.map((r) => ({ ...r, updatedAt: now, dirty: 1 as const, deleted: 0 as const }))
  await db.transaction('rw', [db.settings, ...TABLES.map((t) => db[t])], async () => {
    const current = await db.settings.get('me')
    await db.settings.put({
      ...normalizeSettings({ ...current, ...b.settings }),
      id: 'me',
      onboarded: true,
      updatedAt: now,
      dirty: 1,
      deleted: 0,
    })
    await db.days.bulkPut(touch(b.days))
    await db.transactions.bulkPut(touch(b.transactions))
    await db.projects.bulkPut(touch(b.projects))
    await db.tasks.bulkPut(touch(b.tasks))
    await db.debts.bulkPut(touch(b.debts))
    await db.savingsGoals.bulkPut(touch(b.savingsGoals))
    await db.recurring.bulkPut(touch(b.recurring))
    // Seulement des lignes « YYYY-MM » avec des montants entiers positifs.
    await db.allocations.bulkPut(
      touch(
        b.allocations
          .filter((a) => typeof a.id === 'string' && /^\d{4}-\d{2}$/.test(a.id) && isObj(a.amounts))
          .map((a) => ({
            id: a.id,
            amounts: Object.fromEntries(Object.entries(a.amounts).filter(([, v]) => Number.isInteger(v) && v > 0)),
          })),
      ),
    )
  })
  return Object.fromEntries(TABLES.map((t) => [t, b[t].length])) as ImportSummary
}
