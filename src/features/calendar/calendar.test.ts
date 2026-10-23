import { describe, expect, it } from 'vitest'

import { fastInfo, isSunnaFast } from './fasting'
import { formatHijri, hijriDate } from './hijri'

describe('calendrier hégirien', () => {
  it('le 23 octobre 2026 est le 12 Joumada al-oula 1448', () => {
    const h = hijriDate('2026-10-23')
    expect(h).toEqual({ d: 12, m: 5, y: 1448 })
    expect(formatHijri(h!, 'fr')).toBe('12 Joumada al-oula 1448')
    expect(formatHijri(h!, 'ar')).toBe('12 جمادى الأولى 1448 هـ')
  })

  it('applique le décalage de −2 à +2 jours', () => {
    expect(hijriDate('2026-10-23', 1)?.d).toBe(13)
    expect(hijriDate('2026-10-23', -2)?.d).toBe(10)
  })
})

describe('jeûnes sunna', () => {
  it('le 24 octobre 2026 est le premier des jours blancs', () => {
    expect(fastInfo('2026-10-23').reasons).not.toContain('white')
    expect(fastInfo('2026-10-24').reasons).toContain('white')
    expect(fastInfo('2026-10-26').reasons).toEqual(['white', 'mon'])
    expect(fastInfo('2026-10-27').reasons).not.toContain('white')
  })

  it('propose le lundi et le jeudi', () => {
    expect(fastInfo('2026-10-19').reasons).toContain('mon')
    expect(fastInfo('2026-10-22').reasons).toContain('thu')
    expect(isSunnaFast(fastInfo('2026-10-22'))).toBe(true)
    expect(isSunnaFast(fastInfo('2026-10-23'))).toBe(false)
  })

  it('reconnaît ‘Arafa, Tâsû‘a et ‘Âchoura', () => {
    // Trouve les jours voulus par le calendrier lui-même pour ne pas dépendre d'une table.
    const find = (m: number, d: number) => {
      for (let i = 0; i < 400; i++) {
        const k = new Date(Date.UTC(2026, 9, 23 + i)).toISOString().slice(0, 10)
        const h = hijriDate(k)
        if (h?.m === m && h.d === d) return k
      }
      throw new Error('introuvable')
    }
    expect(fastInfo(find(12, 9)).reasons).toContain('arafa')
    expect(fastInfo(find(1, 9)).reasons).toContain('tasua')
    expect(fastInfo(find(1, 10)).reasons).toContain('ashura')
    expect(fastInfo(find(9, 5)).reasons).toContain('ramadan')
    expect(isSunnaFast(fastInfo(find(9, 5)))).toBe(false)
    // Jamais l'Aïd al-Fitr, ni du 10 au 13 Dhou al-hijja
    for (const [m, d] of [
      [10, 1],
      [12, 10],
      [12, 11],
      [12, 12],
      [12, 13],
    ]) {
      expect(fastInfo(find(m, d))).toEqual({ forbidden: true, reasons: [] })
    }
  })
})
