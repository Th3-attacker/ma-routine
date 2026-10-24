import { useEffect } from 'react'

/** Garde l'écran allumé tant que `active` est vrai (refus ou absence de l'API tolérés). */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    let cancelled = false
    const request = async () => {
      try {
        const l = await navigator.wakeLock.request('screen')
        if (cancelled) void l.release()
        else lock = l
      } catch {
        // refusé (batterie faible, onglet caché…) : on continue sans
      }
    }
    void request()
    // Le verrou est perdu quand la page est cachée : on le redemande au retour.
    const onVisible = () => document.visibilityState === 'visible' && void request()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      void lock?.release()
    }
  }, [active])
}
