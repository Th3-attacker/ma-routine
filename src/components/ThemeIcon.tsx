import type { ThemeMode } from '@/app/device-prefs'

import { AutoThemeIcon, MoonIcon, SunIcon } from './icons'

export function ThemeIcon({ mode, className }: { mode: ThemeMode; className?: string }) {
  if (mode === 'light') return <SunIcon className={className} />
  if (mode === 'dark') return <MoonIcon className={className} />
  return <AutoThemeIcon className={className} />
}
