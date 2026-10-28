// Modèle de données local (Dexie). Toutes les lignes ont id, updatedAt (ms), deleted et dirty.
// `deleted` et `dirty` valent 0 ou 1 (et non des booléens) : IndexedDB ne sait pas indexer les booléens,
// et le moteur de synchro cherche les lignes avec dirty = 1.

export type Flag = 0 | 1

export type SyncMeta = {
  updatedAt: number
  deleted: Flag
  dirty: Flag
}

export const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const
export type Prayer = (typeof PRAYERS)[number]
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

export type CallLang = 'app' | 'fr' | 'ar' | 'both'

/** Appel personnel avant l'adhan (« Elhadj, la prière »). */
export type CallSettings = {
  enabled: boolean
  /** De 1 à 15 minutes avant l'adhan. */
  minutesBefore: number
  prayers: Record<Prayer, boolean>
  lang: CallLang
  voice: boolean
}

export type Settings = SyncMeta & {
  id: 'me'
  /** Écran d'accueil du premier lancement terminé. */
  onboarded: boolean
  name: string
  /** Prénom en arabe (facultatif), pour l'appel en arabe. */
  nameAr: string
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
  call: CallSettings
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
  /** Heure de modification de chaque champ (ms), pour fusionner champ par champ entre deux téléphones. */
  fieldTimes?: Partial<Record<DayField, number>>
}

export type DayField = Exclude<keyof Day, 'id' | 'updatedAt' | 'deleted' | 'dirty' | 'fieldTimes'>

export type LockDelay = 0 | 1 | 5 | 15

/**
 * Verrou de l'app sur cet appareil. Jamais synchronisé : sur un nouvel appareil, on choisit un code.
 * Le code n'est jamais stocké : seulement son hachage PBKDF2-SHA-256 et le sel (en base64).
 */
export type Security = {
  id: 'device'
  salt: string | null
  hash: string | null
  iterations: number
  failedCount: number
  /** Heure (ms) jusqu'à laquelle la saisie est bloquée après des erreurs. */
  lockedUntil: number
  /** Heure (ms) à laquelle l'app est passée en arrière-plan. */
  lastHiddenAt: number | null
  /** Délai avant de redemander le code au retour : 0 = à chaque ouverture. */
  lockAfterMin: LockDelay
  /** Clé d'accès de l'appareil pour l'empreinte ou le visage (WebAuthn) : identifiant et clé publique. */
  passkey: { id: string; publicKey: string; alg: number } | null
}

// ── Budget et projets ── montants entiers en ouguiyas

export type MoneyType = 'out' | 'in'

export type Transaction = SyncMeta & {
  id: string
  type: MoneyType
  amount: number
  category: string
  payMethod: string
  note: string
  /** 'YYYY-MM-DD' */
  date: string
  createdAt: number
  /** Opération récurrente qui l'a créée. */
  recurringId?: string
}

export type ProjectStatus = 'active' | 'paused' | 'done'

export type Project = SyncMeta & {
  id: string
  name: string
  /** La niyya. */
  intention: string
  /** 'YYYY-MM-DD' ou '' */
  deadline: string
  /** Token de couleur : '--c1' … '--c10' */
  color: string
  status: ProjectStatus
  createdAt: number
}

export type Task = SyncMeta & {
  id: string
  projectId: string
  title: string
  done: boolean
  /** 'YYYY-MM-DD' ou '' */
  due: string
  position: number
  /** Jour où l'étape a été cochée (pour le bilan du soir). */
  doneAt: string | null
}

export type Movement = { amount: number; date: string }

export type Debt = SyncMeta & {
  id: string
  /** 'in' : on me doit · 'out' : je dois */
  direction: 'in' | 'out'
  person: string
  amount: number
  due: string
  note: string
  payments: Movement[]
  closed: boolean
  createdAt: number
}

export type SavingsGoal = SyncMeta & {
  id: string
  name: string
  target: number
  deadline: string
  color: string
  /** Positif : versement · négatif : retrait */
  moves: Movement[]
  createdAt: number
}

export type Recurring = SyncMeta & {
  id: string
  type: MoneyType
  name: string
  amount: number
  category: string
  payMethod: string
  /** Jour du mois, de 1 à 28. */
  day: number
  active: boolean
  /** 'YYYY-MM' du dernier ajout, ou '' */
  lastMonth: string
}
