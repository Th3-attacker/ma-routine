import { createMemoryHistory, RouterProvider } from '@tanstack/react-router'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { db, updateSettings } from '@/db'
import { setPin } from '@/features/security/pin'
import i18n from '@/i18n'

import { LockGate } from './LockGate'
import { Providers } from './Providers'
import { createAppRouter } from './router'

async function renderApp(path = '/', { locked = false } = {}) {
  const router = createAppRouter(createMemoryHistory({ initialEntries: [path] }))
  const app = <RouterProvider router={router} />
  render(<Providers>{locked ? <LockGate>{app}</LockGate> : app}</Providers>)
  await act(() => router.load())
  return router
}

async function typePin(user: ReturnType<typeof userEvent.setup>, pin: string) {
  for (const d of pin) await user.click(screen.getByRole('button', { name: d }))
}

beforeEach(async () => {
  await Promise.all(db.tables.map((t) => t.clear()))
})

describe('premier lancement', () => {
  it('inscription en 3 étapes : bienvenue, prénom, code deux fois', async () => {
    await act(() => i18n.changeLanguage('fr'))
    const user = userEvent.setup()
    await renderApp('/', { locked: true })
    expect(await screen.findByRole('heading', { level: 1, name: 'Bienvenue sur Sama Jàmm' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Continuer' }))
    await user.type(await screen.findByLabelText('Prénom'), 'Elhadj')
    await user.click(screen.getByRole('button', { name: 'Continuer' }))

    expect(await screen.findByRole('heading', { name: 'Choisis ton code à 4 chiffres' })).toBeInTheDocument()
    await typePin(user, '1234')
    expect(await screen.findByRole('alert')).toHaveTextContent('1234')
    await typePin(user, '2580')
    expect(await screen.findByRole('heading', { name: 'Tape-le une deuxième fois' })).toBeInTheDocument()
    await typePin(user, '2581')
    expect(await screen.findByRole('alert')).toHaveTextContent('Les deux codes ne correspondent pas. Recommence.')
    await typePin(user, '2580')
    await typePin(user, '2580')
    expect(await screen.findByText('Bienvenue, Elhadj !', {}, { timeout: 5000 })).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { level: 1, name: 'As-salâmu ‘alaykum, Elhadj' }, { timeout: 5000 }),
    ).toBeInTheDocument()
    const s = await db.security.get('device')
    expect(s?.hash).toBeTruthy()
    expect(JSON.stringify(s)).not.toContain('2580')
  }, 20_000)

  it('déverrouille avec le bon code, sans rien afficher avant', async () => {
    await act(() => i18n.changeLanguage('fr'))
    await updateSettings({ onboarded: true, name: 'Elhadj' })
    await setPin('2580')
    const user = userEvent.setup()
    await renderApp('/', { locked: true })
    expect(await screen.findByRole('heading', { name: 'Jàmm nga am, Elhadj ?' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    await typePin(user, '1111')
    expect(await screen.findByRole('alert')).toHaveTextContent('Code incorrect')
    await typePin(user, '2580')
    expect(await screen.findByRole('navigation', { name: 'Sections' })).toBeInTheDocument()
  }, 20_000)
})

describe('application', () => {
  beforeEach(async () => {
    await updateSettings({ onboarded: true })
  })

  it('affiche l’en-tête, la salutation et les 5 onglets', async () => {
    await act(() => i18n.changeLanguage('fr'))
    await renderApp()
    expect(screen.getByRole('banner')).toHaveTextContent('Sama Jàmm')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('As-salâmu ‘alaykum')
    const nav = screen.getByRole('navigation', { name: 'Sections' })
    expect(nav.querySelectorAll('a')).toHaveLength(5)
    expect(screen.getByRole('link', { name: /Aujourd’hui/ })).toHaveAttribute('aria-current', 'page')
  })

  it('passe en arabe et revient en français', async () => {
    localStorage.setItem('elhadj.lang', 'fr')
    await act(() => i18n.changeLanguage('fr'))
    const user = userEvent.setup()
    await renderApp()
    await user.click(screen.getByRole('button', { name: 'Passer en arabe' }))
    expect(document.documentElement).toHaveAttribute('dir', 'rtl')
    expect(document.documentElement).toHaveAttribute('lang', 'ar')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('السلام عليكم')
    expect(localStorage.getItem('elhadj.lang')).toBe('ar')
    await user.click(screen.getByRole('button', { name: 'التبديل إلى الفرنسية' }))
    expect(document.documentElement).toHaveAttribute('dir', 'ltr')
  })

  it('fait défiler les thèmes avec le bouton de l’en-tête', async () => {
    localStorage.setItem('elhadj.lang', 'fr')
    await act(() => i18n.changeLanguage('fr'))
    const user = userEvent.setup()
    await renderApp()
    await user.click(screen.getByRole('button', { name: 'Apparence : Automatique' }))
    expect(document.documentElement).not.toHaveClass('dark')
    await user.click(screen.getByRole('button', { name: 'Apparence : Clair' }))
    expect(document.documentElement).toHaveClass('dark')
    expect(localStorage.getItem('elhadj.mode')).toBe('dark')
  })
})
