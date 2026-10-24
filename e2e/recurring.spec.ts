import { expect, test } from '@playwright/test'

import { openApp, unlock } from './helpers.ts'

test('récurrente : créée avant le jour prévu, ajoutée automatiquement le jour venu, sans doublon', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-04T09:00:00Z') })
  await openApp(page, { 'elhadj.lang': 'fr' })
  await page.goto('./#/budget?view=rec')
  await expect(page.getByText('Aucune opération récurrente')).toBeVisible()

  await page.getByRole('button', { name: 'Nouvelle opération récurrente' }).click()
  const d = page.getByRole('dialog')
  await d.getByLabel('Nom').fill('Loyer')
  await d.getByLabel('Montant').fill('40000')
  await d.getByRole('combobox', { name: 'Jour du mois' }).selectOption('5')
  await d.getByRole('button', { name: 'Ajouter' }).click()
  await expect(d).toBeHidden()
  await expect(page.getByRole('button', { name: /Loyer/ })).toContainText('le 5 de chaque mois · Logement')

  // Le lendemain (5 octobre) : ajout automatique
  await page.clock.setSystemTime(new Date('2026-10-05T09:00:00Z'))
  // La vérification se fait chaque minute : on avance seconde par seconde pour voir le message (affiché 2,5 s).
  const toast = page.getByText('1 opération récurrente ajoutée')
  for (let i = 0; i < 65 && !(await toast.count()); i++) await page.clock.runFor(1000)
  await expect(toast).toBeVisible()
  await page.goto('./#/budget?view=month')
  await expect(page.getByRole('button', { name: /Loyer/ })).toHaveCount(1)

  // Rechargement : pas de doublon
  await page.reload()
  await unlock(page)
  await page.goto('./#/budget?view=month')
  await expect(page.getByRole('button', { name: /Loyer/ })).toHaveCount(1)
})

test('récurrente : désactiver avec l’interrupteur, puis supprimer', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'fr' })
  await page.goto('./#/budget?view=rec')
  await page.getByRole('button', { name: 'Nouvelle opération récurrente' }).click()
  const d = page.getByRole('dialog')
  await d.getByRole('radio', { name: 'Revenu' }).click()
  await d.getByLabel('Nom').fill('Salaire')
  await d.getByLabel('Montant').fill('150000')
  await d.getByRole('button', { name: 'Ajouter' }).click()
  const toggle = page.getByRole('switch', { name: 'Activer ou désactiver : Salaire' })
  await expect(toggle).toBeChecked()
  await toggle.click()
  await expect(toggle).not.toBeChecked()
  await page.getByRole('button', { name: /Salaire/ }).click()
  await d.getByRole('button', { name: 'Supprimer' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Supprimer' }).click()
  await expect(page.getByText('Aucune opération récurrente')).toBeVisible()
})
