import { describe, expect, it } from 'vitest'

import { DEFAULT_SETTINGS } from '@/db/settings'
import { resolvePlace } from '@/features/prayer/cities'
import { prayerTimesFor } from '@/features/prayer/times'

import { atLocalTime, dueNotifications, type UserContext } from '../../supabase/functions/send-prayer-push/logic'

const place = resolvePlace({ cityId: 'nkc', custom: null })
// Vendredi 23 octobre 2026, Nouakchott (UTC+0)
const t = prayerTimesFor('2026-10-23', place, DEFAULT_SETTINGS)
const base: UserContext = {
  name: 'Elhadj',
  nameAr: 'الحاج',
  timezone: place.timezone,
  notif: { ...DEFAULT_SETTINGS.notif, enabled: true },
  call: { ...DEFAULT_SETTINGS.call },
  weekday: 5,
  ramadan: false,
  lang: 'fr',
}
const at = (d: Date, minutes: number) => new Date(d.getTime() + minutes * 60_000 + 20_000) // 20 s dans la minute
const kinds = (now: Date, ctx = base) => dueNotifications(now, t, ctx).map((n) => n.kind)

describe('notifications du serveur', () => {
  it('appel personnel 3 min avant, alerte d’adhan à l’heure', () => {
    expect(kinds(at(t.asr, -3))).toEqual(['call:asr'])
    expect(kinds(at(t.asr, 0))).toEqual(['adhan:asr'])
    expect(kinds(at(t.asr, -2))).toEqual([])
  })

  it('une seule notification quand l’appel et l’alerte tombent à la même minute', () => {
    const ctx = { ...base, notif: { ...base.notif, minutesBefore: 3 as const } }
    expect(kinds(at(t.asr, -3), ctx)).toEqual(['call:asr'])
    expect(kinds(at(t.asr, -3), { ...ctx, call: { ...ctx.call, enabled: false } })).toEqual(['adhan:asr'])
  })

  it('textes : Joumou‘a le vendredi, en français et en arabe', () => {
    const [n] = dueNotifications(at(t.dhuhr, -3), t, base)
    expect(n.title).toBe('Elhadj, la prière')
    expect(n.body).toMatch(/^Joumou‘a à 12:4\d · dans 3 min$/)
    const [a] = dueNotifications(at(t.maghrib, 0), t, { ...base, lang: 'ar' })
    expect(a.title).toMatch(/^المغرب · 18:3\d$/)
    const [c] = dueNotifications(at(t.asr, -3), t, { ...base, lang: 'ar', nameAr: '' })
    expect(c.title).toBe('Elhadj، الصلاة')
  })

  it('prière décochée, notifications coupées', () => {
    const noAsr = { ...base, notif: { ...base.notif, prayers: { ...base.notif.prayers, asr: false } } }
    expect(kinds(at(t.asr, 0), noAsr)).toEqual([])
    const off = { ...base, notif: { ...base.notif, enabled: false }, call: { ...base.call, enabled: false } }
    expect(kinds(at(t.asr, 0), off)).toEqual([])
  })

  it('rappels : Al-Kahf vendredi 9 h, athkar au Chourouq et 30 min après Asr', () => {
    expect(kinds(atLocalTime(t.fajr, place.timezone, 9))).toContain('kahf')
    expect(kinds(atLocalTime(t.fajr, place.timezone, 9), { ...base, weekday: 4 })).not.toContain('kahf')
    const ctx = { ...base, notif: { ...base.notif, athkarMatin: true, athkarSoir: true } }
    expect(kinds(at(t.sunrise, 0), ctx)).toContain('athkar:matin')
    expect(kinds(at(t.asr, 30), ctx)).toContain('athkar:soir')
  })

  it('Ramadan : suhûr 45 min avant Fajr, iftar à Maghrib', () => {
    const ctx = { ...base, ramadan: true }
    expect(kinds(at(t.fajr, -45), ctx)).toContain('suhur')
    expect(kinds(at(t.maghrib, 0), ctx)).toContain('iftar')
    expect(kinds(at(t.maghrib, 0))).not.toContain('iftar')
  })
})
