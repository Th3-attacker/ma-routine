import { DeleteIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PIN_LENGTH } from '@/features/security/pin'
import { vibrate } from '@/lib/haptics'
import { cn } from '@/lib/utils'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'] as const

/**
 * Clavier du code : 4 ronds et clavier 3 × 4 dessiné, toujours de gauche à droite.
 * Valide tout seul au 4e chiffre. `onComplete` renvoie false si le code est refusé (tremblement + vibration).
 * Les chiffres ne sont jamais affichés ni lus à voix haute.
 */
export function PinPad({
  title,
  message,
  error,
  disabled,
  onComplete,
}: {
  title: string
  /** Message sous le titre (erreur, attente…). */
  message?: string
  /** Le message est une erreur (couleur rouge, annoncée tout de suite). */
  error?: boolean
  disabled?: boolean
  onComplete: (pin: string) => Promise<boolean> | boolean
}) {
  const { t } = useTranslation()
  const [digits, setDigits] = useState('')
  const [shake, setShake] = useState(0)
  // Pendant la vérification (PBKDF2), le clavier est désactivé : aucune touche n'est perdue ni comptée en double.
  const [busy, setBusy] = useState(false)

  async function press(key: string) {
    if (disabled || busy) return
    if (key === 'del') {
      setDigits((d) => d.slice(0, -1))
      return
    }
    const next = (digits + key).slice(0, PIN_LENGTH)
    setDigits(next)
    if (next.length < PIN_LENGTH) return
    setBusy(true)
    const ok = await onComplete(next)
    setBusy(false)
    setDigits('')
    if (!ok) {
      setShake((n) => n + 1)
      vibrate([60, 40, 60])
    }
  }

  // Les chiffres du clavier physique marchent aussi.
  const pressRef = useRef(press)
  useEffect(() => {
    pressRef.current = press
  })
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (/^\d$/.test(e.key)) void pressRef.current(e.key)
      else if (e.key === 'Backspace') void pressRef.current('del')
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h2 className="font-display text-xl font-semibold rtl:font-bold">{title}</h2>
        <p
          role={error ? 'alert' : 'status'}
          className={cn(
            'min-h-[2.6em] max-w-[34ch] text-[0.84375rem]',
            error ? 'font-semibold text-bad' : 'text-muted-foreground',
          )}
        >
          {message}
        </p>
      </div>
      <div
        key={shake}
        dir="ltr"
        role="img"
        aria-label={t('lock.dots', { n: digits.length })}
        className={cn('flex gap-4', shake > 0 && 'animate-shake')}
      >
        {Array.from({ length: PIN_LENGTH }, (_, i) => (
          <span
            key={i}
            className={cn(
              'size-4 rounded-full border-2 transition-colors',
              i < digits.length ? 'border-primary bg-primary' : 'border-ink-3',
              shake > 0 && digits.length === 0 && error && 'border-bad',
            )}
          />
        ))}
      </div>
      <div dir="ltr" role="group" aria-label={t('lock.keypad')} className="grid grid-cols-3 gap-3">
        {KEYS.map((k) =>
          k === '' ? (
            <span key="empty" />
          ) : (
            <button
              key={k}
              type="button"
              disabled={disabled || busy}
              onClick={() => void press(k)}
              aria-label={k === 'del' ? t('lock.delete') : k}
              className={cn(
                'tabular grid size-[72px] touch-manipulation place-items-center rounded-full font-display text-[1.75rem] font-semibold select-none disabled:opacity-40',
                k === 'del' ? 'text-ink-2' : 'border border-line bg-surface shadow-card active:bg-surface-2',
              )}
            >
              {k === 'del' ? <DeleteIcon className="size-6" aria-hidden="true" /> : k}
            </button>
          ),
        )}
      </div>
    </div>
  )
}
