import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { DirectionProvider } from '@/components/ui/direction'

import {
  applyLang,
  applyTextSize,
  applyTheme,
  isDark,
  readLang,
  readTextSize,
  readThemeMode,
  saveLang,
  saveTextSize,
  saveThemeMode,
  type Lang,
  type TextSize,
  type ThemeMode,
} from './device-prefs'

type Preferences = {
  lang: Lang
  themeMode: ThemeMode
  /** Thème réellement affiché, après prise en compte du système en mode Automatique. */
  resolvedTheme: 'light' | 'dark'
  textSize: TextSize
  setLang: (v: Lang) => void
  setThemeMode: (v: ThemeMode) => void
  setTextSize: (v: TextSize) => void
}

const PreferencesContext = createContext<Preferences | null>(null)

const DARK_QUERY = '(prefers-color-scheme: dark)'

function useSystemDark(): boolean {
  const [dark, setDark] = useState(() => typeof matchMedia === 'function' && matchMedia(DARK_QUERY).matches)
  useEffect(() => {
    if (typeof matchMedia !== 'function') return
    const mq = matchMedia(DARK_QUERY)
    const onChange = () => setDark(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return dark
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()
  const [lang, setLangState] = useState<Lang>(readLang)
  const [themeMode, setThemeModeState] = useState<ThemeMode>(readThemeMode)
  const [textSize, setTextSizeState] = useState<TextSize>(readTextSize)
  const systemDark = useSystemDark()
  const dark = isDark(themeMode, systemDark)

  useEffect(() => {
    applyLang(lang)
    if (i18n.language !== lang) void i18n.changeLanguage(lang)
  }, [lang, i18n])

  useEffect(() => applyTheme(dark), [dark])
  useEffect(() => applyTextSize(textSize), [textSize])

  const setLang = useCallback((v: Lang) => {
    saveLang(v)
    setLangState(v)
  }, [])
  const setThemeMode = useCallback((v: ThemeMode) => {
    saveThemeMode(v)
    setThemeModeState(v)
  }, [])
  const setTextSize = useCallback((v: TextSize) => {
    saveTextSize(v)
    setTextSizeState(v)
  }, [])

  const value = useMemo<Preferences>(
    () => ({
      lang,
      themeMode,
      resolvedTheme: dark ? 'dark' : 'light',
      textSize,
      setLang,
      setThemeMode,
      setTextSize,
    }),
    [lang, themeMode, dark, textSize, setLang, setThemeMode, setTextSize],
  )

  return (
    <PreferencesContext.Provider value={value}>
      <DirectionProvider dir={lang === 'ar' ? 'rtl' : 'ltr'}>{children}</DirectionProvider>
    </PreferencesContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePreferences(): Preferences {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences doit être utilisé dans <PreferencesProvider>')
  return ctx
}
