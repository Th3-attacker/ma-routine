import { PauseIcon, PlayIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import adhanUrl from '@/assets/adhan/adhan-exemple.mp3'
import { Button } from '@/components/ui/button'

/**
 * Écouter un exemple d'adhan (enregistrement libre de droits, voir « À propos »). Servi par l'app et gardé sur le
 * téléphone après la première écoute (src/sw.ts). Une notification web ne peut pas jouer ce son : elle garde celui
 * du téléphone.
 */
export function AdhanSample() {
  const { t } = useTranslation()
  const audio = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  useEffect(() => () => audio.current?.pause(), [])

  function toggle() {
    audio.current ??= Object.assign(new Audio(adhanUrl), { onended: () => setPlaying(false) })
    if (playing) {
      audio.current.pause()
      setPlaying(false)
      return
    }
    audio.current.currentTime = 0
    audio.current
      .play()
      .then(() => setPlaying(true))
      .catch(() => toast(t('audio.error')))
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button
        variant="secondary"
        aria-pressed={playing}
        className="h-11 rounded-[14px] bg-primary-soft font-bold text-primary"
        onClick={toggle}
      >
        {playing ? <PauseIcon aria-hidden="true" /> : <PlayIcon aria-hidden="true" />}
        {t(playing ? 'adhan.stop' : 'adhan.listen')}
      </Button>
      <p className="text-[0.8125rem] text-muted-foreground">{t('adhan.hint')}</p>
    </div>
  )
}
