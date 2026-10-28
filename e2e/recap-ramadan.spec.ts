import { expect, test } from '@playwright/test'

import { openApp } from './helpers.ts'

test('bilan du soir : tuiles, message et journal', async ({ page }) => {
  // 21 h à Nouakchott : le bilan est en haut de l'écran
  await page.clock.install({ time: new Date('2026-10-23T21:00:00Z') })
  await openApp(page, { 'elhadj.lang': 'fr' })
  const recap = page.getByRole('region', { name: 'Bilan du jour' })
  await expect(recap).toContainText('Encore 5 prières à marquer.')
  await recap.getByRole('button', { name: 'Écrire mon bilan du soir' }).click()
  const d = page.getByRole('dialog')
  await d.getByLabel('Al-hamdulillah pour…').fill('ma famille')
  await d.getByLabel('Demain, je veux faire mieux sur…').fill('le Fajr en jamâ‘a')
  await d.getByRole('button', { name: 'Enregistrer' }).click()
  await expect(recap).toContainText('Al-hamdulillah pour : ma famille')
  await expect(recap.getByRole('button', { name: 'Modifier mon bilan' })).toBeVisible()
})

test('aperçu du mode Ramadan et dépenses depuis Aujourd’hui', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-23T12:00:00Z') })
  await openApp(page, { 'elhadj.lang': 'fr' })
  await page.getByRole('button', { name: 'Réglages' }).click()
  await page.getByRole('button', { name: /^Affichage/ }).click()
  await page.getByRole('switch', { name: /Aperçu du mode Ramadan/ }).click()
  await page.keyboard.press('Escape')
  const ram = page.getByRole('region', { name: /Ramadan Moubarak/ })
  await expect(ram).toContainText('Aperçu')
  await expect(ram).toContainText('Jour 12 sur 30')
  await expect(ram).toContainText(/^.*Iftar dans/)
  await ram.getByRole('button', { name: 'Je jeûne aujourd’hui' }).click()
  await expect(ram.getByRole('button', { name: 'Je jeûne aujourd’hui' })).toHaveAttribute('aria-pressed', 'true')
  // Pas de carte « Jeûne du jour » pendant Ramadan
  await expect(page.getByRole('region', { name: /Jeûne du jour/ })).toHaveCount(0)

  await page.getByRole('button', { name: 'Ajouter une dépense' }).click()
  await page.getByRole('dialog').getByLabel('Montant').fill('2500')
  await page.getByRole('dialog').getByRole('button', { name: 'Ajouter' }).click()
  await expect(page.getByRole('region', { name: 'Dépenses' })).toContainText(/2\s500\sUM/)
})
