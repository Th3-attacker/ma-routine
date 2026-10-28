import { PauseIcon, PlayIcon } from 'lucide-react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { writeLocal } from '@/lib/storage'

import { ADHAN_SOUND_KEY, adhanPlayer, adhanSoundOn, useAdhanPlaying } from './adhan'

/**
 * Réglages → Prière : écouter l'adhan (enregistrement libre de droits, voir « À propos »), et le faire jouer à
 * l'heure de la prière quand l'app est ouverte (préférence de l'appareil).
 */
export function AdhanSample() {
  const { t } = useTranslation()
  const playing = useAdhanPlaying()
  const [auto, setAuto] = useState(adhanSoundOn)
  const switchId = useId()

  return (
    <div className="flex flex-col gap-3">
      <Button
        variant="secondary"
        aria-pressed={playing}
        className="h-11 rounded-[14px] bg-primary-soft font-bold text-primary"
        onClick={() => (playing ? adhanPlayer.stop() : void adhanPlayer.play().catch(() => toast(t('audio.error'))))}
      >
        {playing ? <PauseIcon aria-hidden="true" /> : <PlayIcon aria-hidden="true" />}
        {t(playing ? 'adhan.stop' : 'adhan.listen')}
      </Button>
      <div className="flex items-center gap-3 rounded-[14px] border border-line bg-surface px-3.5 py-3">
        <label htmlFor={switchId} className="min-w-0 flex-1">
          <span className="block font-bold">{t('adhan.auto')}</span>
          <span className="block text-[0.8125rem] text-muted-foreground">{t('adhan.hint')}</span>
        </label>
        <Switch
          id={switchId}
          checked={auto}
          onCheckedChange={(v) => {
            setAuto(v)
            writeLocal(ADHAN_SOUND_KEY, v ? '1' : '0')
          }}
          className="data-checked:bg-ok"
        />
      </div>
    </div>
  )
}
