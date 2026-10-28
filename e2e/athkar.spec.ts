import { expect, test } from '@playwright/test'

import { openApp } from './helpers.ts'

test('athkar : carte, plein écran au clavier et remise à zéro', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'fr' })
  await page.goto('./#/athkar?set=matin')
  await expect(page.getByRole('tab', { name: 'Matin' })).toHaveAttribute('aria-selected', 'true')

  const first = page.getByRole('button', { name: 'Répétition 0 sur 1' }).first()
  await first.click()
  await expect(page.getByRole('button', { name: 'Répétition 1 sur 1' }).first()).toBeVisible()

  await page.getByRole('button', { name: 'Plein écran' }).click()
  const reader = page.getByRole('dialog')
  await expect(reader).toBeVisible()
  // Le lecteur s'ouvre sur le premier dhikr non terminé ; Espace compte.
  await reader.getByRole('button', { name: /^Compter/ }).focus()
  await page.keyboard.press('Space')
  await expect(reader.getByText(/^1 \/ \d+$/)).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(reader).toBeHidden()

  await page.getByRole('button', { name: 'Recommencer cette série' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Remettre à zéro' }).click()
  await expect(page.getByRole('button', { name: 'Répétition 1 sur 1' })).toHaveCount(0)
})

test('tasbih : compter et total du jour', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'fr' })
  await page.goto('./#/athkar?set=tasbih')
  const bead = page.getByRole('button', { name: /^Compter : / })
  for (let i = 0; i < 3; i++) await bead.click()
  await expect(page.getByRole('button', { name: 'Compter : 3' })).toBeVisible()
  await expect(page.getByText('Total aujourd’hui : 3')).toBeVisible()
  await page.getByRole('radio', { name: 'Sans limite' }).click()
  await expect(page.getByText('libre')).toBeVisible()
})

test('les cartes athkar d’Aujourd’hui ouvrent la bonne série', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'ar' })
  await page.getByRole('link', { name: /أذكار المساء/ }).click()
  await expect(page.getByRole('tab', { name: 'المساء' })).toHaveAttribute('aria-selected', 'true')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})

test('invocations : chercher une situation et ouvrir ses invocations', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'fr' })
  await page.goto('./#/athkar?set=douas')
  await expect(page.getByRole('heading', { name: 'Invocations du quotidien' })).toBeVisible()
  await page.getByLabel('Chercher une situation ou un mot').fill('pluie')
  const chapter = page.getByRole('button', { name: /^Pluie, vent et tonnerre/ })
  await expect(chapter).toBeVisible()
  await expect(page.getByRole('button', { name: /^Repas/ })).toHaveCount(0)
  await chapter.click()
  const drawer = page.getByRole('dialog')
  await expect(drawer.getByText('Rapporté par Al-Bukhârî').first()).toBeVisible()
  await drawer.getByRole('button', { name: 'Fermer' }).click()
  await page.getByLabel('Chercher une situation ou un mot').fill('zzzz')
  await expect(page.getByText('Aucune invocation ne correspond à « zzzz ».').first()).toBeVisible()
})

test('écoute : un dhikr écouté jusqu’au bout est compté', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'pas de sortie audio dans WebKit sous Linux (CI)')
  test.setTimeout(60_000)
  await openApp(page, { 'elhadj.lang': 'fr' })
  await page.goto('./#/athkar?set=nuit')
  await expect(page.getByRole('button', { name: 'Tout écouter' })).toBeVisible()
  // 4e dhikr du coucher : « Bismika Allâhumma amûtu wa ahyâ », une fois (environ 5 s).
  await page.getByRole('button', { name: 'Écouter', exact: true }).nth(3).click()
  await expect(page.getByRole('button', { name: 'Mettre en pause' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Répétition 1 sur 1' })).toHaveCount(1, { timeout: 20_000 })
})
