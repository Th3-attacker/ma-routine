import { db } from '@/db/db'
import { getDay } from '@/db/days'
import { getSettings } from '@/db/settings'
import type { Prayer, PrayerStatus } from '@/db/types'

/**
 * Change le statut d'une prière. Le qadâ' suit : +1 quand une prière passe à « Manquée »,
 * −1 quand elle quitte ce statut (jamais sous 0).
 */
export async function setPrayerStatus(dayKey: string, prayer: Prayer, status: PrayerStatus | null): Promise<void> {
  await db.transaction('rw', db.days, db.settings, async () => {
    const day = await getDay(dayKey)
    const before = day.prayers[prayer]
    if (before === (status ?? undefined)) return
    const prayers = { ...day.prayers }
    if (status) prayers[prayer] = status
    else delete prayers[prayer]
    const now = Date.now()
    await db.days.put({ ...day, prayers, updatedAt: now, dirty: 1 })

    const delta = (status === 'missed' ? 1 : 0) - (before === 'missed' ? 1 : 0)
    if (delta !== 0) {
      const s = await getSettings()
      await db.settings.put({ ...s, qada: Math.max(0, s.qada + delta), updatedAt: now, dirty: 1 })
    }
  })
}
