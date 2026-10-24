/** Courte vibration (ignorée si l'appareil ne sait pas vibrer ou si l'utilisateur réduit les animations). */
export function vibrate(pattern: number | number[]): void {
  try {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    navigator.vibrate?.(pattern)
  } catch {
    // pas de vibration
  }
}
