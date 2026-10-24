import { BellRingIcon, XIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { CallAlert } from '@/features/call/useCallAlarm'

/** Bandeau de l'appel avant l'adhan, en haut de l'écran (« Elhadj, la prière · Asr à 16:08 »). */
export function CallBanner({ alert, onClose }: { alert: CallAlert | null; onClose: () => void }) {
  const { t } = useTranslation()
  if (!alert) return null
  return (
    <div
      role="alert"
      className="fixed inset-x-0 top-[calc(8px+env(safe-area-inset-top,0px))] z-40 mx-auto flex w-[calc(100%-32px)] max-w-[528px] items-center gap-3 rounded-2xl bg-(image:--sky-night) py-2 ps-4 pe-2 text-sky-ink shadow-card"
    >
      <BellRingIcon className="size-5 flex-none text-sky-accent" aria-hidden="true" />
      <p className="min-w-0 flex-1 text-[0.9375rem] font-bold">{alert.text}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label={t('call.close')}
        className="grid size-11 flex-none place-items-center rounded-[12px] text-sky-ink/80"
      >
        <XIcon className="size-5" aria-hidden="true" />
      </button>
    </div>
  )
}
