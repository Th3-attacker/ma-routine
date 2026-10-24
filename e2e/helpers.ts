import { expect, type Page } from '@playwright/test'

export const PIN = '2580'

/** Tape un code sur le clavier dessiné. */
export async function typePin(page: Page, pin: string): Promise<void> {
  const pad = page.getByRole('group', { name: /Clavier du code|لوحة الرمز/ })
  for (const d of pin) await pad.getByRole('button', { name: d, exact: true }).click()
}

/** Ouvre l'app avec les préférences données et fait l'inscription (prénom, code deux fois). */
export async function openApp(page: Page, prefs: Record<string, string> = {}, name = 'Elhadj'): Promise<void> {
  await page.addInitScript((p) => {
    for (const [k, v] of Object.entries(p)) localStorage.setItem(k, v)
  }, prefs)
  await page.goto('./')
  const next = page.getByRole('button', { name: /^(Continuer|متابعة)$/ })
  await next.click()
  await page.getByLabel(/^(Prénom|الاسم)$/).fill(name)
  await next.click()
  await typePin(page, PIN)
  await typePin(page, PIN)
  await expect(page.getByRole('navigation', { name: /Sections|الأقسام/ })).toBeVisible({ timeout: 10_000 })
}

/** Après un rechargement, l'app est verrouillée : on tape le code. */
export async function unlock(page: Page): Promise<void> {
  await typePin(page, PIN)
  await expect(page.getByRole('navigation', { name: /Sections|الأقسام/ })).toBeVisible()
}

/** Un onglet de la barre du bas (le même nom peut exister ailleurs dans la page). */
export function tab(page: Page, name: string) {
  return page.getByRole('navigation', { name: /^(Sections|الأقسام)$/ }).getByRole('link', { name, exact: true })
}
