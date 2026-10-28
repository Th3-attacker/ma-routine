import { expect, test } from '@playwright/test'

import { enablePin, openApp, PIN, typePin, unlock } from './helpers.ts'

test('inscription en arabe : langue, prénom, pas de code', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('elhadj.lang', 'fr'))
  await page.goto('./')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bienvenue sur Sama Jàmm')
  // Le choix de la langue change tout l'écran aussitôt
  await page.getByRole('radio', { name: 'ع' }).click()
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('مرحبًا بك في سلامي')
  await page.getByRole('button', { name: 'متابعة' }).click()
  await page.getByLabel('الاسم', { exact: true }).fill('الحاج')
  await page.getByRole('button', { name: 'متابعة' }).click()
  await expect(page.getByText('مرحبًا، الحاج!')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name: 'السلام عليكم، الحاج' })).toBeVisible({ timeout: 10_000 })
  // Sans code, l'app s'ouvre directement au lancement suivant (le script de test remet le français).
  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: 'As-salâmu ‘alaykum, الحاج' })).toBeVisible()
  await expect(page.getByRole('group', { name: 'Clavier du code' })).toHaveCount(0)
})

test('code facultatif : codes refusés et différents, puis demandé au lancement suivant', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'fr' })
  await page.getByRole('button', { name: 'Réglages' }).click()
  await page.getByRole('button', { name: /^Sécurité/ }).click()
  await page.getByRole('button', { name: 'Protéger l’app par un code' }).click()
  await typePin(page, '1111')
  await expect(page.getByRole('alert')).toContainText('Quatre chiffres identiques')
  await typePin(page, PIN)
  await typePin(page, '1357')
  await expect(page.getByRole('alert')).toHaveText('Les deux codes ne correspondent pas. Recommence.')
  await typePin(page, PIN)
  await typePin(page, PIN)
  await expect(page.getByText('Code enregistré')).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Jàmm nga am, Elhadj ?')
  await unlock(page)
})

test('déverrouillage après rechargement, clavier physique, attente après 5 erreurs', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'fr' })
  await enablePin(page)
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Jàmm nga am, Elhadj ?')
  await expect(page.getByRole('navigation')).toHaveCount(0)

  // Clavier physique
  await page.keyboard.type('1111')
  await expect(page.getByRole('alert')).toHaveText('Code incorrect')
  for (let i = 0; i < 4; i++) await typePin(page, '1111')
  await expect(page.getByRole('alert')).toContainText('Trop d’essais. Réessaie dans')
  // L'attente survit au rechargement
  await page.reload()
  await expect(page.getByRole('alert')).toContainText('Trop d’essais')
  await expect(page.getByRole('button', { name: '2', exact: true })).toBeDisabled()
})

test('verrouillage au retour après le délai', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'fr' })
  await enablePin(page)
  // On simule : l'app a été cachée il y a 6 minutes.
  await page.evaluate(async () => {
    const req = indexedDB.open('elhadj')
    const dbh: IDBDatabase = await new Promise((r) => (req.onsuccess = () => r(req.result)))
    const tx = dbh.transaction('security', 'readwrite')
    const store = tx.objectStore('security')
    const row = await new Promise<Record<string, unknown>>((r) => {
      const g = store.get('device')
      g.onsuccess = () => r(g.result)
    })
    store.put({ ...row, lastHiddenAt: Date.now() - 6 * 60_000 })
    await new Promise((r) => (tx.oncomplete = r))
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(page.getByRole('group', { name: 'Clavier du code' })).toBeVisible()
  await unlock(page)
})

test('code oublié : tout effacer avec une confirmation en deux temps', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'fr' })
  await enablePin(page)
  await page.reload()
  await page.getByRole('button', { name: 'Code oublié ?' }).click()
  await expect(page.getByRole('alertdialog')).toContainText('La seule solution est d’effacer les données')
  await page.getByRole('button', { name: 'Continuer' }).click()
  await expect(page.getByRole('alertdialog')).toContainText('Toutes tes données sur ce téléphone seront supprimées.')
  await page.getByRole('button', { name: 'Tout effacer' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bienvenue sur Sama Jàmm')
})

test('Réglages → Sécurité : changer le code', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'fr' })
  await enablePin(page)
  await page.getByRole('button', { name: 'Réglages' }).click()
  await page.getByRole('button', { name: /^Sécurité/ }).click()
  await page.getByRole('button', { name: 'Changer mon code' }).click()
  await typePin(page, PIN)
  await typePin(page, '1357')
  await typePin(page, '1357')
  await expect(page.getByText('Code changé')).toBeVisible()
  await page.reload()
  await typePin(page, '1357')
  await expect(page.getByRole('navigation', { name: 'Sections' })).toBeVisible()
})

test('inscription : la position d’abord, la ville en secours', async ({ page, context }) => {
  await context.grantPermissions(['geolocation'])
  // Dakar
  await context.setGeolocation({ latitude: 14.7167, longitude: -17.4677 })
  await page.addInitScript(() => localStorage.setItem('elhadj.lang', 'fr'))
  await page.goto('./')
  await page.getByRole('button', { name: 'Continuer' }).click()
  await page.getByLabel('Prénom', { exact: true }).fill('Awa')
  const city = page.getByRole('combobox', { name: 'Ou choisis ta ville' })
  await expect(city.locator('option')).not.toContainText(['Ma position'])
  await page.getByRole('button', { name: 'Utiliser ma position' }).click()
  await expect(city).toHaveValue('custom')
  await expect(page.getByText('Horaires calculés pour ta position')).toBeVisible()
})
