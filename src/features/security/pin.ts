import { db } from '@/db/db'
import type { LockDelay, Security } from '@/db/types'

// Un code à 4 chiffres protège contre un regard ou un accès rapide au téléphone, pas contre un expert :
// ce n'est pas un chiffrement, et la base locale n'est pas chiffrée avec.

export const PIN_LENGTH = 4
export const PBKDF2_ITERATIONS = 210_000
const SALT_BYTES = 16

export const DEFAULT_SECURITY: Security = {
  id: 'device',
  salt: null,
  hash: null,
  iterations: PBKDF2_ITERATIONS,
  failedCount: 0,
  lockedUntil: 0,
  lastHiddenAt: null,
  lockAfterMin: 5,
}

export type PinProblem = 'format' | 'repeated' | 'sequence'

/** Refuse les codes trop simples : 4 chiffres identiques, suites croissantes (1234) ou décroissantes (4321). */
export function pinProblem(pin: string): PinProblem | null {
  if (!/^\d{4}$/.test(pin)) return 'format'
  const d = [...pin].map(Number)
  if (d.every((x) => x === d[0])) return 'repeated'
  const steps = d.slice(1).map((x, i) => x - d[i])
  if (steps.every((s) => s === 1) || steps.every((s) => s === -1)) return 'sequence'
  return null
}

const toBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes))
const fromBase64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))

export async function hashPin(pin: string, salt: Uint8Array, iterations = PBKDF2_ITERATIONS): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations },
    key,
    256,
  )
  return toBase64(new Uint8Array(bits))
}

/** Comparaison en temps constant (évite de révéler, par la durée, combien de caractères correspondent). */
function sameHash(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function getSecurity(): Promise<Security> {
  return { ...DEFAULT_SECURITY, ...(await db.security.get('device')) }
}

async function saveSecurity(patch: Partial<Omit<Security, 'id'>>): Promise<Security> {
  const next = { ...(await getSecurity()), ...patch, id: 'device' as const }
  await db.security.put(next)
  return next
}

export async function hasPin(): Promise<boolean> {
  const s = await getSecurity()
  return !!(s.hash && s.salt)
}

/** Enregistre un nouveau code (après les 2 saisies), et remet les erreurs à zéro. */
export async function setPin(pin: string): Promise<void> {
  if (pinProblem(pin)) throw new Error('Code trop simple')
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const hash = await hashPin(pin, salt)
  await saveSecurity({ salt: toBase64(salt), hash, iterations: PBKDF2_ITERATIONS, failedCount: 0, lockedUntil: 0 })
}

/** Attente imposée après la n-ième erreur d'affilée : 5e → 30 s, 6e → 1 min, 7e → 5 min, ensuite 15 min. */
export function lockoutMs(failedCount: number): number {
  if (failedCount < 5) return 0
  if (failedCount === 5) return 30_000
  if (failedCount === 6) return 60_000
  if (failedCount === 7) return 5 * 60_000
  return 15 * 60_000
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: 'wrong'; lockedUntil: number }
  | { ok: false; reason: 'locked'; lockedUntil: number }

/** Vérifie un code. Les erreurs et l'attente sont enregistrées : recharger la page ne les efface pas. */
export async function verifyPin(pin: string, now = Date.now()): Promise<VerifyResult> {
  const s = await getSecurity()
  if (now < s.lockedUntil) return { ok: false, reason: 'locked', lockedUntil: s.lockedUntil }
  if (!s.hash || !s.salt) return { ok: false, reason: 'wrong', lockedUntil: 0 }
  const hash = await hashPin(pin, fromBase64(s.salt), s.iterations)
  if (sameHash(hash, s.hash)) {
    await saveSecurity({ failedCount: 0, lockedUntil: 0 })
    return { ok: true }
  }
  const failedCount = s.failedCount + 1
  const wait = lockoutMs(failedCount)
  const lockedUntil = wait ? now + wait : 0
  await saveSecurity({ failedCount, lockedUntil })
  return { ok: false, reason: 'wrong', lockedUntil }
}

/** Changer de code : l'ancien doit être bon. */
export async function changePin(oldPin: string, newPin: string): Promise<VerifyResult> {
  const r = await verifyPin(oldPin)
  if (r.ok) await setPin(newPin)
  return r
}

export function setLockDelay(lockAfterMin: LockDelay) {
  return saveSecurity({ lockAfterMin })
}

/** L'app passe en arrière-plan : on note l'heure. */
export function markHidden(now = Date.now()) {
  return saveSecurity({ lastHiddenAt: now })
}

/** Au retour au premier plan : faut-il redemander le code ? */
export function shouldRelock(s: Pick<Security, 'lastHiddenAt' | 'lockAfterMin'>, now: number): boolean {
  if (s.lastHiddenAt === null) return false
  return now - s.lastHiddenAt >= s.lockAfterMin * 60_000
}

/** « Code oublié », sans compte : efface toutes les données de cet appareil. */
export async function wipeDevice(): Promise<void> {
  await db.delete()
  try {
    for (const k of Object.keys(localStorage)) if (k.startsWith('elhadj.')) localStorage.removeItem(k)
  } catch {
    // stockage indisponible : la base est déjà effacée
  }
}
