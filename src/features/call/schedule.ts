import { PRAYERS, type CallSettings, type Prayer } from '@/db/types'
import type { DayTimes } from '@/features/prayer/times'
import { readLocal, writeLocal } from '@/lib/storage'

/** Journal local des appels déjà faits aujourd'hui (une seule fois par prière et par jour). */
export type CallLog = { date: string; prayers: Prayer[] }

const KEY = 'elhadj.callLog'

/** Le journal repart à zéro quand le jour change (jour calculé dans le fuseau de la ville). */
export function readCallLog(dayKey: string): CallLog {
  try {
    const log = JSON.parse(readLocal(KEY) ?? 'null') as CallLog | null
    if (log && log.date === dayKey && Array.isArray(log.prayers)) return log
  } catch {
    // journal illisible : on repart de zéro
  }
  return { date: dayKey, prayers: [] }
}

export function logCall(dayKey: string, prayer: Prayer): void {
  const log = readCallLog(dayKey)
  if (!log.prayers.includes(prayer)) log.prayers.push(prayer)
  writeLocal(KEY, JSON.stringify(log))
}

/**
 * Prière à annoncer maintenant : l'heure de l'adhan moins N minutes est atteinte, l'adhan n'est pas encore passé,
 * la prière est cochée et pas encore annoncée aujourd'hui.
 */
export function dueCall(now: Date, times: DayTimes, call: CallSettings, log: CallLog): Prayer | null {
  if (!call.enabled) return null
  const t = now.getTime()
  const before = Math.min(15, Math.max(1, call.minutesBefore)) * 60_000
  for (const p of PRAYERS) {
    if (!call.prayers[p] || log.prayers.includes(p)) continue
    const adhan = times[p].getTime()
    if (t >= adhan - before && t < adhan) return p
  }
  return null
}
