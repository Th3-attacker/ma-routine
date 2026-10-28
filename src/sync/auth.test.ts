import { describe, expect, it } from 'vitest'

import { authErrorKey } from './auth'

describe('messages d’erreur du compte', () => {
  it('distingue envoi d’e-mail impossible, trop de demandes, réseau et code faux', () => {
    expect(authErrorKey({ status: 500, message: 'Error sending confirmation email' })).toBe('errors.emailSend')
    expect(authErrorKey({ status: 429, message: 'email rate limit exceeded' })).toBe('errors.rateLimit')
    expect(authErrorKey({ name: 'AuthRetryableFetchError', status: 0 })).toBe('errors.network')
    expect(authErrorKey({ status: 403, message: 'Token has expired or is invalid' })).toBe('errors.otpWrong')
  })
})
