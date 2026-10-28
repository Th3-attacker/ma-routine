import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { enablePin, openApp } from './helpers.ts'

// Contrôle automatique d'accessibilité (axe, règles WCAG 2.1 A et AA) sur chaque écran, en français et en arabe,
// en clair et en sombre. Une seule largeur suffit : les autres tests vérifient déjà la mise en page.

async function audit(page: Page, where: string, found: string[], only?: string) {
  // Laisse finir les animations (volets, apparition) avant de mesurer les contrastes.
  await page.waitForTimeout(400)
  // Volet ouvert : on ne mesure que lui (la page derrière est assombrie et inactive).
  // Les messages passagers (toasts) sont exclus : mesurés pendant leur apparition, ils sont encore transparents.
  const builder = new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .exclude('[data-sonner-toaster]')
  const { violations } = await (only ? builder.include(only) : builder).analyze()
  for (const v of violations) found.push(`${where} · ${v.id} : ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)
}

const SCREENS = [
  { path: './#/', name: 'aujourdhui' },
  { path: './#/priere', name: 'priere' },
  { path: './#/athkar', name: 'athkar' },
  { path: './#/athkar?set=douas', name: 'invocations' },
  { path: './#/budget', name: 'budget' },
  { path: './#/budget?view=debts', name: 'dettes' },
  { path: './#/budget?view=goals', name: 'epargne' },
  { path: './#/budget?view=rec', name: 'recurrentes' },
  { path: './#/projets', name: 'projets' },
]

for (const lang of ['fr', 'ar'] as const) {
  for (const mode of ['light', 'dark'] as const) {
    test(`accessibilité — ${lang}, ${mode}`, async ({ page }, info) => {
      test.skip(info.project.name !== '360px', 'une seule largeur')
      test.setTimeout(120_000)
      const found: string[] = []
      await page.addInitScript((m) => localStorage.setItem('elhadj.mode', m), mode)
      await page.goto('./')
      await audit(page, 'bienvenue', found)
      await openApp(page, { 'elhadj.lang': lang, 'elhadj.mode': mode })
      for (const s of SCREENS) {
        await page.goto(s.path)
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
        await audit(page, s.name, found)
      }
      // Les volets : réglages (liste et chaque rubrique)
      await page.goto('./#/')
      await page.getByRole('button', { name: lang === 'fr' ? 'Réglages' : 'الإعدادات' }).click()
      const dialog = page.getByRole('dialog')
      await audit(page, 'réglages', found, '[role=dialog]')
      const sections = dialog.getByRole('navigation').getByRole('button')
      const count = await sections.count()
      for (let i = 0; i < count; i++) {
        await dialog.getByRole('navigation').getByRole('button').nth(i).click()
        await audit(page, `réglages ${i + 1}`, found, '[role=dialog]')
        await dialog
          .getByRole('button', { name: lang === 'fr' ? 'Retour aux réglages' : 'العودة إلى الإعدادات' })
          .click()
      }
      expect(found, found.join('\n')).toEqual([])
    })
  }
}

for (const mode of ['light', 'dark'] as const) {
  test(`accessibilité des volets et écrans pleins — ${mode}`, async ({ page }, info) => {
    test.skip(info.project.name !== '360px', 'une seule largeur')
    test.setTimeout(120_000)
    const found: string[] = []
    await openApp(page, { 'elhadj.lang': 'fr', 'elhadj.mode': mode })

    // Budget avec une dépense au-dessus du budget (carte des conseils, alerte)
    await page.goto('./#/budget')
    await page.getByRole('button', { name: 'Répartir mes revenus', exact: true }).click()
    await audit(page, 'volet budgets', found, '[role=dialog]')
    await page.getByRole('dialog').getByLabel('Alimentation').fill('10000')
    await page.getByRole('dialog').getByRole('button', { name: 'Enregistrer' }).click()
    await page.getByRole('button', { name: 'Dépense', exact: true }).click()
    await audit(page, 'volet dépense', found, '[role=dialog]')
    await page.getByRole('dialog').getByLabel('Montant').fill('12000')
    await page.getByRole('dialog').getByRole('button', { name: 'Ajouter' }).click()
    await expect(page.getByRole('region', { name: 'Conseils du mois' })).toBeVisible()
    await audit(page, 'budget rempli', found)
    await page.goto('./#/')
    await audit(page, 'aujourdhui avec alerte', found)

    // Projet : création et détail
    await page.goto('./#/projets')
    await page.getByRole('button', { name: 'Nouveau projet' }).click()
    await audit(page, 'volet projet', found, '[role=dialog]')
    await page.getByRole('dialog').getByLabel('Nom du projet').fill('Mémoriser sourate Al-Mulk')
    await page.getByRole('dialog').getByRole('button', { name: 'Créer le projet' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Proposer des étapes' }).click()
    await audit(page, 'détail du projet', found, '[role=dialog]')
    await page.keyboard.press('Escape')

    // Athkar en plein écran
    await page.goto('./#/athkar')
    await page.getByRole('button', { name: 'Plein écran' }).click()
    await audit(page, 'athkar plein écran', found, '[role=dialog]')
    await page.keyboard.press('Escape')

    // Écran du code (facultatif, activé dans les réglages) après un rechargement
    await enablePin(page)
    await page.reload()
    await expect(page.getByRole('group', { name: 'Clavier du code' })).toBeVisible()
    await audit(page, 'déverrouillage', found)

    expect(found, found.join('\n')).toEqual([])
  })
}
