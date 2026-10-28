import { expect, test, type Page } from '@playwright/test'

// L'écran pré-dessiné d'index.html (src/app/shell.ts) doit ressembler à l'écran de bienvenue de React :
// même texte, même taille, pour que rien ne saute quand React prend le relais.

const box = async (page: Page, text: string) => (await page.getByText(text, { exact: true }).first().boundingBox())!

for (const lang of ['fr', 'ar'] as const) {
  test(`écran pré-dessiné identique à la bienvenue — ${lang}`, async ({ page }) => {
    const text =
      lang === 'fr'
        ? 'Prières, athkar, Coran, budget et projets, au même endroit. Tout reste sur ton téléphone.'
        : 'الصلاة والأذكار والقرآن والميزانية والمشاريع في مكان واحد. كل شيء يبقى على هاتفك.'
    await page.addInitScript((l) => localStorage.setItem('elhadj.lang', l), lang)

    // Sans JavaScript de l'app : seul l'écran pré-dessiné, dans la bonne langue
    await page.route('**/assets/*.js', (r) => r.abort())
    await page.goto('./')
    await expect(page.locator('#root > [data-shell]')).toHaveCount(1)
    await expect(page.locator(`[data-shell="welcome-${lang}"]`)).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    const shell = await box(page, text)

    // Avec l'app : même paragraphe, même taille
    await page.unroute('**/assets/*.js')
    await page.reload()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('[data-shell]')).toHaveCount(0)
    await page.evaluate(() => document.fonts.ready)
    const app = await box(page, text)
    expect(Math.abs(app.width - shell.width)).toBeLessThanOrEqual(1)
    expect(Math.abs(app.height - shell.height)).toBeLessThanOrEqual(1)
    expect(Math.abs(app.y - shell.y)).toBeLessThanOrEqual(2)
  })
}

test('après l’inscription, l’écran pré-dessiné est celui du code', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('elhadj.lang', 'fr')
    localStorage.setItem('elhadj.onboarded', '1')
  })
  await page.route('**/assets/*.js', (r) => r.abort())
  await page.goto('./')
  await expect(page.locator('#root > [data-shell]')).toHaveCount(1)
  await expect(page.locator('[data-shell="unlock-fr"]')).toBeVisible()
})
