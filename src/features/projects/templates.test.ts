import { describe, expect, it } from 'vitest'

import { spreadDueDates, suggestTemplate, TEMPLATES } from './templates'

describe('modèles d’étapes', () => {
  it('8 modèles de 5 à 8 étapes, en français et en arabe', () => {
    expect(TEMPLATES).toHaveLength(8)
    for (const t of TEMPLATES) {
      expect(t.steps.length).toBeGreaterThanOrEqual(5)
      expect(t.steps.length).toBeLessThanOrEqual(8)
      for (const s of t.steps) {
        expect(s.fr.trim()).not.toBe('')
        expect(s.ar).toMatch(/[؀-ۿ]/)
      }
    }
  })

  it('reconnaît le modèle à partir du nom du projet, en français ou en arabe', () => {
    expect(suggestTemplate('Mémoriser Juz ‘Amma')).toBe('memorize')
    expect(suggestTemplate('Économiser pour la Omra')).toBe('save')
    expect(suggestTemplate('Ouvrir ma boutique')).toBe('business')
    expect(suggestTemplate('Apprendre l’anglais')).toBe('learn')
    expect(suggestTemplate('Préparer Ramadan')).toBe('ramadan')
    expect(suggestTemplate('Rembourser la dette de Ahmed')).toBe('debt')
    expect(suggestTemplate('حفظ سورة الملك')).toBe('memorize')
    expect(suggestTemplate('السفر إلى دكار')).toBe('travel')
    expect(suggestTemplate('Repeindre la cuisine')).toBeNull()
  })

  it('répartit les dates jusqu’à l’échéance', () => {
    expect(spreadDueDates(4, '2026-10-26', '2026-11-25')).toEqual([
      '2026-11-03',
      '2026-11-10',
      '2026-11-18',
      '2026-11-25',
    ])
    expect(spreadDueDates(3, '2026-10-26', '')).toEqual(['', '', ''])
    expect(spreadDueDates(2, '2026-10-26', '2026-10-01')).toEqual(['', ''])
    expect(spreadDueDates(3, '2026-10-26', '2026-10-27')).toEqual(['2026-10-27', '2026-10-27', '2026-10-27'])
  })
})
