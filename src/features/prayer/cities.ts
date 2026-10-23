// Villes de la maquette (noms en français et en arabe).
export type City = { id: string; fr: string; ar: string; lat: number; lng: number; timezone: string }

export const CITIES: readonly City[] = [
  { id: 'nkc', fr: 'Nouakchott', ar: 'نواكشوط', lat: 18.0858, lng: -15.9785, timezone: 'Africa/Nouakchott' },
  { id: 'ndb', fr: 'Nouadhibou', ar: 'نواذيبو', lat: 20.931, lng: -17.0347, timezone: 'Africa/Nouakchott' },
  { id: 'ros', fr: 'Rosso', ar: 'روصو', lat: 16.5138, lng: -15.805, timezone: 'Africa/Nouakchott' },
  { id: 'kae', fr: 'Kaédi', ar: 'كيهيدي', lat: 16.15, lng: -13.505, timezone: 'Africa/Nouakchott' },
  { id: 'ale', fr: 'Aleg', ar: 'ألاك', lat: 17.05, lng: -13.9167, timezone: 'Africa/Nouakchott' },
  { id: 'kif', fr: 'Kiffa', ar: 'كيفة', lat: 16.62, lng: -11.4044, timezone: 'Africa/Nouakchott' },
  { id: 'sel', fr: 'Sélibaby', ar: 'سيلبابي', lat: 15.159, lng: -12.1843, timezone: 'Africa/Nouakchott' },
  { id: 'nem', fr: 'Néma', ar: 'النعمة', lat: 16.617, lng: -7.25, timezone: 'Africa/Nouakchott' },
  { id: 'ata', fr: 'Atar', ar: 'أطار', lat: 20.517, lng: -13.0499, timezone: 'Africa/Nouakchott' },
  { id: 'chi', fr: 'Chinguetti', ar: 'شنقيط', lat: 20.46, lng: -12.36, timezone: 'Africa/Nouakchott' },
  { id: 'zou', fr: 'Zouérate', ar: 'ازويرات', lat: 22.7354, lng: -12.4713, timezone: 'Africa/Nouakchott' },
  { id: 'dkr', fr: 'Dakar', ar: 'داكار', lat: 14.7167, lng: -17.4677, timezone: 'Africa/Dakar' },
  { id: 'cas', fr: 'Casablanca', ar: 'الدار البيضاء', lat: 33.5731, lng: -7.5898, timezone: 'Africa/Casablanca' },
  { id: 'par', fr: 'Paris', ar: 'باريس', lat: 48.8566, lng: 2.3522, timezone: 'Europe/Paris' },
  { id: 'mak', fr: 'La Mecque', ar: 'مكة المكرمة', lat: 21.4225, lng: 39.8262, timezone: 'Asia/Riyadh' },
  { id: 'med', fr: 'Médine', ar: 'المدينة المنورة', lat: 24.4686, lng: 39.6142, timezone: 'Asia/Riyadh' },
]

export const CUSTOM_CITY_ID = 'custom'

export type Place = { cityId: string; lat: number; lng: number; timezone: string }

/** Lieu utilisé pour les calculs : la position personnalisée si elle est choisie, sinon la ville. */
export function resolvePlace(s: {
  cityId: string
  custom: { lat: number; lng: number; timezone: string } | null
}): Place {
  if (s.cityId === CUSTOM_CITY_ID && s.custom && Number.isFinite(s.custom.lat) && Number.isFinite(s.custom.lng)) {
    return { cityId: CUSTOM_CITY_ID, ...s.custom }
  }
  const c = CITIES.find((x) => x.id === s.cityId) ?? CITIES[0]
  return { cityId: c.id, lat: c.lat, lng: c.lng, timezone: c.timezone }
}

export function findCity(id: string): City | undefined {
  return CITIES.find((c) => c.id === id)
}
