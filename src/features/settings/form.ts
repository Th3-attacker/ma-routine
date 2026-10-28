import { z } from 'zod'

import type { Habit, Settings } from '@/db/types'
import { CUSTOM_CITY_ID } from '@/features/prayer/cities'

// Les messages d'erreur sont des clés i18n (« errors.range?min=1&max=2000 »), traduites à l'affichage.
const err = (key: string, params?: Record<string, number>) =>
  params
    ? `errors.${key}?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))}`
    : `errors.${key}`

/** Lit un nombre tapé au clavier (accepte la virgule). */
export function parseNumber(v: string): number {
  const s = v.trim().replace(/\s/g, '').replace(',', '.')
  return s === '' ? NaN : Number(s)
}

const intIn = (min: number, max: number) =>
  z.string().refine(
    (v) => {
      const n = parseNumber(v)
      return Number.isInteger(n) && n >= min && n <= max
    },
    err('range', { min, max }),
  )

const optionalCoord = (max: number) =>
  z.string().refine((v) => {
    if (v.trim() === '') return true
    const n = parseNumber(v)
    return Number.isFinite(n) && Math.abs(n) <= max
  }, err('coords'))

export const settingsFormSchema = z
  .object({
    name: z.string().max(40, err('tooLong', { max: 40 })),
    nameAr: z.string().max(40, err('tooLong', { max: 40 })),
    cityId: z.string().min(1, err('required')),
    lat: optionalCoord(66),
    lng: optionalCoord(180),
    hijriAdj: z.enum(['-2', '-1', '0', '1', '2']),
    currency: z
      .string()
      .trim()
      .max(6, err('tooLong', { max: 6 })),
    goal: intIn(1, 2000),
    page: intIn(1, 2000),
    total: intIn(1, 2000),
    habits: z.string(),
  })
  .superRefine((v, ctx) => {
    if (v.cityId === CUSTOM_CITY_ID && (v.lat.trim() === '' || v.lng.trim() === '')) {
      ctx.addIssue({ code: 'custom', path: ['cityId'], message: err('position') })
    }
    if (parseNumber(v.page) > parseNumber(v.total)) {
      ctx.addIssue({ code: 'custom', path: ['page'], message: err('pageAfterTotal') })
    }
  })

export type SettingsFormValues = z.input<typeof settingsFormSchema>

/** Le sous-ensemble des réglages modifié par le formulaire (aussi utilisé par l'écran d'accueil). */
export type SettingsFormSource = Pick<
  Settings,
  'name' | 'nameAr' | 'cityId' | 'custom' | 'hijriAdj' | 'currency' | 'quran' | 'habits'
>

export function toFormValues(s: SettingsFormSource, habitName: (h: Habit) => string): SettingsFormValues {
  return {
    name: s.name,
    nameAr: s.nameAr,
    cityId: s.cityId,
    lat: s.custom ? String(s.custom.lat) : '',
    lng: s.custom ? String(s.custom.lng) : '',
    hijriAdj: String(Math.min(2, Math.max(-2, s.hijriAdj))) as SettingsFormValues['hijriAdj'],
    currency: s.currency,
    goal: String(s.quran.goal),
    page: String(s.quran.page),
    total: String(s.quran.total),
    habits: s.habits.map(habitName).join('\n'),
  }
}

const newId = () => `h${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

/**
 * Habitudes tapées une par ligne : une ligne identique au nom affiché d'une habitude existante la garde
 * (avec sa clé traduite et son historique) ; une nouvelle ligne devient une habitude en texte libre.
 */
export function habitsFromLines(text: string, old: readonly Habit[], habitName: (h: Habit) => string): Habit[] {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 12)
  return lines.map((line) => old.find((h) => habitName(h) === line) ?? { id: newId(), name: line.slice(0, 50) })
}

/** Valeurs validées → modification des réglages. `timezone` : fuseau de l'appareil, pour « Autre lieu ». */
export function fromFormValues(
  v: SettingsFormValues,
  current: SettingsFormSource,
  habitName: (h: Habit) => string,
  timezone: string,
): Partial<Settings> {
  const lat = parseNumber(v.lat)
  const lng = parseNumber(v.lng)
  const total = parseNumber(v.total)
  return {
    name: v.name.trim(),
    nameAr: v.nameAr.trim(),
    cityId: v.cityId,
    custom: Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng, timezone } : current.custom,
    hijriAdj: Number(v.hijriAdj),
    currency: v.currency.trim() || 'UM',
    quran: {
      ...current.quran,
      total,
      goal: Math.min(parseNumber(v.goal), total),
      page: Math.min(parseNumber(v.page), total),
    },
    habits: habitsFromLines(v.habits, current.habits, habitName),
  }
}

export function deviceTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}
