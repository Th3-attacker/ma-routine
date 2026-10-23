import type { Page } from '@playwright/test'

/** Ouvre l'app avec les préférences données et passe l'écran d'accueil du premier lancement. */
export async function openApp(page: Page, prefs: Record<string, string> = {}): Promise<void> {
  await page.addInitScript((p) => {
    for (const [k, v] of Object.entries(p)) localStorage.setItem(k, v)
  }, prefs)
  await page.goto('./')
  const start = page.getByRole('button', { name: /^(Commencer|ابدأ)$/ })
  await start.click()
  await start.waitFor({ state: 'detached' })
}
