import { addDays } from '@/lib/dates'

export type QuranProgress = { goal: number; page: number; total: number; khatmas: number }

/** Date prévue de la khatma : pages restantes ÷ wird quotidien, à partir d'aujourd'hui. */
export function khatmaDate(todayKey: string, q: QuranProgress): string {
  const total = Math.max(1, q.total)
  const goal = Math.max(1, q.goal)
  const page = Math.min(Math.max(1, q.page), total)
  const remaining = total - (page - 1)
  return addDays(todayKey, Math.ceil(remaining / goal))
}

/**
 * Ajoute (ou retire) des pages lues : avance la page actuelle, compte une khatma quand on dépasse la dernière page.
 * Les pages du jour ne descendent jamais sous 0 ; renvoie null si on retire une page alors qu'aucune n'est lue.
 */
export function addPages(
  q: QuranProgress,
  pagesToday: number,
  n: number,
): { quran: QuranProgress; pagesToday: number; khatmaDone: boolean } | null {
  if (n < 0 && pagesToday <= 0) return null
  const total = Math.max(1, q.total)
  let page = q.page + n
  let khatmas = q.khatmas
  let khatmaDone = false
  if (page > total) {
    khatmas += 1
    page -= total
    khatmaDone = true
  }
  if (page < 1) page = 1
  return { quran: { ...q, page, khatmas }, pagesToday: Math.max(0, pagesToday + n), khatmaDone }
}
