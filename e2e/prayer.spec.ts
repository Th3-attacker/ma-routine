import { expect, test } from '@playwright/test'

import { openApp } from './helpers.ts'

test('écran Prière : statut, qadâ’ automatique et grille', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'fr' })
  await page.getByRole('link', { name: 'Prière' }).click()
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
  await page.getByRole('link', { name: 'الصلاة' }).click()
  await expect(page.getByRole('heading', { name: 'مواقيت اليوم' })).toBeVisible()
  await expect(page.getByRole('table').getByRole('columnheader').first()).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})
