import { RefreshCwIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Field, inputClass, SectionTitle } from '@/components/Field'
import { OtpCodeField } from '@/components/OtpCodeField'
import { subClass } from '@/components/Section'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatTime } from '@/lib/dates'

import { authErrorKey, EMAIL_RE, sendCode, signOut, useSession, verifyCode } from './auth'
import { syncNow, useSyncState } from './controller'
import { accountsEnabled } from './supabase'

const btn = 'h-11 rounded-[14px] font-bold'

/** Réglages → Compte : connexion par code à 6 chiffres reçu par e-mail, état de la synchro, déconnexion. */
export function AccountSettings() {
  const { t } = useTranslation()
  const { session } = useSession()

  return (
    <section aria-labelledby="settings-account" className="flex flex-col gap-3">
      <SectionTitle id="settings-account">{t('account.title')}</SectionTitle>
      {!accountsEnabled ? (
        <p className={subClass}>{t('account.disabled')}</p>
      ) : session ? (
        <SignedIn email={session.user.email ?? ''} />
      ) : (
        <SignIn />
      )}
    </section>
  )
}

function SignedIn({ email }: { email: string }) {
  const { t } = useTranslation()
  const sync = useSyncState()
  return (
    <>
      <p className="font-semibold [overflow-wrap:anywhere]">{t('account.signedIn', { email })}</p>
      <p className={subClass} role="status">
        {sync.status === 'error'
          ? t('account.error')
          : t('account.lastSync', {
              time: sync.lastSyncAt
                ? formatTime(new Date(sync.lastSyncAt), Intl.DateTimeFormat().resolvedOptions().timeZone)
                : t('account.never'),
            })}
      </p>
      <Button
        variant="secondary"
        className={`${btn} bg-primary-soft text-primary`}
        disabled={sync.status === 'syncing'}
        onClick={() => void syncNow()}
      >
        <RefreshCwIcon className={sync.status === 'syncing' ? 'animate-spin' : ''} aria-hidden="true" />
        {t('account.syncNow')}
      </Button>
      <Button
        variant="secondary"
        className={btn}
        onClick={() => void signOut().then(() => toast(t('account.signedOut')))}
      >
        {t('account.signOut')}
      </Button>
    </>
  )
}

function SignIn() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function send() {
    if (!EMAIL_RE.test(email.trim())) return setError('errors.email')
    setBusy(true)
    setError(null)
    try {
      await sendCode(email)
      setSentTo(email.trim())
    } catch (e) {
      setError(authErrorKey(e) === 'errors.otpWrong' ? 'errors.email' : authErrorKey(e))
    } finally {
      setBusy(false)
    }
  }

  async function verify() {
    if (!/^\d{6}$/.test(code.trim())) return setError('errors.otp')
    setBusy(true)
    setError(null)
    try {
      await verifyCode(sentTo!, code)
      toast(t('account.welcome'))
    } catch (e) {
      setError(authErrorKey(e))
    } finally {
      setBusy(false)
    }
  }

  if (!sentTo) {
    return (
      <form
        noValidate
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          void send()
        }}
      >
        <p className={subClass}>{t('account.intro')}</p>
        <Field label={t('account.email')} errors={error ? [error] : undefined}>
          {(p) => (
            <Input
              {...p}
              type="email"
              inputMode="email"
              autoComplete="email"
              dir="ltr"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
        </Field>
        <Button type="submit" className={btn} disabled={busy}>
          {t('account.sendCode')}
        </Button>
      </form>
    )
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        void verify()
      }}
    >
      <p className={subClass} role="status">
        {t('account.codeSent', { email: sentTo })}
      </p>
      <OtpCodeField value={code} onChange={setCode} error={error} />
      <Button type="submit" className={btn} disabled={busy}>
        {t('account.signIn')}
      </Button>
      <Button
        type="button"
        variant="link"
        className="h-11 font-bold"
        onClick={() => {
          setSentTo(null)
          setCode('')
          setError(null)
        }}
      >
        {t('account.otherEmail')}
      </Button>
    </form>
  )
}
