// localStorage peut être indisponible (navigation privée, stockage bloqué) : on ne plante jamais.
export function readLocal(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeLocal(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // préférence non mémorisée, l'app continue
  }
}
