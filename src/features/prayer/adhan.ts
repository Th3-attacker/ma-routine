// L'adhan joué par l'app : exemple à écouter (Réglages) et adhan à l'heure de la prière quand l'app est à l'écran.
// Un site web ne peut pas mettre ce son dans une notification (app fermée) : elle garde le son du téléphone.

import { useSyncExternalStore } from 'react'

import adhanUrl from '@/assets/adhan/adhan-exemple.mp3'
import { PRAYERS, type Prayer } from '@/db/types'
import type { DayTimes } from '@/features/prayer/times'
import { readLocal, writeLocal } from '@/lib/storage'

/** Préférence de l'appareil : jouer l'adhan à l'heure quand l'app est ouverte (oui par défaut). */
export const ADHAN_SOUND_KEY = 'elhadj.adhanSound'
export const adhanSoundOn = () => readLocal(ADHAN_SOUND_KEY) !== '0'

let audio: HTMLAudioElement | null = null
let playing = false
const listeners = new Set<() => void>()
const set = (p: boolean) => {
  playing = p
  for (const l of listeners) l()
}

/** Lecteur unique de l'adhan (le même pour l'exemple et l'heure de la prière). */
export const adhanPlayer = {
  async play(): Promise<void> {
    audio ??= Object.assign(new Audio(adhanUrl), { onended: () => set(false), onpause: () => set(false) })
    audio.currentTime = 0
    await audio.play()
    set(true)
  },
  stop() {
    audio?.pause()
    set(false)
  },
}

export function useAdhanPlaying(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => playing,
  )
}

/** Prochaine prière (Chourouq exclu) après `now`, dans la journée ou le Fajr du lendemain. */
export function nextAdhan(now: Date, today: DayTimes, tomorrow: DayTimes): { prayer: Prayer; at: Date } {
  for (const p of PRAYERS) if (today[p].getTime() > now.getTime()) return { prayer: p, at: today[p] }
  return { prayer: 'fajr', at: tomorrow.fajr }
}

const LOG_KEY = 'elhadj.adhanLog'

/** Une seule fois par prière et par jour : renvoie false si l'adhan de cette prière a déjà été joué. */
export function markAdhan(day: string, prayer: Prayer): boolean {
  let log: { day: string; prayers: Prayer[] } = { day, prayers: [] }
  try {
    const saved = JSON.parse(readLocal(LOG_KEY) ?? '{}') as typeof log
    if (saved.day === day && Array.isArray(saved.prayers)) log = saved
  } catch {
    // journal illisible : on repart de zéro
  }
  if (log.prayers.includes(prayer)) return false
  writeLocal(LOG_KEY, JSON.stringify({ day, prayers: [...log.prayers, prayer] }))
  return true
}
