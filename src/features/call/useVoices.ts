import { useEffect, useState } from 'react'

import { speechSupported, voicesFor } from './speech'

type VoiceInfo = { uri: string; name: string }

const list = (lang: 'fr' | 'ar'): VoiceInfo[] => voicesFor(lang).map((v) => ({ uri: v.voiceURI, name: v.name }))

/** Voix disponibles en français et en arabe (la liste arrive parfois après le chargement). */
export function useVoices(): { supported: boolean; fr: VoiceInfo[]; ar: VoiceInfo[] } {
  const read = () => ({ supported: speechSupported(), fr: list('fr'), ar: list('ar') })
  const [state, setState] = useState(read)
  useEffect(() => {
    if (!speechSupported()) return
    const update = () => setState(read())
    speechSynthesis.addEventListener('voiceschanged', update)
    update()
    return () => speechSynthesis.removeEventListener('voiceschanged', update)
  }, [])
  return state
}
