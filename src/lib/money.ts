import type { Lang } from '@/app/device-prefs'

const nf = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })

/** Libellé de la devise : « UM » en français, « أوقية » en arabe (autre devise : telle quelle). */
export function currencyLabel(currency: string, lang: Lang): string {
  return lang === 'ar' && currency === 'UM' ? 'أوقية' : currency
}

/**
 * « 12 500 UM » (format fr-FR dans les deux langues, chiffres latins). Le signe moins est « − ».
 * `sign` ajoute « + » aux montants positifs.
 */
export function formatMoney(n: number, currency: string, lang: Lang, sign = false): string {
  const v = Math.round(n || 0)
  const prefix = v < 0 ? '−' : sign && v > 0 ? '+' : ''
  return `${prefix}${nf.format(Math.abs(v))} ${currencyLabel(currency, lang)}`
}

/** Lit un montant tapé (espaces acceptés, y compris les espaces fines du format fr-FR). Seuls les nombres entiers sont acceptés : sinon NaN. */
export function parseAmount(v: string): number {
  const s = v.replace(/\s/g, '')
  return /^\d+$/.test(s) ? Number(s) : NaN
}
