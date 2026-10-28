import { describe, expect, it } from 'vitest'

import { DEFAULT_SETTINGS } from '@/db/settings'

import { pushPayload } from './subscribe'

describe('abonnement aux notifications sans compte', () => {
  it('n’envoie que la position arrondie (~1 km), le fuseau, la langue et les choix', () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      name: 'Awa',
      cityId: 'custom',
      custom: { lat: 14.71673, lng: -17.46772, timezone: 'Africa/Dakar' },
    }
    const p = pushPayload(
      { endpoint: 'https://fcm.googleapis.com/fcm/send/x', keys: { p256dh: 'k', auth: 'a' } },
      'ar',
      settings,
    )
    expect(p).toEqual({
      p_endpoint: 'https://fcm.googleapis.com/fcm/send/x',
      p_p256dh: 'k',
      p_auth: 'a',
      p_lang: 'ar',
      p_lat: 14.72,
      p_lng: -17.47,
      p_timezone: 'Africa/Dakar',
      p_notif: DEFAULT_SETTINGS.notif,
      p_hijri_adj: 0,
    })
    expect(JSON.stringify(p)).not.toContain('Awa')
  })
})
