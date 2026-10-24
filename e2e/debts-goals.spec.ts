import { expect, test } from '@playwright/test'

import { openApp } from './helpers.ts'

const nb = (s: string | null) => (s ?? '').replace(/\s/g, ' ')

test('dettes : ajout, remboursement, soldée, suppression', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'fr' })
  await page.goto('./#/budget?view=debts')
  await expect(page.getByText('Aucune dette en cours')).toBeVisible()
  await expect(page.getByText('Al-Baqara, 282')).toBeVisible()

  await page.getByRole('button', { name: 'On me doit' }).click()
  const d = page.getByRole('dialog')
  await d.getByRole('button', { name: 'Ajouter' }).click()
  await expect(d.getByText('Indique un nom.')).toBeVisible()
  await d.getByLabel('Personne').fill('Ahmed')
  await d.getByLabel('Montant').fill('10000')
  await d.getByRole('button', { name: 'Ajouter' }).click()
  await expect(d).toBeHidden()
  expect(nb(await page.getByRole('definition').first().textContent())).toBe('10 000 UM')

  await page.getByRole('button', { name: /Ahmed/ }).click()
  await d.getByLabel('Remboursement reçu').fill('4000')
  await d.getByRole('button', { name: 'Ajouter' }).click()
  await expect(d.getByRole('listitem').filter({ hasText: '4' })).toHaveCount(1)
  expect(nb(await d.locator('p.font-display').textContent())).toBe('6 000 UM')
  await d.getByRole('button', { name: 'Marquer comme soldée' }).click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('heading', { name: 'Soldées' })).toBeVisible()

  await page.getByRole('button', { name: /Ahmed/ }).click()
  await d.getByRole('button', { name: 'Supprimer', exact: true }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Supprimer' }).click()
  await expect(page.getByText('Aucune dette en cours')).toBeVisible()
})

test('épargne : modèle, versement, retrait, atteint', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'fr' })
  await page.goto('./#/budget?view=goals')
  await page.getByRole('button', { name: 'Nouvel objectif' }).click()
  const d = page.getByRole('dialog')
  await d.getByRole('button', { name: 'Omra' }).click()
  await expect(d.getByLabel('Nom de l’objectif')).toHaveValue('Omra')
  await d.getByLabel('Montant visé').fill('5000')
  await d.getByRole('button', { name: 'Créer l’objectif' }).click()
  await expect(d).toBeHidden()

  await page.getByRole('button', { name: /Omra/ }).click()
  await d.getByLabel('Montant').fill('6000')
  await d.getByRole('button', { name: 'Ajouter' }).click()
  await d.getByRole('radio', { name: 'Retrait' }).click()
  await d.getByLabel('Montant').fill('500')
  await d.getByRole('button', { name: 'Ajouter' }).click()
  await expect(d.getByText('objectif atteint, al-hamdulillah !')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByText('Atteint')).toBeVisible()
})

test('dettes et épargne en arabe, 360 px : pas de débordement', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'ar', 'elhadj.size': 'xl' })
  for (const view of ['debts', 'goals']) {
    await page.goto(`./#/budget?view=${view}`)
    await page.waitForTimeout(300)
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0)
  }
  await expect(page.getByText('البقرة: 282')).toHaveCount(0)
})
