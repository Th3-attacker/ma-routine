import { CalculationMethod, CalculationParameters, Coordinates, Madhab, PrayerTimes } from 'adhan'

import type { AsrSchool, MethodId, PrayerOrSunrise } from '@/db/types'
import { parseKey } from '@/lib/dates'

import type { Place } from './cities'

export const TIME_KEYS: readonly PrayerOrSunrise[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']

export type DayTimes = Record<PrayerOrSunrise, Date>

export type CalcSettings = {
  method: MethodId
  asrSchool: AsrSchool
  tune: Record<PrayerOrSunrise, number>
}

function methodParams(id: MethodId): CalculationParameters {
  switch (id) {
    case 'uqa':
      return CalculationMethod.UmmAlQura()
    case 'egy':
      return CalculationMethod.Egyptian()
    case 'kar':
      return CalculationMethod.Karachi()
    case 'isna':
      return CalculationMethod.NorthAmerica()
    case 'uoif': {
      // Pas de préréglage UOIF dans adhan : 12° / 12°.
      const p = CalculationMethod.Other()
      p.fajrAngle = 12
      p.ishaAngle = 12
      return p
    }
    default:
      return CalculationMethod.MuslimWorldLeague()
  }
}

/** Horaires d'un jour 'YYYY-MM-DD' au lieu donné (instants absolus, à afficher dans le fuseau du lieu). */
export function prayerTimesFor(key: string, place: Place, s: CalcSettings): DayTimes {
  const params = methodParams(s.method)
  params.madhab = s.asrSchool === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi
  params.adjustments = { ...params.adjustments, ...s.tune }
  const { y, m, d } = parseKey(key)
  // adhan lit l'année, le mois et le jour avec les getters locaux : on construit donc la date en heure locale.
  const pt = new PrayerTimes(new Coordinates(place.lat, place.lng), new Date(y, m - 1, d), params)
  return {
    fajr: pt.fajr,
    sunrise: pt.sunrise,
    dhuhr: pt.dhuhr,
    asr: pt.asr,
    maghrib: pt.maghrib,
    isha: pt.isha,
  }
}
