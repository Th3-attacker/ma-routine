import { readLocal, writeLocal } from '@/lib/storage'

// Préférences propres à l'appareil : jamais synchronisées.
// Les clés sont les mêmes que dans la maquette, et que dans le script de index.html.

export type Lang = 'fr' | 'ar'
export type ThemeMode = 'auto' | 'light' | 'dark'
export type TextSize = 's' | 'm' | 'l' | 'xl'

const LANGS: readonly Lang[] = ['fr', 'ar']
export const THEME_MODES: readonly ThemeMode[] = ['auto', 'light', 'dark']
export const TEXT_SIZES: readonly TextSize[] = ['s', 'm', 'l', 'xl']

const TEXT_SCALE: Record<TextSize, number> = { s: 92, m: 100, l: 110, xl: 122 }

const KEYS = { lang: 'elhadj.lang', mode: 'elhadj.mode', size: 'elhadj.size' } as const

function isOneOf<T extends string>(list: readonly T[], v: string | null): v is T {
  return v !== null && (list as readonly string[]).includes(v)
}

/** Langue du téléphone : arabe si elle commence par « ar », sinon français. */
export function langFromNavigator(navLang: string | undefined): Lang {
  return /^ar\b/i.test(navLang ?? '') ? 'ar' : 'fr'
}

export function readLang(): Lang {
  const v = readLocal(KEYS.lang)
  if (isOneOf(LANGS, v)) return v
  return langFromNavigator(typeof navigator === 'undefined' ? undefined : navigator.language)
}

export function readThemeMode(): ThemeMode {
  const v = readLocal(KEYS.mode)
  return isOneOf(THEME_MODES, v) ? v : 'auto'
}

export function readTextSize(): TextSize {
  const v = readLocal(KEYS.size)
  return isOneOf(TEXT_SIZES, v) ? v : 'm'
}

export const saveLang = (v: Lang) => writeLocal(KEYS.lang, v)
export const saveThemeMode = (v: ThemeMode) => writeLocal(KEYS.mode, v)
export const saveTextSize = (v: TextSize) => writeLocal(KEYS.size, v)

export function nextThemeMode(mode: ThemeMode): ThemeMode {
  return THEME_MODES[(THEME_MODES.indexOf(mode) + 1) % THEME_MODES.length]
}

export function isDark(mode: ThemeMode, systemDark: boolean): boolean {
  return mode === 'dark' || (mode === 'auto' && systemDark)
}

export function applyLang(lang: Lang, root: HTMLElement = document.documentElement): void {
  root.lang = lang
  root.dir = lang === 'ar' ? 'rtl' : 'ltr'
}

export function applyTheme(dark: boolean, root: HTMLElement = document.documentElement): void {
  root.classList.toggle('dark', dark)
  root.style.colorScheme = dark ? 'dark' : 'light'
  const meta = document.querySelector('meta[name="theme-color"]')
  meta?.setAttribute('content', dark ? '#0D1022' : '#F1F2F7')
}

export function applyTextSize(size: TextSize, root: HTMLElement = document.documentElement): void {
  root.style.fontSize = `${TEXT_SCALE[size]}%`
}
