// Voix du téléphone (Web Speech API). Le navigateur ne l'autorise qu'après une action de l'utilisateur :
// la saisie du code au déverrouillage en compte une. Sinon, seul le bandeau s'affiche.

let readerOpen = false

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
 * Dit les phrases dans l'ordre. Une phrase sans voix dans sa langue est sautée (pas de bascule vers une autre langue).
 * Renvoie false si rien n'a été dit (voix absente, autre voix en cours, lecture plein écran ouverte).
 */
export function speak(parts: { text: string; lang: 'fr' | 'ar' }[]): boolean {
  if (!speechSupported() || readerOpen || speechSynthesis.speaking) return false
  let spoken = false
  for (const p of parts) {
    const voice = voicesFor(p.lang)[0]
    if (!voice) continue
    const u = new SpeechSynthesisUtterance(p.text)
    u.voice = voice
    u.lang = voice.lang
    u.rate = 0.95
    speechSynthesis.speak(u)
    spoken = true
  }
  return spoken
}
