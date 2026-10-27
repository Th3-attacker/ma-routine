import { expect, test } from '@playwright/test'

import { openApp } from './helpers.ts'

// Lecteur d'empreinte simulé par Chromium (WebAuthn virtuel) : activation, puis déverrouillage sans le code.
test('déverrouiller avec l’empreinte ou le visage', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'authentificateur virtuel de Chromium')
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('WebAuthn.enable')
  await cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      protocol: 'ctap2',
      transport: 'internal',
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  })

  await openApp(page, { 'elhadj.lang': 'fr' })
  await page.getByRole('button', { name: 'Réglages' }).click()
  await page.getByRole('button', { name: /^Compte et sécurité/ }).click()
  const toggle = page.getByRole('switch', { name: /Ouvrir avec l’empreinte ou le visage/ })
  await toggle.click()
  await expect(toggle).toBeChecked()
  await expect(page.getByText('Empreinte ou visage activé')).toBeVisible()

  await page.reload()
  await page.getByRole('button', { name: 'Utiliser l’empreinte ou le visage' }).click()
  await expect(page.getByRole('navigation', { name: 'Sections' })).toBeVisible()
})
