import { describe, expect, it } from 'vitest'

import { derToRaw } from './biometric'

describe('empreinte ou visage', () => {
  it('convertit une signature ECDSA DER en r‖s de 64 octets', () => {
    const r = new Uint8Array(32).fill(1)
    const s = new Uint8Array(31).fill(2) // entier court
    // r avec un 0 de tête (33 octets), s de 31 octets
    const der = new Uint8Array([0x30, 2 + 33 + 2 + 31, 0x02, 33, 0, ...r, 0x02, 31, ...s])
    const raw = derToRaw(der)
    expect(raw).toHaveLength(64)
    expect([...raw.subarray(0, 32)]).toEqual([...r])
    expect(raw[32]).toBe(0)
    expect([...raw.subarray(33)]).toEqual([...s])
  })
})
