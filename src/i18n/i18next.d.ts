import 'i18next'

import type fr from './fr.json'

// Clés de traduction typées : une clé absente de fr.json est une erreur de compilation.
declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: typeof fr }
  }
}
