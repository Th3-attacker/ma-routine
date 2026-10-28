import { PauseIcon, PlayIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { audioUrl, currentKey, player, usePlayer, type Track } from '@/features/athkar/audio'
import { cn } from '@/lib/utils'

/**
 * Bouton ▶ / ⏸ : joue la file à partir de « from ». Rien n'est affiché si ce texte n'a pas d'enregistrement.
 * Toucher le bouton du texte en cours met en pause ou reprend.
 */
export function AudioButton({
  queue,
  from = 0,
  label,
  className,
}: {
  queue: readonly Track[]
  from?: number
  /** Nom lu par les lecteurs d'écran (« Écouter : … »). */
  label?: string
  className?: string
}) {
  const { t } = useTranslation()
  const state = usePlayer()
  const track = queue[from]
  if (!audioUrl(track)) return null
  const current = currentKey(state) === track.key
  const playing = current && state.playing

  return (
    <button
      type="button"
      aria-label={
        label ? `${t(playing ? 'audio.pause' : 'audio.play')} : ${label}` : t(playing ? 'audio.pause' : 'audio.play')
      }
      onClick={() => {
        if (current) player.toggle()
        else player.play(queue, from, () => toast(t('audio.error')))
      }}
      className={cn(
        'grid size-11 flex-none place-items-center rounded-full border border-line bg-surface text-primary',
        playing && 'border-primary bg-primary text-primary-foreground',
        className,
      )}
    >
      {playing ? (
        <PauseIcon className="size-5" aria-hidden="true" />
      ) : (
        <PlayIcon className="size-5" aria-hidden="true" />
      )}
    </button>
  )
}
