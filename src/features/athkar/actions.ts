import { updateDay } from '@/db/days'
import type { AthkarSet } from '@/db/types'

import { ATHKAR } from './data'
import { athkarProgress } from './progress'

export type TapResult = { count: number; done: boolean; seriesDone: boolean }

/** +1 sur un dhikr (jamais au-delà du nombre de répétitions). Renvoie null s'il était déjà terminé. */
export async function tapDhikr(dayKey: string, set: AthkarSet, index: number): Promise<TapResult | null> {
  const item = ATHKAR[set].items[index]
  let result: TapResult | null = null
  await updateDay(dayKey, (d) => {
    const counts = { ...d.athkar[set] }
    const c = counts[index] ?? 0
    if (c >= item.n) return {}
    counts[index] = c + 1
    const athkar = { ...d.athkar, [set]: counts }
    const p = athkarProgress(set, { athkar })
    result = { count: c + 1, done: c + 1 >= item.n, seriesDone: p.done === p.total }
    return { athkar }
  })
  return result
}

/** Remet une série à zéro pour la journée. */
export function resetAthkar(dayKey: string, set: AthkarSet) {
  return updateDay(dayKey, (d) => ({ athkar: { ...d.athkar, [set]: {} } }))
}

/** +1 au tasbih du jour (total et détail par formule). */
export function tapTasbih(dayKey: string, formula: number) {
  return updateDay(dayKey, (d) => ({
    tasbih: d.tasbih + 1,
    tasbihBy: { ...d.tasbihBy, [formula]: (d.tasbihBy[formula] ?? 0) + 1 },
  }))
}

/** Index du premier dhikr non terminé (0 si tout est terminé). */
export function firstUndone(set: AthkarSet, counts: Record<number, number> | undefined, after = -1): number {
  const items = ATHKAR[set].items
  const j = items.findIndex((it, i) => i > after && (counts?.[i] ?? 0) < it.n)
  if (j >= 0) return j
  const k = items.findIndex((it, i) => (counts?.[i] ?? 0) < it.n)
  return k >= 0 ? k : 0
}
