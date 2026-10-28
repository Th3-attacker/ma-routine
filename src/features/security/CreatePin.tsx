import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PinPad } from '@/components/PinPad'

import { pinProblem, setPin } from './pin'

/** Choisir un code (2 saisies), avec refus des codes trop simples. `onDone` après l'enregistrement. */
export function CreatePin({ onDone, firstTitle }: { onDone: () => void | Promise<void>; firstTitle?: string }) {
  const { t } = useTranslation()
  const [first, setFirst] = useState<string | null>(null)
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)

  return (
    <PinPad
      title={first ? t('lock.confirm') : (firstTitle ?? t('lock.choose'))}
      message={message?.text}
      error={message?.error}
      onComplete={async (pin) => {
        if (!first) {
          const problem = pinProblem(pin)
          if (problem === 'repeated' || problem === 'sequence') {
            setMessage({ text: t(`lock.${problem}`), error: true })
            return false
          }
          setFirst(pin)
          setMessage(null)
          return true
        }
        if (pin !== first) {
          setFirst(null)
          setMessage({ text: t('lock.mismatch'), error: true })
          return false
        }
        await setPin(pin)
        await onDone()
        return true
      }}
    />
  )
}
