import { describe, expect, it } from 'vitest'

import { addPages, khatmaDate } from './khatma'

const q = { goal: 4, page: 1, total: 604, khatmas: 0 }

describe('wird et khatma', () => {
  it('prévoit la khatma selon le wird quotidien', () => {
    expect(khatmaDate('2026-10-23', q)).toBe('2027-03-23') // 604 / 4 = 151 jours
    expect(khatmaDate('2026-10-23', { ...q, page: 601 })).toBe('2026-10-24')
    expect(khatmaDate('2026-10-23', { ...q, goal: 0 })).toBe('2028-06-18') // wird au moins 1 page
  })

  it('avance la page et compte une khatma', () => {
    expect(addPages(q, 0, 4)).toEqual({ quran: { ...q, page: 5 }, pagesToday: 4, khatmaDone: false })
    const r = addPages({ ...q, page: 603 }, 2, 4)
    expect(r).toEqual({ quran: { ...q, page: 3, khatmas: 1 }, pagesToday: 6, khatmaDone: true })
  })

  it('ne retire pas de page si aucune n’est lue aujourd’hui', () => {
    expect(addPages(q, 0, -1)).toBeNull()
    expect(addPages({ ...q, page: 1 }, 1, -1)).toEqual({ quran: { ...q, page: 1 }, pagesToday: 0, khatmaDone: false })
  })
})
