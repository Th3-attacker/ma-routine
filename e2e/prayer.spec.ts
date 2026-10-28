import { expect, test } from '@playwright/test'

import { openApp, tab } from './helpers.ts'

test('écran Prière : statut, qadâ’ automatique et grille', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'fr' })
  await tab(page, 'Prière').click()
  await expect(page.getByRole('heading', { name: 'Horaires du jour' })).toBeVisible()
  await expect(page.getByRole('listitem').filter({ hasText: 'Chourouq' })).toBeVisible()

  // Une case d'hier dans la grille : Fajr manquée → qadâ' passe à 1
  const yesterdayFajr = page.getByRole('row', { name: /Fajr/ }).getByRole('button').nth(5)
  await yesterdayFajr.click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /Manquée/ })
    .click()
  await expect(page.getByRole('status').filter({ hasText: /^1$/ })).toBeVisible()

  await page.getByRole('button', { name: 'J’en ai rattrapé une' }).click()
  await expect(page.getByRole('status').filter({ hasText: /^0$/ })).toBeVisible()

  const witr = page.getByRole('button', { name: 'Witr' })
  await witr.click()
  await expect(witr).toHaveAttribute('aria-pressed', 'true')
})

test('écran Prière en arabe : grille avec les jours abrégés', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'ar' })
  await tab(page, 'الصلاة').click()
  await expect(page.getByRole('heading', { name: 'مواقيت اليوم' })).toBeVisible()
  await expect(page.getByRole('table').getByRole('columnheader').first()).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})

test('exemple d’adhan : écouter puis arrêter', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'pas de sortie audio dans WebKit sous Linux (CI)')
  await openApp(page, { 'elhadj.lang': 'fr' })
  await page.getByRole('button', { name: 'Réglages' }).click()
  await page.getByRole('button', { name: /^Prière et rappels/ }).click()
  await page.getByRole('button', { name: 'Écouter l’adhan' }).click()
  await expect(page.getByRole('button', { name: 'Arrêter l’adhan' })).toBeVisible()
  await page.getByRole('button', { name: 'Arrêter l’adhan' }).click()
  await expect(page.getByRole('button', { name: 'Écouter l’adhan' })).toBeVisible()
})

test('adhan joué à l’heure de la prière quand l’app est ouverte', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'pas de sortie audio dans WebKit sous Linux (CI)')
  // Nouakchott, 23/10/2026 : Asr vers 16:08 (UTC+0)
  await page.clock.install({ time: new Date('2026-10-23T16:04:00Z') })
  await openApp(page, { 'elhadj.lang': 'fr' })
  await page.clock.fastForward('06:00')
  await expect(page.getByText('C’est l’heure de Asr.')).toBeVisible()
})
