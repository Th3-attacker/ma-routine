import type { MoneyType } from '@/db/types'

// Catégories et moyens de paiement de la maquette. Les noms sont traduits par i18n (categories.*, payMethods.*).

export type Category = { id: string; color: string }

export const CATEGORIES: Record<MoneyType, readonly Category[]> = {
  out: [
    { id: 'food', color: '--c1' },
    { id: 'transport', color: '--c2' },
    { id: 'home', color: '--c3' },
    { id: 'bills', color: '--c4' },
    { id: 'family', color: '--c5' },
    { id: 'health', color: '--c6' },
    { id: 'sadaqa', color: '--c7' },
    { id: 'clothes', color: '--c8' },
    { id: 'leisure', color: '--c9' },
    { id: 'other', color: '--c10' },
  ],
  in: [
    { id: 'salary', color: '--ok' },
    { id: 'business', color: '--c2' },
    { id: 'gift', color: '--c5' },
    { id: 'other_in', color: '--c10' },
  ],
}

export function categoryColor(id: string): string {
  return [...CATEGORIES.out, ...CATEGORIES.in].find((c) => c.id === id)?.color ?? '--c10'
}

export const PAY_METHODS = ['cash', 'bankily', 'masrvi', 'card', 'other'] as const
export type PayMethod = (typeof PAY_METHODS)[number]

export const PICK_COLORS = ['--c2', '--c1', '--c7', '--c3', '--c4', '--c5', '--c8', '--c9'] as const
