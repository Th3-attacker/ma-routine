import { describe, expect, it } from 'vitest'

import {
  applyLang,
  applyTextSize,
  applyTheme,
  isDark,
  langFromNavigator,
  nextThemeMode,
  readLang,
  readTextSize,
  readThemeMode,
  saveLang,
  saveTextSize,
  saveThemeMode,
} from './device-prefs'

describe('préférences de l’appareil', () => {
  it('prend l’arabe si la langue du téléphone commence par « ar »', () => {
    expect(langFromNavigator('ar')).toBe('ar')
    expect(langFromNavigator('ar-MR')).toBe('ar')
    expect(langFromNavigator('fr-FR')).toBe('fr')
    expect(langFromNavigator('en-US')).toBe('fr')
    expect(langFromNavigator('arn')).toBe('fr')
    expect(langFromNavigator(undefined)).toBe('fr')
  })

  it('mémorise la langue, le thème et la taille du texte', () => {
    saveLang('ar')
    saveThemeMode('dark')
    saveTextSize('xl')
    expect(readLang()).toBe('ar')
    expect(readThemeMode()).toBe('dark')
    expect(readTextSize()).toBe('xl')
  })

  it('ignore une valeur mémorisée invalide', () => {
    localStorage.setItem('elhadj.mode', 'violet')
    localStorage.setItem('elhadj.size', 'xxl')
    expect(readThemeMode()).toBe('auto')
    expect(readTextSize()).toBe('m')
  })

  it('fait défiler Automatique → Clair → Sombre', () => {
    expect(nextThemeMode('auto')).toBe('light')
    expect(nextThemeMode('light')).toBe('dark')
    expect(nextThemeMode('dark')).toBe('auto')
  })

  it('suit le système en mode Automatique', () => {
    expect(isDark('auto', true)).toBe(true)
    expect(isDark('auto', false)).toBe(false)
    expect(isDark('light', true)).toBe(false)
    expect(isDark('dark', false)).toBe(true)
  })

  it('applique lang, dir, la classe .dark et la taille de police sur <html>', () => {
    const html = document.documentElement
    applyLang('ar')
    expect(html.lang).toBe('ar')
    expect(html.dir).toBe('rtl')
    applyLang('fr')
    expect(html.dir).toBe('ltr')
    applyTheme(true)
    expect(html).toHaveClass('dark')
    applyTheme(false)
    expect(html).not.toHaveClass('dark')
    applyTextSize('l')
    expect(html.style.fontSize).toBe('110%')
    applyTextSize('s')
    expect(html.style.fontSize).toBe('92%')
  })
})
