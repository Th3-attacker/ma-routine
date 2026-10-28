import { PRAYERS, type Day, type Settings } from '@/db/types'
import { athkarProgress } from '@/features/athkar/progress'

export type Recap = {
  prayed: number
  jamaa: number
  missed: number
  unmarked: number
  athkarSets: number
  quranPages: number
  quranGoal: number
  habitsDone: number
  habitsTotal: number
  stepsDone: number
  spent: number
}

export function eveningRecap(
  day: Pick<Day, 'prayers' | 'athkar' | 'quranPages' | 'habits'>,
  settings: Pick<Settings, 'quran' | 'habits'>,
  stepsDone: number,
  spent: number,
): Recap {
  const statuses = PRAYERS.map((p) => day.prayers[p])
  const sets = (['matin', 'soir'] as const).filter((s) => {
    const p = athkarProgress(s, day)
    return p.done === p.total
  }).length
  return {
    prayed: statuses.filter((s) => s && s !== 'missed').length,
    jamaa: statuses.filter((s) => s === 'jamaa').length,
    missed: statuses.filter((s) => s === 'missed').length,
    unmarked: statuses.filter((s) => !s).length,
    athkarSets: sets,
    quranPages: day.quranPages,
    quranGoal: Math.max(1, settings.quran.goal),
    habitsDone: settings.habits.filter((h) => day.habits[h.id]).length,
    habitsTotal: settings.habits.length,
    stepsDone,
    spent,
  }
}

/** Message bienveillant : prières à marquer, sinon prières manquées, sinon tout est accompli. */
export function recapMessage(r: Pick<Recap, 'unmarked' | 'missed'>): {
  key: 'unmarked' | 'missed' | 'allDone'
  count: number
} {
  if (r.unmarked) return { key: 'unmarked', count: r.unmarked }
  if (r.missed) return { key: 'missed', count: r.missed }
  return { key: 'allDone', count: 0 }
}

export function isEvening(now: Date, times: { isha: Date; fajr: Date }): boolean {
  return now.getTime() >= times.isha.getTime() || now.getTime() < times.fajr.getTime()
}
