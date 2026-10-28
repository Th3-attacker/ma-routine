import { describe, expect, it } from 'vitest'

import { formatSources, HISN, normalizeSearch, searchHisn, SOURCES } from './hisn'

describe('Hisn al-Muslim', () => {
  it('a des chapitres uniques, non vides, avec des recueils connus', () => {
    const ids = HISN.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const c of HISN) {
      expect(c.items.length).toBeGreaterThan(0)
      for (const d of c.items) {
        expect(d.n).toBeGreaterThanOrEqual(1)
        expect(d.src.length).toBeGreaterThan(0)
        for (const s of d.src) expect(SOURCES[s]).toBeDefined()
      }
    }
  })

  it('cherche sans voyelles arabes ni accents', () => {
    expect(normalizeSearch('الْحَمْدُ لِلَّهِ')).toBe('الحمد لله')
    expect(normalizeSearch('Éternuement')).toBe('eternuement')
    expect(searchHisn('eternuement').map((c) => c.id)).toEqual(['eternuement'])
    expect(searchHisn('غفرانك').map((c) => c.id)).toContain('toilettes')
    expect(searchHisn('أغثنا').map((c) => c.id)).toEqual(['pluie'])
    expect(searchHisn('  ')).toHaveLength(HISN.length)
    expect(searchHisn('zzzz')).toHaveLength(0)
  })

  it('écrit les recueils dans les deux langues', () => {
    expect(formatSources(['B'], 'fr')).toBe('Al-Bukhârî')
    expect(formatSources(['AD', 'T', 'N'], 'fr')).toBe('Abû Dâwûd, At-Tirmidhî et An-Nasâ’î')
    expect(formatSources(['B', 'M'], 'ar')).toBe('البخاري ومسلم')
  })
})
