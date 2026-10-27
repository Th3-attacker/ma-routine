import type { Security } from '@/db/types'

import { getSecurity, saveSecurity } from './pin'

// Déverrouillage par empreinte ou visage (WebAuthn, clé d'accès de l'appareil). Tout reste sur le téléphone :
// la clé privée ne quitte jamais sa puce sécurisée, et l'app garde seulement la clé publique pour vérifier la
// signature. Le code à 4 chiffres reste toujours possible.

const b64url = {
  encode(buf: ArrayBuffer | Uint8Array): string {
    const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
    let s = ''
    for (const b of bytes) s += String.fromCharCode(b)
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  },
  decode(s: string): Uint8Array<ArrayBuffer> {
    const pad = '='.repeat((4 - (s.length % 4)) % 4)
    const raw = atob((s + pad).replace(/-/g, '+').replace(/_/g, '/'))
    return Uint8Array.from(raw, (c) => c.charCodeAt(0))
  },
}

const ES256 = -7
const RS256 = -257

/** Le téléphone a-t-il un lecteur d'empreinte ou de visage utilisable ici ? */
export async function biometricAvailable(): Promise<boolean> {
  try {
    return (
      typeof PublicKeyCredential !== 'undefined' &&
      (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())
    )
  } catch {
    return false
  }
}

const challenge = () => crypto.getRandomValues(new Uint8Array(32))

/** Crée la clé d'accès (le téléphone demande l'empreinte ou le visage). Renvoie false si la personne annule. */
export async function enableBiometric(userName: string, appName: string): Promise<boolean> {
  let cred: PublicKeyCredential | null
  try {
    cred = (await navigator.credentials.create({
      publicKey: {
        challenge: challenge(),
        rp: { name: appName },
        user: {
          id: crypto.getRandomValues(new Uint8Array(16)),
          name: userName || appName,
          displayName: userName || appName,
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: ES256 },
          { type: 'public-key', alg: RS256 },
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'discouraged',
        },
        attestation: 'none',
        timeout: 60_000,
      },
    })) as PublicKeyCredential | null
  } catch {
    return false
  }
  const response = cred?.response as AuthenticatorAttestationResponse | undefined
  const publicKey = response?.getPublicKey?.()
  const alg = response?.getPublicKeyAlgorithm?.()
  if (!cred || !publicKey || (alg !== ES256 && alg !== RS256)) return false
  await saveSecurity({ passkey: { id: cred.id, publicKey: b64url.encode(publicKey), alg } })
  return true
}

export async function disableBiometric(): Promise<void> {
  await saveSecurity({ passkey: null })
}

/** Signature ECDSA au format DER (WebAuthn) → format brut r‖s (WebCrypto). */
export function derToRaw(der: Uint8Array): Uint8Array<ArrayBuffer> {
  let i = 2 // 0x30, longueur
  const read = () => {
    i++ // 0x02
    let len = der[i++]
    let start = i
    i += len
    // Les entiers DER ont parfois un 0 de tête, ou sont plus courts que 32 octets.
    while (len > 32 && der[start] === 0) {
      start++
      len--
    }
    const out = new Uint8Array(32)
    out.set(der.subarray(start, start + len), 32 - len)
    return out
  }
  const r = read()
  const s = read()
  const raw = new Uint8Array(64)
  raw.set(r)
  raw.set(s, 32)
  return raw
}

async function verifySignature(
  passkey: NonNullable<Security['passkey']>,
  response: AuthenticatorAssertionResponse,
): Promise<boolean> {
  const hash = await crypto.subtle.digest('SHA-256', response.clientDataJSON)
  const data = new Uint8Array(response.authenticatorData.byteLength + hash.byteLength)
  data.set(new Uint8Array(response.authenticatorData))
  data.set(new Uint8Array(hash), response.authenticatorData.byteLength)
  const signature = new Uint8Array(response.signature)
  const spki = b64url.decode(passkey.publicKey)
  if (passkey.alg === ES256) {
    const key = await crypto.subtle.importKey('spki', spki, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify'])
    return crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, derToRaw(signature), data)
  }
  const key = await crypto.subtle.importKey('spki', spki, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, [
    'verify',
  ])
  return crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, signature, data)
}

/**
 * Demande l'empreinte ou le visage, puis vérifie la réponse : le bon défi, cette adresse, la personne vérifiée
 * par le téléphone, et la signature de la clé enregistrée. Un succès remet les erreurs de code à zéro.
 */
export async function unlockWithBiometric(): Promise<boolean> {
  const { passkey } = await getSecurity()
  if (!passkey) return false
  const expected = challenge()
  let cred: PublicKeyCredential | null
  try {
    cred = (await navigator.credentials.get({
      publicKey: {
        challenge: expected,
        allowCredentials: [{ type: 'public-key', id: b64url.decode(passkey.id) }],
        userVerification: 'required',
        timeout: 60_000,
      },
    })) as PublicKeyCredential | null
  } catch {
    return false
  }
  if (!cred || cred.id !== passkey.id) return false
  const response = cred.response as AuthenticatorAssertionResponse
  try {
    const client = JSON.parse(new TextDecoder().decode(response.clientDataJSON)) as {
      type: string
      challenge: string
      origin: string
    }
    if (client.type !== 'webauthn.get' || client.challenge !== b64url.encode(expected)) return false
    if (client.origin !== location.origin) return false
    const flags = new Uint8Array(response.authenticatorData)[32]
    const userPresent = (flags & 0x01) !== 0
    const userVerified = (flags & 0x04) !== 0
    if (!userPresent || !userVerified || !(await verifySignature(passkey, response))) return false
  } catch {
    return false
  }
  await saveSecurity({ failedCount: 0, lockedUntil: 0 })
  return true
}
