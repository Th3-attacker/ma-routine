import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { Habit } from '@/db/types'

/** Nom affiché d'une habitude : traduit pour les habitudes par défaut, sinon le texte libre. */
export function useHabitName(): (h: Habit) => string {
  const { t } = useTranslation()
  return useCallback((h: Habit) => (h.key ? t(`habits.${h.key}`) : (h.name ?? '')), [t])
}
