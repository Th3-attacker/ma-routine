import { expect, test } from '@playwright/test'

import { openApp, tab } from './helpers.ts'

test('conseils du mois : alerte de budget dans Budget et sur Aujourd’hui', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'fr' })
  await tab(page, 'Budget').click()
  await page.getByRole('button', { name: 'Répartir mes revenus', exact: true }).click()
  await page.getByRole('dialog').getByLabel('Alimentation').fill('10000')
  await page.getByRole('dialog').getByRole('button', { name: 'Enregistrer' }).click()
  await page.getByRole('button', { name: 'Dépense', exact: true }).click()
  await page.getByRole('dialog').getByLabel('Montant').fill('12000')
  await page.getByRole('dialog').getByRole('button', { name: 'Ajouter' }).click()

  const card = page.getByRole('region', { name: 'Conseils du mois' })
  await expect(card).toContainText('Alimentation : 120 % du budget')
  await tab(page, 'Aujourd’hui').click()
  await expect(page.getByRole('region', { name: 'Dépenses' })).toContainText('Alimentation : 120 % du budget')
})

test('proposer des étapes : modèle reconnu, étapes cochées, dates réparties', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'fr' })
  await tab(page, 'Projets').click()
  await page.getByRole('button', { name: 'Nouveau projet' }).click()
  const d = page.getByRole('dialog')
  await d.getByLabel('Nom du projet').fill('Économiser pour la Omra')
  await d.getByLabel('Échéance').fill('2027-06-01')
  await d.getByRole('button', { name: 'Créer le projet' }).click()

  await d.getByRole('button', { name: 'Proposer des étapes' }).click()
  await expect(d.getByLabel('Modèle')).toHaveValue('save')
  await expect(d.getByText('Modèle choisi d’après le nom du projet.')).toBeVisible()
  await d.getByText('Réduire une dépense non essentielle').click()
  await expect(d.getByLabel('Réduire une dépense non essentielle')).not.toBeChecked()
  await d.getByRole('button', { name: 'Ajouter 5 étapes' }).click()
  await expect(d.getByText('0/5 étapes · 0 %')).toBeVisible()
  await expect(d.getByRole('button', { name: 'Terminer : Fixer le montant à atteindre' })).toBeVisible()
})

test('proposer des étapes en arabe', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'ar' })
  await tab(page, 'المشاريع').click()
  await page.getByRole('button', { name: 'مشروع جديد' }).click()
  const d = page.getByRole('dialog')
  await d.getByLabel('اسم المشروع').fill('حفظ سورة الملك')
  await d.getByRole('button', { name: 'إنشاء المشروع' }).click()
  await d.getByRole('button', { name: 'اقتراح خطوات' }).click()
  await expect(d.getByLabel('النموذج')).toHaveValue('memorize')
  await d.getByRole('button', { name: 'إضافة 7 خطوات' }).click()
  await expect(d.getByRole('button', { name: /^إنهاء: اختيار السورة أو الجزء/ })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0)
})
