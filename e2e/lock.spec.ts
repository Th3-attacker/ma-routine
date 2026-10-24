import { expect, test } from '@playwright/test'

import { openApp, PIN, typePin, unlock } from './helpers.ts'

test('inscription en arabe : langue, prénom arabe, codes refusés et différents', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('elhadj.lang', 'fr'))
  await page.goto('./')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bienvenue sur ELHADJ')
  // Le choix de la langue change tout l'écran aussitôt
  await page.getByRole('radio', { name: 'ع' }).click()
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('مرحبًا بك في ELHADJ')
  await page.getByRole('button', { name: 'متابعة' }).click()
  await page.getByLabel('الاسم', { exact: true }).fill('Elhadj')
  await page.getByLabel('الاسم بالعربية (اختياري)').fill('الحاج')
  await page.getByRole('button', { name: 'متابعة' }).click()

  await typePin(page, '1111')
  await expect(page.getByRole('alert')).toContainText('أربعة أرقام متطابقة')
  await typePin(page, PIN)
  await expect(page.getByRole('heading', { name: 'اكتبه مرة ثانية' })).toBeVisible()
  await typePin(page, '1357')
  await expect(page.getByRole('alert')).toHaveText('الرمزان غير متطابقين. أعد المحاولة.')
  await typePin(page, PIN)
  await typePin(page, PIN)
  await expect(page.getByText('مرحبًا، الحاج!')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name: 'السلام عليكم، الحاج' })).toBeVisible({ timeout: 10_000 })
})

test('déverrouillage après rechargement, clavier physique, attente après 5 erreurs', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'fr' })
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('As-salâmu ‘alaykum, Elhadj')
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

test('code oublié sans compte : tout effacer avec une confirmation en deux temps', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'fr' })
  await page.reload()
  await page.getByRole('button', { name: 'Code oublié ?' }).click()
  await expect(page.getByRole('alertdialog')).toContainText('La seule solution est d’effacer les données')
  await page.getByRole('button', { name: 'Continuer' }).click()
  await expect(page.getByRole('alertdialog')).toContainText('Toutes tes données sur ce téléphone seront supprimées.')
  await page.getByRole('button', { name: 'Tout effacer' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bienvenue sur ELHADJ')
})

test('Réglages → Sécurité : changer le code', async ({ page }) => {
  await openApp(page, { 'elhadj.lang': 'fr' })
  await page.getByRole('button', { name: 'Réglages' }).click()
  await page.getByRole('button', { name: 'Changer mon code' }).click()
  await typePin(page, PIN)
  await typePin(page, '1357')
  await typePin(page, '1357')
  await expect(page.getByText('Code changé')).toBeVisible()
  await page.reload()
  await typePin(page, '1357')
  await expect(page.getByRole('navigation', { name: 'Sections' })).toBeVisible()
})
