import { expect, type Page } from '@playwright/test'

export const PIN = '2580'

/** Tape un code sur le clavier dessiné. */
export async function typePin(page: Page, pin: string): Promise<void> {
  const pad = page.getByRole('group', { name: /Clavier du code|لوحة الرمز/ })
  for (const d of pin) await pad.getByRole('button', { name: d, exact: true }).click()
}

/** Ouvre l'app avec les préférences données et fait l'inscription (prénom et lieu ; pas de code). */
export async function openApp(page: Page, prefs: Record<string, string> = {}, name = 'Elhadj'): Promise<void> {
  await page.addInitScript((p) => {
    for (const [k, v] of Object.entries(p)) localStorage.setItem(k, v)
  }, prefs)
  await page.goto('./')
  const next = page.getByRole('button', { name: /^(Continuer|متابعة)$/ })
  await next.click()
  await page.getByLabel(/^(Prénom|الاسم)$/).fill(name)
  await next.click()
  await expect(page.getByRole('navigation', { name: /Sections|الأقسام/ })).toBeVisible({ timeout: 10_000 })
}

/** Réglages → Sécurité : protège l'app par le code PIN (facultatif depuis le 28/10/2026). */
export async function enablePin(page: Page): Promise<void> {
  await page.getByRole('button', { name: /^(Réglages|الإعدادات)$/ }).click()
  await page.getByRole('button', { name: /^(Sécurité|الأمان)/ }).click()
  await page.getByRole('button', { name: /^(Protéger l’app par un code|حماية التطبيق برمز)$/ }).click()
  await typePin(page, PIN)
  await typePin(page, PIN)
  await expect(page.getByText(/Code enregistré|تم حفظ الرمز/)).toBeVisible()
  await page.keyboard.press('Escape')
  await page.keyboard.press('Escape')
}

/** Après un rechargement : tape le code s'il est demandé, puis attend l'app. */
export async function unlock(page: Page): Promise<void> {
  const nav = page.getByRole('navigation', { name: /^(Sections|الأقسام)$/ })
  const pad = page.getByRole('group', { name: /Clavier du code|لوحة الرمز/ })
  await expect(nav.or(pad)).toBeVisible()
  if (await pad.isVisible()) await typePin(page, PIN)
  await expect(nav).toBeVisible()
}

/** Un onglet de la barre du bas (le même nom peut exister ailleurs dans la page). */
export function tab(page: Page, name: string) {
  return page.getByRole('navigation', { name: /^(Sections|الأقسام)$/ }).getByRole('link', { name, exact: true })
}
