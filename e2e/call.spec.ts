import { expect, test } from '@playwright/test'

import { openApp } from './helpers.ts'

// Nouakchott est en UTC+0 : Asr le 23/10/2026 vers 16:07, Joumou‘a (vendredi) vers 12:48.
test('l’appel avant Asr affiche le bandeau, une seule fois', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-23T16:05:30Z') })
  await openApp(page, { 'elhadj.lang': 'fr' })
  const banner = page.getByRole('alert').filter({ hasText: 'la prière' })
  await expect(banner).toContainText(/^Elhadj, la prière · Asr à 16:0\d$/)
  await banner.getByRole('button', { name: 'Fermer' }).click()
  await expect(banner).toHaveCount(0)
  await page.clock.runFor(30_000)
  await expect(banner).toHaveCount(0)
})

test('Réglages → Appel : désactiver, prières, langue et exemple', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'ar' })
  await page.getByRole('button', { name: 'الإعدادات' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: /^الصلاة والتذكيرات/ }).click()
  await expect(dialog.getByRole('heading', { name: 'النداء قبل الأذان' })).toBeVisible()
  await expect(dialog.getByText('Elhadj، الصلاة')).toBeVisible()
  const asr = dialog.getByRole('button', { name: 'العصر' })
  await asr.click()
  await expect(asr).toHaveAttribute('aria-pressed', 'false')
  await dialog.getByRole('radio', { name: 'الاثنتان' }).click()
  await expect(dialog.getByRole('radio', { name: 'الاثنتان' })).toHaveAttribute('aria-checked', 'true')
  await dialog.getByRole('switch', { name: 'ناديني باسمي قبل الأذان' }).click()
  await expect(dialog.getByRole('button', { name: 'العصر' })).toBeDisabled()
})
