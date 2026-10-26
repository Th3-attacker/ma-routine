import { expect, test } from '@playwright/test'

import { openApp, tab } from './helpers.ts'

test('sauvegarde : télécharger, puis importer le fichier de la maquette', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'fr' })
  await page.getByRole('button', { name: 'Réglages' }).click()
  const dialog = page.getByRole('dialog')

  const download = page.waitForEvent('download')
  await dialog.getByRole('button', { name: 'Télécharger une sauvegarde (.json)' }).click()
  const file = await download
  expect(file.suggestedFilename()).toMatch(/^elhadj-sauvegarde-\d{4}-\d{2}-\d{2}\.json$/)

  await dialog.getByLabel('Importer une sauvegarde').setInputFiles('e2e/fixtures/maquette-export.json')
  const confirm = page.getByRole('alertdialog')
  await expect(confirm).toContainText('1 mouvements, 1 projets')
  await confirm.getByRole('button', { name: 'Importer' }).click()
  await expect(page.getByText('Sauvegarde importée')).toBeVisible()
  await dialog.getByRole('button', { name: 'Fermer' }).click()
  await expect(dialog).toBeHidden()

  await tab(page, 'Projets').click()
  await expect(page.getByRole('button', { name: /Ouvrir ma boutique/ })).toBeVisible()
})

test('sauvegarde : un fichier inconnu est refusé', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'fr' })
  await page.getByRole('button', { name: 'Réglages' }).click()
  await page
    .getByRole('dialog')
    .getByLabel('Importer une sauvegarde')
    .setInputFiles({ name: 'autre.json', mimeType: 'application/json', buffer: Buffer.from('{"x":1}') })
  await expect(page.getByText('Ce fichier n’est pas une sauvegarde Sama Jàmm.')).toBeVisible()
})
