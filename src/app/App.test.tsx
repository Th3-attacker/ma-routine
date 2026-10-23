import { createMemoryHistory, RouterProvider } from '@tanstack/react-router'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { db, updateSettings } from '@/db'
import i18n from '@/i18n'

import { Providers } from './Providers'
import { createAppRouter } from './router'

async function renderApp(path = '/') {
  const router = createAppRouter(createMemoryHistory({ initialEntries: [path] }))
  render(
    <Providers>
      <RouterProvider router={router} />
    </Providers>,
  )
  await act(() => router.load())
  return router
}

beforeEach(async () => {
  await Promise.all(db.tables.map((t) => t.clear()))
})

describe('premier lancement', () => {
  it('demande le prénom et la ville, puis ouvre Aujourd’hui', async () => {
    await act(() => i18n.changeLanguage('fr'))
    const user = userEvent.setup()
    await renderApp()
    expect(await screen.findByRole('heading', { level: 1, name: 'Bienvenue sur ELHADJ' })).toBeInTheDocument()
    await user.type(screen.getByLabelText('Ton prénom'), 'Elhadj')
    await user.click(screen.getByRole('button', { name: 'Commencer' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'As-salâmu ‘alaykum, Elhadj' })).toBeInTheDocument()
    expect((await db.settings.get('me'))?.onboarded).toBe(true)
  })
})

describe('application', () => {
  beforeEach(async () => {
    await updateSettings({ onboarded: true })
  })

  it('affiche l’en-tête, la salutation et les 5 onglets', async () => {
    await act(() => i18n.changeLanguage('fr'))
    await renderApp()
    expect(screen.getByRole('banner')).toHaveTextContent('ELHADJ')
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
