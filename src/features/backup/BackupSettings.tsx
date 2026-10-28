import { DownloadIcon, UploadIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { SectionTitle } from '@/components/Field'
import { subClass } from '@/components/Section'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import type { Settings } from '@/db/types'
import { resolvePlace } from '@/features/prayer/cities'
import { dayKey } from '@/lib/dates'

import { downloadBackup, importBackup, parseBackup, type Backup } from './backup'

const btn = 'h-11 rounded-[14px] font-bold'

/** Réglages → Sauvegarde : export et import JSON (y compris le fichier de la maquette). */
export function BackupSettings({ settings }: { settings: Settings }) {
  const { t } = useTranslation()
  const input = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<Backup | null>(null)

  async function onFile(file: File | undefined) {
    if (!file) return
    try {
      setPending(parseBackup(await file.text()))
    } catch {
      toast(t('backup.invalid'))
    } finally {
      if (input.current) input.current.value = ''
    }
  }

  return (
    <section aria-labelledby="settings-backup" className="flex flex-col gap-3">
      <SectionTitle id="settings-backup">{t('backup.title')}</SectionTitle>
      <p className={subClass}>{t('backup.hint')}</p>
      <Button
        variant="secondary"
        className={`${btn} bg-primary-soft text-primary`}
        onClick={() =>
          void downloadBackup(dayKey(new Date(), resolvePlace(settings).timezone)).then(() =>
            toast(t('backup.exported')),
          )
        }
      >
        <DownloadIcon aria-hidden="true" />
        {t('backup.export')}
      </Button>
      <Button variant="secondary" className={btn} onClick={() => input.current?.click()}>
        <UploadIcon aria-hidden="true" />
        {t('backup.import')}
      </Button>
      <input
        ref={input}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        tabIndex={-1}
        aria-label={t('backup.import')}
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
      <p className={subClass}>{t('backup.importHint')}</p>

      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('backup.confirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {pending &&
                t('backup.confirmBody', {
                  days: pending.days.length,
                  transactions: pending.transactions.length,
                  projects: pending.projects.length,
                  debts: pending.debts.length,
                  goals: pending.savingsGoals.length,
                  recurring: pending.recurring.length,
                })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11">{t('budget.form.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="h-11"
              onClick={() => {
                if (!pending) return
                void importBackup(pending).then(() => toast(t('backup.imported')))
              }}
            >
              {t('backup.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}

export function AboutSettings() {
  const { t } = useTranslation()
  return (
    <section aria-labelledby="settings-about" className="flex flex-col gap-2">
      <SectionTitle id="settings-about">{t('about.title')}</SectionTitle>
      <ul className="flex list-disc flex-col gap-1.5 ps-5 text-[0.84375rem] text-ink-2">
        {(['athkar', 'quran', 'hadith', 'times', 'check', 'privacy'] as const).map((k) => (
          <li key={k}>{t(`about.${k}`)}</li>
        ))}
      </ul>
    </section>
  )
}
