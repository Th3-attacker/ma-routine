import { expect, test } from '@playwright/test'

import { openApp, unlock } from './helpers.ts'

const LANGS = ['fr', 'ar'] as const
const SIZES = ['s', 'm', 'l', 'xl'] as const

for (const lang of LANGS) {
  for (const size of SIZES) {
    test(`pas de débordement — ${lang}, taille ${size}`, async ({ page }) => {
      await openApp(page, { 'elhadj.lang': lang, 'elhadj.size': size })
      await expect(page.locator('html')).toHaveAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr')
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

      // Aucun défilement horizontal
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      expect(overflow).toBeLessThanOrEqual(0)

      // Le nom arabe n'est pas coupé
      const arName = page.getByRole('banner').locator('span[lang="ar"]')
      expect(await arName.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true)

      // Les trois boutons de l'en-tête restent entiers dans l'écran, et font au moins 44 px
      const width = page.viewportSize()!.width
      for (const btn of await page.getByRole('banner').getByRole('button').all()) {
        const box = (await btn.boundingBox())!
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width).toBeLessThanOrEqual(width)
        expect(box.width).toBeGreaterThanOrEqual(44)
        expect(box.height).toBeGreaterThanOrEqual(44)
      }
    })
  }
}

test('les onglets naviguent et l’adresse garde le hash', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'fr' })
  await page.getByRole('link', { name: 'Prière' }).click()
  await expect(page).toHaveURL(/#\/priere$/)
  await page.reload()
  await unlock(page)
  await expect(page.getByRole('heading', { level: 2, name: 'Horaires du jour' })).toBeVisible()
})

test('le bouton de langue et les réglages fonctionnent', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'fr' })
  await page.getByRole('button', { name: 'Passer en arabe' }).click()
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await page.getByRole('button', { name: 'الإعدادات' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: 'الإعدادات' })).toBeVisible()
  await dialog.getByRole('radio', { name: 'داكن' }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await dialog.getByRole('radio', { name: 'كبير جدًا' }).click()
  await expect(page.locator('html')).toHaveAttribute('style', /font-size: 122%/)
})

test('les réglages changent la ville et le prénom', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'fr' })
  await page.getByRole('button', { name: 'Réglages' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Ton prénom').fill('Aïcha')
  await dialog.getByRole('combobox', { name: 'Ville' }).selectOption({ label: 'Dakar' })
  await expect(dialog.getByRole('combobox', { name: 'Ville' })).toHaveValue('dkr')
  await dialog.getByRole('button', { name: 'Enregistrer' }).click()
  await expect(dialog).toBeHidden()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('As-salâmu ‘alaykum, Aïcha')
})

test('les réglages affichent une erreur traduite', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'ar' })
  await page.getByRole('button', { name: 'الإعدادات' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('الصفحة الحالية').fill('900')
  await dialog.getByRole('button', { name: 'حفظ' }).click()
  await expect(dialog.getByText('الصفحة الحالية أكبر من عدد الصفحات.')).toBeVisible()
})
