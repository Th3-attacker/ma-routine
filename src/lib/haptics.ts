import { prefersReducedMotion } from './motion'

/** Courte vibration (ignorée si l'appareil ne sait pas vibrer ou si l'utilisateur réduit les animations). */
export function vibrate(pattern: number | number[]): void {
  try {
    if (prefersReducedMotion()) return
    navigator.vibrate?.(pattern)
  } catch {
    // pas de vibration
  }
}
