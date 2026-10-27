import { beforeEach, describe, expect, it } from 'vitest'

import { DEFAULT_SETTINGS } from '@/db/settings'
import { resolvePlace } from '@/features/prayer/cities'
import { prayerTimesFor } from '@/features/prayer/times'

import { callBanner, callLangs, callPhrase, prayerAt } from './phrase'
import { dueCall, logCall, readCallLog } from './schedule'
import { isMaleVoice, pickVoice } from './speech'

const names = { name: 'Elhadj', nameAr: 'الحاج' }

describe('phrase de l’appel', () => {
  it('en français et en arabe, avec le prénom arabe ou à défaut le prénom latin', () => {
    expect(callPhrase('fr', names)).toBe('Elhadj, la prière')
    expect(callPhrase('ar', names)).toBe('الحاج، الصلاة')
    expect(callPhrase('ar', { name: 'Elhadj', nameAr: '' })).toBe('Elhadj، الصلاة')
    expect(callPhrase('ar', { name: 'الحاج', nameAr: ' ' })).toBe('الحاج، الصلاة')
  })

  it('bandeau, et Joumou‘a le vendredi', () => {
    expect(callBanner('fr', names, 'asr', '2026-10-22', '16:08')).toBe('Elhadj, la prière · Asr à 16:08')
    expect(callBanner('ar', names, 'asr', '2026-10-22', '16:08')).toBe('الحاج، الصلاة · العصر 16:08')
    expect(prayerAt('fr', 'dhuhr', '2026-10-23', '12:48')).toBe('Joumou‘a à 12:48')
    expect(prayerAt('ar', 'dhuhr', '2026-10-23', '12:48')).toBe('الجمعة 12:48')
    expect(prayerAt('fr', 'dhuhr', '2026-10-24', '12:49')).toBe('Dhohr à 12:49')
  })

  it('langues dites', () => {
    expect(callLangs('app', 'ar')).toEqual(['ar'])
    expect(callLangs('fr', 'ar')).toEqual(['fr'])
    expect(callLangs('both', 'ar')).toEqual(['fr', 'ar'])
  })
})

describe('déclenchement', () => {
  const t = prayerTimesFor('2026-10-23', resolvePlace({ cityId: 'nkc', custom: null }), DEFAULT_SETTINGS)
  const call = DEFAULT_SETTINGS.call
  const empty = { date: '2026-10-23', prayers: [] }
  const before = (min: number) => new Date(t.asr.getTime() - min * 60_000)

  beforeEach(() => localStorage.clear())

  it('se déclenche 3 minutes avant l’adhan, pas avant', () => {
    expect(dueCall(before(3.1), t, call, empty)).toBeNull()
    expect(dueCall(before(3), t, call, empty)).toBe('asr')
    expect(dueCall(before(1), t, call, empty)).toBe('asr')
    expect(dueCall(new Date(t.asr.getTime() + 1000), t, call, empty)).toBeNull()
  })

  it('une seule fois par prière et par jour', () => {
    logCall('2026-10-23', 'asr')
    expect(dueCall(before(2), t, call, readCallLog('2026-10-23'))).toBeNull()
  })

  it('rien si l’appel est désactivé ou la prière décochée', () => {
    expect(dueCall(before(2), t, { ...call, enabled: false }, empty)).toBeNull()
    expect(dueCall(before(2), t, { ...call, prayers: { ...call.prayers, asr: false } }, empty)).toBeNull()
  })

  it('respecte le nombre de minutes choisi', () => {
    expect(dueCall(before(10), t, { ...call, minutesBefore: 10 }, empty)).toBe('asr')
  })

  it('le journal repart à zéro au changement de jour', () => {
    logCall('2026-10-23', 'asr')
    expect(readCallLog('2026-10-23').prayers).toEqual(['asr'])
    expect(readCallLog('2026-10-24')).toEqual({ date: '2026-10-24', prayers: [] })
  })
})

describe('voix d’homme', () => {
  const v = (name: string, voiceURI = name) => ({ name, voiceURI })
  it('reconnaît les voix d’homme connues', () => {
    expect(isMaleVoice(v('Thomas'))).toBe(true)
    expect(isMaleVoice(v('Maged'))).toBe(true)
    expect(isMaleVoice(v('Microsoft Hamed Online (Natural) - Arabic (Saudi Arabia)'))).toBe(true)
    expect(isMaleVoice(v('Google français'))).toBe(false)
    expect(isMaleVoice(v('Amélie'))).toBe(false)
    expect(isMaleVoice(v('French Female'))).toBe(false)
    expect(isMaleVoice(v('Natalie'))).toBe(false)
  })
  it('prend la voix choisie, sinon une voix d’homme, sinon la première', () => {
    const voices = [v('Amélie'), v('Thomas'), v('Audrey')]
    expect(pickVoice(voices, 'Audrey')?.name).toBe('Audrey')
    expect(pickVoice(voices, null)?.name).toBe('Thomas')
    expect(pickVoice(voices, 'disparue')?.name).toBe('Thomas')
    expect(pickVoice([v('Amélie')], null)?.name).toBe('Amélie')
  })
})
