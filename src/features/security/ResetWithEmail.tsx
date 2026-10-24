import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Field, inputClass } from '@/components/Field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authErrorKey, sendCode, verifyCode } from '@/sync/auth'

import { CreatePin } from './CreatePin'

/** « Code oublié ? » avec un compte : code reçu par e-mail, puis nouveau code à 4 chiffres (deux fois). */
export function ResetWithEmail({
  email,
  onDone,
  onCancel,
}: {
  email: string
  onDone: () => void
  onCancel: () => void
}) {
  const { t } = useTranslation()
  const [step, setStep] = useState<'send' | 'verify' | 'pin'>('send')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const btn = 'h-12 w-full rounded-[14px] text-[0.9375rem] font-bold'

  if (step === 'pin') return <CreatePin onDone={onDone} />

  return (
    <form
      noValidate
      className="flex w-full flex-col gap-3 rounded-xl bg-card p-4 shadow-card"
      onSubmit={(e) => {
        e.preventDefault()
        setError(null)
        setBusy(true)
        const run =
          step === 'send'
            ? sendCode(email).then(() => setStep('verify'))
            : /^\d{6}$/.test(code)
              ? verifyCode(email, code).then(() => setStep('pin'))
              : Promise.reject(Object.assign(new Error('format'), { local: true }))
        void run
          .catch((e: { local?: boolean }) => setError(e?.local ? 'errors.otp' : authErrorKey(e)))
          .finally(() => setBusy(false))
      }}
    >
      <p className="text-[0.84375rem] [overflow-wrap:anywhere] text-ink-2" role="status">
        {step === 'send' ? t('lock.forgotAccount', { email }) : t('account.codeSent', { email })}
      </p>
      {step === 'verify' && (
        <Field label={t('account.code')} errors={error ? [error] : undefined}>
          {(p) => (
            <Input
              {...p}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              dir="ltr"
              className={`${inputClass} tabular text-center font-display text-2xl tracking-[0.4em]`}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
          )}
        </Field>
      )}
      {step === 'send' && error && <p className="text-[0.8125rem] font-semibold text-bad">{t(error as never)}</p>}
      <Button type="submit" className={btn} disabled={busy}>
        {step === 'send' ? t('lock.sendEmailCode') : t('account.signIn')}
      </Button>
      <Button type="button" variant="link" className="h-11 font-bold" onClick={onCancel}>
        {t('lock.cancel')}
      </Button>
    </form>
  )
}
