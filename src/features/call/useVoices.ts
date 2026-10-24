import { useEffect, useState } from 'react'

import { speechSupported, voicesFor } from './speech'

/** Voix disponibles en français et en arabe (la liste arrive parfois après le chargement). */
export function useVoices(): { supported: boolean; fr: boolean; ar: boolean } {
  const read = () => ({ supported: speechSupported(), fr: voicesFor('fr').length > 0, ar: voicesFor('ar').length > 0 })
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
