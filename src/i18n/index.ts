import i18n, { type BackendModule } from 'i18next'
import { initReactI18next } from 'react-i18next'

import { readLang } from '@/app/device-prefs'

// Seule la langue affichée est chargée au démarrage ; l'autre arrive quand on change de langue.
const loadLanguage: BackendModule = {
  type: 'backend',
  init() {},
  read(lng, _ns, callback) {
    const file = lng === 'ar' ? import('./ar.json') : import('./fr.json')
    file.then((m) => callback(null, m.default)).catch((e: Error) => callback(e, false))
  },
}

/** Se résout quand les textes de la langue de départ sont prêts (à attendre avant le premier affichage). */
export const i18nReady = i18n
  .use(loadLanguage)
  .use(initReactI18next)
  .init({
    lng: readLang(),
    fallbackLng: false,
    supportedLngs: ['fr', 'ar'],
    interpolation: { escapeValue: false },
    returnNull: false,
    react: { useSuspense: false },
  })

export default i18n
