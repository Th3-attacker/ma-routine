import { describe, expect, it } from 'vitest'

import { dayKey, formatLongDate } from './dates'

// 23 octobre 2026, 20 h à Nouakchott (UTC+0)
const d = new Date('2026-10-23T20:00:00Z')

describe('dates', () => {
  it('formate en français avec une majuscule', () => {
    expect(formatLongDate(d, 'fr')).toBe('Vendredi 23 octobre')
  })

  it('formate en arabe avec les mois mauritaniens et des chiffres latins', () => {
    const s = formatLongDate(d, 'ar')
    expect(s).toContain('23')
    expect(s).toContain('أكتوبر')
    expect(s).not.toMatch(/[٠-٩]/)
  })

  it('calcule le jour dans le fuseau donné', () => {
    expect(dayKey(d, 'Africa/Nouakchott')).toBe('2026-10-23')
    expect(dayKey(d, 'Asia/Riyadh')).toBe('2026-10-23')
    expect(dayKey(d, 'Pacific/Auckland')).toBe('2026-10-24')
  })
})
