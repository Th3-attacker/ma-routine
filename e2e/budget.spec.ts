import { expect, test } from '@playwright/test'

import { openApp } from './helpers.ts'

const nb = (s: string) => s.replace(/\s/g, ' ')

test('budget du mois : ajouter, modifier, supprimer, budgets', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'fr' })
  await page.getByRole('link', { name: 'Budget' }).click()
  await expect(page.getByText(/^Aucun mouvement en /)).toBeVisible()

  // Ajouter une dépense
  await page.getByRole('button', { name: 'Dépense', exact: true }).click()
  const drawer = page.getByRole('dialog')
  await drawer.getByLabel('Montant').fill('12,5')
  await drawer.getByRole('button', { name: 'Ajouter' }).click()
  await expect(drawer.getByText('Indique un montant entier supérieur à zéro.')).toBeVisible()
  await drawer.getByLabel('Montant').fill('12500')
  await drawer.getByRole('radio', { name: 'Transport' }).click()
  await drawer.getByRole('radio', { name: 'Bankily' }).click()
  await drawer.getByLabel('Note').fill('Taxi')
  await drawer.getByRole('button', { name: 'Ajouter' }).click()
  await expect(drawer).toBeHidden()
  const row = page.getByRole('button', { name: /Taxi/ })
  await expect(row).toContainText('Transport · Bankily')
  expect(nb((await row.textContent()) ?? '')).toContain('−12 500 UM')

  // Revenu : solde positif
  await page.getByRole('button', { name: 'Revenu', exact: true }).click()
  await drawer.getByLabel('Montant').fill('50000')
  await drawer.getByRole('button', { name: 'Ajouter' }).click()
  await expect(page.getByRole('definition').filter({ hasText: '+37' })).toBeVisible()

  // Budgets : transport à 10 000 → dépassé
  await page.getByRole('button', { name: 'Budgets', exact: true }).click()
  await page.getByRole('dialog').getByLabel('Transport').fill('10000')
  await page.getByRole('dialog').getByRole('button', { name: 'Enregistrer' }).click()
  await expect(page.getByText(/125 % du budget de .* dépassé de 2/)).toBeVisible()

  // Modifier puis supprimer avec confirmation
  await row.click()
  await drawer.getByLabel('Montant').fill('8000')
  await drawer.getByRole('button', { name: 'Enregistrer' }).click()
  expect(nb((await page.getByRole('button', { name: /Taxi/ }).textContent()) ?? '')).toContain('−8 000 UM')
  await page.getByRole('button', { name: /Taxi/ }).click()
  await drawer.getByRole('button', { name: 'Supprimer' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Supprimer' }).click()
  await expect(page.getByRole('button', { name: /Taxi/ })).toHaveCount(0)

  // Mois précédent, puis impossible d'aller après le mois en cours
  await page.getByRole('button', { name: 'Mois précédent' }).click()
  await expect(page.getByText(/^Aucun mouvement en /)).toBeVisible()
  await page.getByRole('button', { name: 'Mois suivant' }).click()
  await expect(page.getByRole('button', { name: 'Mois suivant' })).toBeDisabled()
})

test('budget en arabe, texte très grand : pas de débordement', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'ar', 'elhadj.size': 'xl' })
  await page.getByRole('link', { name: 'الميزانية' }).click()
  await page.getByRole('button', { name: 'مصروف', exact: true }).click()
  await page.getByRole('dialog').getByLabel('المبلغ').fill('1250000')
  await page.getByRole('dialog').getByRole('button', { name: 'إضافة' }).click()
  await expect(page.getByText('أوقية').first()).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})
