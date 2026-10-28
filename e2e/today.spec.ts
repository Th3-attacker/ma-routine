import { expect, test } from '@playwright/test'

import { openApp } from './helpers.ts'

test('marquer une prière depuis Aujourd’hui', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'fr' })
  await expect(page.getByRole('heading', { name: /Prochaine prière/ })).toBeVisible()
  await page.getByRole('button', { name: 'Fajr : à renseigner' }).click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /En jamâ‘a/ })
    .click()
  await expect(page.getByRole('button', { name: 'Fajr : En jamâ‘a' })).toBeVisible()
})

test('le wird et les habitudes se cochent', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'fr' })
  await page.getByRole('button', { name: '+4 (wird)' }).click()
  await expect(page.getByText('4 / 4 pages aujourd’hui')).toBeVisible()
  await expect(page.getByText('Page 5 / 604')).toBeVisible()
  const habit = page.getByRole('button', { name: /Sport 20 min/ })
  await habit.click()
  await expect(habit).toHaveAttribute('aria-pressed', 'true')
})
