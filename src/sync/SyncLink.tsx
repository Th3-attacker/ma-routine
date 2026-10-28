import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { readLocal, writeLocal } from '@/lib/storage'

import { useSession } from './auth'
import { useSyncController } from './controller'
import { clearLocalData, hasLocalData, markAllDirty } from './engine'

const linkedKey = (uid: string) => `elhadj.sync.linked.${uid}`

/**
 * Relie l'appareil au compte connecté et lance la synchro. À la première connexion sur un appareil qui a déjà des
 * données, demande : fusionner avec le compte, ou remplacer par le compte.
 */
export function SyncLink() {
  const { t } = useTranslation()
  const { session } = useSession()
  const uid = session?.user.id ?? null
  // Appareil déjà relié à ce compte (mémorisé), ou relié pendant cette session.
  const [confirmed, setConfirmed] = useState<string | null>(null)
  const [ask, setAsk] = useState(false)
  const linked = !!uid && (confirmed === uid || !!readLocal(linkedKey(uid)))

  useEffect(() => {
    if (!uid || readLocal(linkedKey(uid))) return
    void hasLocalData().then((has) => {
      if (has) setAsk(true)
      else {
        writeLocal(linkedKey(uid), '1')
        setConfirmed(uid)
      }
    })
  }, [uid])

  useSyncController(uid, linked)

  async function choose(merge: boolean) {
    if (!uid) return
    if (merge) await markAllDirty()
    else await clearLocalData(uid)
    writeLocal(linkedKey(uid), '1')
    setAsk(false)
    setConfirmed(uid)
  }

  const option =
    'h-auto min-h-14 w-full flex-col items-start gap-0.5 rounded-[14px] px-4 py-3 text-start whitespace-normal'
  return (
    <AlertDialog open={ask}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('firstLogin.title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('firstLogin.body')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <Button className={option} onClick={() => void choose(true)}>
            <b>{t('firstLogin.merge')}</b>
            <span className="text-[0.8125rem] font-normal opacity-90">{t('firstLogin.mergeHint')}</span>
          </Button>
          <Button variant="secondary" className={option} onClick={() => void choose(false)}>
            <b>{t('firstLogin.replace')}</b>
            <span className="text-[0.8125rem] font-normal text-muted-foreground">{t('firstLogin.replaceHint')}</span>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
