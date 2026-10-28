import { expect, test } from '@playwright/test'

import { openApp, tab } from './helpers.ts'

const nb = (s: string) => s.replace(/\s/g, ' ')

test('budget du mois : ajouter, modifier, supprimer, budgets', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'fr' })
  await tab(page, 'Budget').click()
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

  // Enveloppes (base zéro) : 50 000 de revenus, 10 000 dans Transport → reste 40 000 à répartir,
  // Transport dépassé de 2 500 ; déplacer 5 000 depuis Alimentation.
  await page.getByRole('button', { name: 'Répartir mes revenus', exact: true }).click()
  const assign = page.getByRole('dialog')
  await assign.getByLabel('Transport').fill('10000')
  await expect(assign.getByText(/Reste à répartir : 40.000/)).toBeVisible()
  await assign.getByLabel('Alimentation').fill('40000')
  await expect(assign.getByText(/Reste à répartir : 0.UM/)).toBeVisible()
  await assign.getByRole('button', { name: 'Enregistrer' }).click()
  await expect(page.getByText('Tout est réparti : chaque ouguiya a un rôle.')).toBeVisible()
  const transport = page.getByRole('button', { name: /^Transport/ })
  await expect(transport).toContainText(/dépassée de 2.500/)
  await page.getByRole('button', { name: /^Alimentation/ }).click()
  await page.getByRole('dialog').getByLabel('Vers l’enveloppe').selectOption({ label: 'Transport' })
  await page.getByRole('dialog').getByLabel('Montant à déplacer').fill('5000')
  await page.getByRole('dialog').getByRole('button', { name: 'Déplacer' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Fermer' }).click()
  await expect(transport).toContainText(/mis 15.000.UM · dépensé 12.500/)

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
  await tab(page, 'الميزانية').click()
  await page.getByRole('button', { name: 'مصروف', exact: true }).click()
  await page.getByRole('dialog').getByLabel('المبلغ').fill('1250000')
  await page.getByRole('dialog').getByRole('button', { name: 'إضافة' }).click()
  await expect(page.getByText('أوقية').first()).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})
