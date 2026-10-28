// Carillon doux, joué quand le téléphone ne sait pas parler (par exemple le navigateur Huawei, sans synthèse vocale).
// Créé par l'app avec Web Audio : aucun fichier son à télécharger.

type AudioCtx = typeof AudioContext
let ctx: AudioContext | null = null

function audioContext(): AudioContext | null {
  const Ctor = (window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtx }).webkitAudioContext) as
    AudioCtx | undefined
  if (!Ctor) return null
  try {
    ctx ??= new Ctor()
    return ctx
  } catch {
    return null
  }
}

/** Les téléphones n'autorisent le son qu'après un geste : on prépare l'audio au premier toucher (le code, par ex.). */
export function primeAudio(): void {
  void audioContext()
    ?.resume()
    .catch(() => {})
}

/** Trois notes douces (environ 1,5 s) et une vibration. Renvoie false si le son est impossible ici. */
export function chime(): boolean {
  navigator.vibrate?.([200, 100, 200])
  const ac = audioContext()
  if (!ac) return false
  void ac.resume().catch(() => {})
  const start = ac.currentTime + 0.05
  // Mi, sol, do : un accord simple, comme un carillon de porte.
  for (const [i, freq] of [659.25, 783.99, 1046.5].entries()) {
    const t = start + i * 0.35
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.25, t + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9)
    osc.connect(gain).connect(ac.destination)
    osc.start(t)
    osc.stop(t + 0.95)
  }
  return true
}
