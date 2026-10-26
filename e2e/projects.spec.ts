import { expect, test } from '@playwright/test'

import { openApp, tab } from './helpers.ts'

test('projets : créer avec étapes, cocher, statut, filtres, supprimer', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'fr' })
  await tab(page, 'Projets').click()
  await expect(page.getByText('Ton premier projet')).toBeVisible()

  await page.getByRole('button', { name: 'Nouveau projet' }).click()
  const d = page.getByRole('dialog')
  await d.getByRole('button', { name: 'Créer le projet' }).click()
  await expect(d.getByText('Donne un nom à ton projet.')).toBeVisible()
  await d.getByLabel('Nom du projet').fill('Mémoriser Juz ‘Amma')
  await d.getByLabel('Intention (niyya)').fill('Pour Allah')
  await d.getByLabel('Premières étapes (une par ligne)').fill('Choisir un horaire\nTrouver un professeur')
  await d.getByRole('button', { name: 'Créer le projet' }).click()

  // Le détail s'ouvre après la création
  await expect(d.getByText('Niyya : Pour Allah')).toBeVisible()
  await d.getByRole('button', { name: 'Terminer : Choisir un horaire' }).click()
  await expect(d.getByText('1/2 étapes · 50 %')).toBeVisible()
  await d.getByLabel('Nouvelle étape').fill('Réviser 5 versets')
  await d.getByRole('button', { name: 'Ajouter l’étape' }).click()
  await expect(d.getByText('1/3 étapes · 33 %')).toBeVisible()
  await d.getByRole('button', { name: 'Supprimer l’étape : Réviser 5 versets' }).click()
  await d.getByRole('radio', { name: 'Terminé' }).click()
  await page.keyboard.press('Escape')

  await expect(page.getByText('Rien dans ce filtre')).toBeVisible()
  await page.getByRole('radio', { name: 'Terminés' }).click()
  await page.getByRole('button', { name: /Mémoriser Juz/ }).click()
  await d.getByRole('button', { name: 'Supprimer', exact: true }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Supprimer' }).click()
  await expect(page.getByText('Ton premier projet')).toBeVisible()
})

test('projets en arabe, texte très grand : pas de débordement', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'ar', 'elhadj.size': 'xl' })
  await tab(page, 'المشاريع').click()
  await page.getByRole('button', { name: 'مشروع جديد' }).click()
  await page.getByRole('dialog').getByLabel('اسم المشروع').fill('فتح متجري في السوق المركزي')
  await page.getByRole('dialog').getByRole('button', { name: 'إنشاء المشروع' }).click()
  await expect(page.getByRole('dialog').getByText('لا توجد خطوات. أضف الأولى أدناه.')).toBeVisible()
  await page.getByRole('dialog').getByRole('button', { name: 'إغلاق' }).first().click()
  await expect(page.getByRole('button', { name: /فتح متجري/ })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0)
})
