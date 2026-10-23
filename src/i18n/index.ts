import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { readLang } from '@/app/device-prefs'

import ar from './ar.json'
import fr from './fr.json'

export const resources = {
  fr: { translation: fr },
  ar: { translation: ar },
} as const

void i18n.use(initReactI18next).init({
  resources,
  lng: readLang(),
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
  returnNull: false,
})

export default i18n
