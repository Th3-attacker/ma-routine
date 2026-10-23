// Modèle de données local (Dexie). Toutes les lignes ont id, updatedAt (ms), deleted et dirty.
// `deleted` et `dirty` valent 0 ou 1 (et non des booléens) : IndexedDB ne sait pas indexer les booléens,
// et le moteur de synchro (phase 2) cherchera les lignes avec dirty = 1.

export type Flag = 0 | 1

export type SyncMeta = {
  updatedAt: number
  deleted: Flag
  dirty: Flag
}

export const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const
export type Prayer = (typeof PRAYERS)[number]
/** Les 5 prières et Chourouq (lever du soleil, à titre informatif). */
export type PrayerOrSunrise = Prayer | 'sunrise'

export type PrayerStatus = 'jamaa' | 'ontime' | 'late' | 'missed'

export const METHOD_IDS = ['mwl', 'uqa', 'egy', 'kar', 'isna', 'uoif'] as const
export type MethodId = (typeof METHOD_IDS)[number]

export type AsrSchool = 'standard' | 'hanafi'

export const HABIT_KEYS = ['sport', 'read', 'water', 'family', 'sleep'] as const
export type HabitKey = (typeof HABIT_KEYS)[number]
/** `key` : habitude par défaut traduite ; `name` : texte libre. */
export type Habit = { id: string; key?: HabitKey; name?: string }

export type NotifSettings = {
  enabled: boolean
  prayers: Record<Prayer, boolean>
  minutesBefore: 0 | 5 | 10 | 15
  fridayKahf: boolean
  athkarMatin: boolean
  athkarSoir: boolean
  suhur: boolean
  iftar: boolean
}

export type Settings = SyncMeta & {
  id: 'me'
  /** Écran d'accueil du premier lancement terminé. */
  onboarded: boolean
  name: string
  cityId: string
  /** Position personnalisée : remplace la ville quand elle est remplie. */
  custom: { lat: number; lng: number; timezone: string } | null
  method: MethodId
  asrSchool: AsrSchool
  /** Ajustement en minutes par prière. */
  tune: Record<PrayerOrSunrise, number>
  /** Décalage du calendrier hégirien, de −2 à +2 jours. */
  hijriAdj: number
  currency: string
  quran: { goal: number; page: number; total: number; khatmas: number }
  habits: Habit[]
  budgets: Record<string, number>
  /** Nombre de prières à rattraper. */
  qada: number
  ramadanPreview: boolean
  notif: NotifSettings
}

export const SUNNA_KEYS = ['fajr2', 'rawatib', 'duha', 'witr', 'qiyam'] as const
export type SunnaKey = (typeof SUNNA_KEYS)[number]

export const ATHKAR_SETS = ['matin', 'soir', 'salat', 'nuit'] as const
export type AthkarSet = (typeof ATHKAR_SETS)[number]

export type FridayKey = 'kahf' | 'ghusl' | 'salawat' | 'early'

export type Day = SyncMeta & {
  /** 'YYYY-MM-DD' dans le fuseau de la ville. */
  id: string
  prayers: Partial<Record<Prayer, PrayerStatus>>
  sunna: Partial<Record<SunnaKey, boolean>>
  /** Compteur par index de dhikr, pour chaque série. */
  athkar: Partial<Record<AthkarSet, Record<number, number>>>
  tasbih: number
  tasbihBy: Record<number, number>
  habits: Record<string, boolean>
  quranPages: number
  friday: Partial<Record<FridayKey, boolean>>
  fasted: boolean
  tarawih: boolean
  journal: { good: string; better: string }
}
