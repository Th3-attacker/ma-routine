import { describe, expect, it } from 'vitest'

import { currencyLabel, formatMoney, parseAmount } from './money'

describe('montants', () => {
  it('format fr-FR, UM en français et أوقية en arabe', () => {
    expect(formatMoney(12500, 'UM', 'fr').replace(/\s/g, ' ')).toBe('12 500 UM')
    expect(formatMoney(12500, 'UM', 'ar').replace(/\s/g, ' ')).toBe('12 500 أوقية')
    expect(formatMoney(-300, 'UM', 'fr').replace(/\s/g, ' ')).toBe('−300 UM')
    expect(formatMoney(300, 'UM', 'fr', true).replace(/\s/g, ' ')).toBe('+300 UM')
    expect(currencyLabel('EUR', 'ar')).toBe('EUR')
  })

  it('utilise des espaces insécables affichables par toutes les polices', () => {
    expect(formatMoney(1250000, 'UM', 'fr')).toBe('1\u00a0250\u00a0000\u00a0UM')
    expect(formatMoney(1250000, 'UM', 'fr')).not.toMatch(/\u202f/)
  })

  it('accepte seulement des nombres entiers', () => {
    expect(parseAmount('12 500')).toBe(12500)
    expect(parseAmount(`12${String.fromCharCode(0x202f)}500`)).toBe(12500)
    expect(parseAmount('12,5')).toBeNaN()
    expect(parseAmount('-5')).toBeNaN()
    expect(parseAmount('')).toBeNaN()
  })
})
