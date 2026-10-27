// Voix du téléphone (Web Speech API). Le navigateur ne l'autorise qu'après une action de l'utilisateur :
// la saisie du code au déverrouillage en compte une. Sinon, seul le bandeau s'affiche.

import { readLocal } from '@/lib/storage'

let readerOpen = false

/** Voix choisie à la main sur cet appareil (préférence de l'appareil, jamais synchronisée). */
export const voiceKey = (lang: 'fr' | 'ar') => `elhadj.voice.${lang}`

// Voix d'homme connues (iPhone / Mac, Windows / Edge, Android). La liste du téléphone ne dit pas si une voix est
// masculine : on la reconnaît à son nom.
const MALE_NAMES = [
  // français
  'thomas',
  'nicolas',
  'daniel',
  'reed',
  'eddy',
  'rocko',
  'grandpa',
  'paul',
  'henri',
  'claude',
  'remy',
  'rémy',
  'gerard',
  'gérard',
  'jerome',
  'jérôme',
  'fabrice',
  'antoine',
  'alain',
  'jean',
  'yves',
  'guillaume',
  'lucien',
  'frb-',
  'frd-',
  // arabe
  'maged',
  'majed',
  'tarik',
  'naayf',
  'hamed',
  'shakir',
  'hamdan',
  'omar',
  'taim',
  'bassel',
  'moaz',
  'rami',
  'jamal',
  'ali',
  'saleh',
  'fahed',
  'hedi',
  'ismael',
  'kareem',
  'laith',
  'abdullah',
  'ard-',
  'are-',
]
const FEMALE = /female|femme|woman/i

/** Une voix d'homme ? (d'après son nom ; « male » mais pas « female ») */
export function isMaleVoice(v: Pick<SpeechSynthesisVoice, 'name' | 'voiceURI'>): boolean {
  const name = `${v.name} ${v.voiceURI}`.toLowerCase()
  if (FEMALE.test(name)) return false
  if (/\bmale\b/.test(name)) return true
  return MALE_NAMES.some((m) => (m.endsWith('-') ? name.includes(m) : new RegExp(`\\b${m}\\b`).test(name)))
}

/**
 * La voix à utiliser : celle choisie dans les réglages si elle existe encore, sinon une voix d'homme,
 * sinon la première voix de la langue.
 */
export function pickVoice<V extends Pick<SpeechSynthesisVoice, 'name' | 'voiceURI'>>(
  voices: readonly V[],
  chosen: string | null,
): V | undefined {
  return voices.find((v) => v.voiceURI === chosen) ?? voices.find(isMaleVoice) ?? voices[0]
}

/** La lecture plein écran des athkar est ouverte : pas de voix pendant ce temps. */
export function setReaderOpen(open: boolean): void {
  readerOpen = open
}

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
}

/** Voix disponibles pour une langue (« ar » → ar-SA, ar-EG… ; « fr » → fr-FR…). */
export function voicesFor(lang: 'fr' | 'ar'): SpeechSynthesisVoice[] {
  if (!speechSupported()) return []
  return speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(lang))
}

/**
 * Dit les phrases dans l'ordre. Une phrase sans voix dans sa langue est sautée (pas de bascule vers une autre langue),
 * sauf si le navigateur ne donne aucune liste de voix.
 * Renvoie false si rien n'a été dit (voix absente, autre voix en cours, lecture plein écran ouverte).
 */
export function speak(parts: { text: string; lang: 'fr' | 'ar' }[], onError?: (code: string) => void): boolean {
  if (!speechSupported() || readerOpen || speechSynthesis.speaking) return false
  // Certains téléphones Android ne donnent pas la liste de leurs voix au navigateur, mais savent parler :
  // on laisse alors le téléphone choisir sa voix d'après la langue.
  const noList = speechSynthesis.getVoices().length === 0
  let spoken = false
  for (const p of parts) {
    const voice = pickVoice(voicesFor(p.lang), readLocal(voiceKey(p.lang)))
    if (!voice && !noList) continue
    const u = new SpeechSynthesisUtterance(p.text)
    if (voice) {
      u.voice = voice
      u.lang = voice.lang
      // Pas de voix d'homme sur ce téléphone : la voix choisie automatiquement est rendue un peu plus grave.
      if (!readLocal(voiceKey(p.lang)) && !isMaleVoice(voice)) u.pitch = 0.75
    } else {
      u.lang = p.lang === 'ar' ? 'ar-SA' : 'fr-FR'
      u.pitch = 0.75
    }
    u.rate = 0.95
    u.onerror = (e) => {
      // Visible aussi dans le terminal de « pnpm dev:phone », pour comprendre un téléphone qui reste muet.
      console.error(`voix ${p.lang} : ${e.error} (${voice?.name ?? 'voix du téléphone'})`)
      onError?.(e.error)
    }
    speechSynthesis.speak(u)
    spoken = true
  }
  return spoken
}
