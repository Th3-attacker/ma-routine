import { db } from './db'

export type OpenResult =
  | { status: 'ok' }
  /** Un autre onglet (souvent un ancien onglet Safari en pause) garde l'ancienne version de la base ouverte. */
  | { status: 'blocked' }
  | { status: 'error'; message: string }
  /** Toujours pas ouverte après le délai : on prévient, sans abandonner. */
  | { status: 'slow' }

// Dans cet onglet : si un onglet plus récent veut mettre la base à jour, on la ferme et on recharge,
// pour ne jamais bloquer la mise à jour.
db.on('versionchange', () => {
  db.close()
  location.reload()
  return false
})

/** Ouvre la base locale et signale un blocage, une erreur, ou un chargement trop long. */
export function openDatabase(onChange: (r: OpenResult) => void, slowAfterMs = 8000): () => void {
  let done = false
  const finish = (r: OpenResult) => {
    if (r.status !== 'slow') done = true
    onChange(r)
  }
  const onBlocked = () => finish({ status: 'blocked' })
  db.on('blocked', onBlocked)
  const timer = setTimeout(() => !done && onChange({ status: 'slow' }), slowAfterMs)
  db.open()
    .then(() => finish({ status: 'ok' }))
    .catch((e: unknown) => {
      const err = e as { name?: string; message?: string }
      finish({ status: 'error', message: [err.name, err.message].filter(Boolean).join(' : ') || String(e) })
    })
  return () => {
    clearTimeout(timer)
    db.on('blocked').unsubscribe(onBlocked)
  }
}

/** Le hachage du code (Web Crypto) n'existe que sur une page sécurisée : https, ou localhost. */
export function cryptoAvailable(): boolean {
  return typeof crypto !== 'undefined' && !!crypto.subtle && (typeof isSecureContext === 'undefined' || isSecureContext)
}
