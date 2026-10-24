import { Volume2Icon } from 'lucide-react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { usePreferences } from '@/app/PreferencesProvider'
import { ChipGroup } from '@/components/ChipGroup'
import { Field, inputClass, labelClass, SectionTitle } from '@/components/Field'
import { ToggleChip } from '@/components/ToggleChip'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { updateSettings } from '@/db/settings'
import { PRAYERS, type CallLang, type CallSettings as Call, type Settings } from '@/db/types'
import { usePrayerName } from '@/features/prayer/usePrayerName'
import { cn } from '@/lib/utils'

import { callLangs, callPhrase } from './phrase'
import { speak } from './speech'
import { useVoices } from './useVoices'

const LANGS: readonly CallLang[] = ['app', 'fr', 'ar', 'both']
const LANG_KEY = { app: 'langApp', fr: 'langFr', ar: 'langAr', both: 'langBoth' } as const
const MINUTES = Array.from({ length: 15 }, (_, i) => i + 1)

/** Réglages → Appel avant l'adhan (enregistré tout de suite, synchronisé avec le compte en phase 2). */
export function CallSettings({ settings }: { settings: Settings }) {
  const { t } = useTranslation()
  const { lang } = usePreferences()
  const prayerName = usePrayerName()
  const voices = useVoices()
  const enabledId = useId()
  const voiceId = useId()
  const call = settings.call
  const set = (patch: Partial<Call>) => void updateSettings((s) => ({ call: { ...s.call, ...patch } }))

  const langs = callLangs(call.lang, lang)
  const missing = langs.filter((l) => !voices[l])
  const phrase = callPhrase(lang, settings)

  const toggleRow = 'flex items-center gap-3 rounded-[14px] border border-line bg-surface px-3.5 py-3'

  return (
    <section aria-labelledby="settings-call" className="flex flex-col gap-4">
      <SectionTitle id="settings-call">{t('call.title')}</SectionTitle>
      <div className={toggleRow}>
        <label htmlFor={enabledId} className="min-w-0 flex-1">
          <span className="block font-bold">{t('call.enabled')}</span>
          <span className="block text-[0.8125rem] text-muted-foreground">{t('call.enabledHint', { phrase })}</span>
        </label>
        <Switch
          id={enabledId}
          checked={call.enabled}
          onCheckedChange={(v) => set({ enabled: v })}
          className="data-checked:bg-ok"
        />
      </div>

      <fieldset disabled={!call.enabled} className={cn('flex min-w-0 flex-col gap-4', !call.enabled && 'opacity-60')}>
        <Field label={t('call.minutes')}>
          {(p) => (
            <Select value={String(call.minutesBefore)} onValueChange={(v) => set({ minutesBefore: Number(v) })}>
              <SelectTrigger {...p} className={cn(inputClass, 'w-full')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-72">
                {MINUTES.map((m) => (
                  <SelectItem key={m} value={String(m)} className="min-h-11">
                    {t('call.minutesValue', { count: m })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Field>

        <fieldset className="flex min-w-0 flex-col gap-[7px]">
          <legend className={cn(labelClass, 'mb-[7px]')}>{t('call.prayers')}</legend>
          <ul className="flex flex-wrap gap-1.5">
            {PRAYERS.map((p) => (
              <li key={p}>
                <ToggleChip
                  pressed={call.prayers[p]}
                  onToggle={() => set({ prayers: { ...call.prayers, [p]: !call.prayers[p] } })}
                >
                  {p === 'dhuhr' ? `${prayerName('dhuhr')} / ${t('prayers.jumua')}` : prayerName(p)}
                </ToggleChip>
              </li>
            ))}
          </ul>
        </fieldset>

        <div className={toggleRow}>
          <label htmlFor={voiceId} className="min-w-0 flex-1 font-bold">
            {t('call.voice')}
          </label>
          <Switch
            id={voiceId}
            checked={call.voice}
            onCheckedChange={(v) => set({ voice: v })}
            className="data-checked:bg-ok"
          />
        </div>

        <ChipGroup
          label={t('call.lang')}
          value={call.lang}
          onChange={(v) => set({ lang: v })}
          options={LANGS.map((l) => ({ value: l, label: t(`call.${LANG_KEY[l]}`) }))}
        />

        {!voices.supported ? (
          <p className="rounded-lg bg-warn-soft p-3 text-[0.8125rem] text-ink-2">{t('call.noSpeech')}</p>
        ) : (
          missing.map((l) => (
            <p key={l} role="note" className="rounded-lg bg-warn-soft p-3 text-[0.8125rem] text-ink-2">
              {t(l === 'ar' ? 'call.noVoiceAr' : 'call.noVoiceFr')}
            </p>
          ))
        )}

        <Button
          type="button"
          variant="secondary"
          className="h-11 rounded-[14px] bg-primary-soft font-bold text-primary"
          disabled={!voices.supported}
          onClick={() => speak(langs.map((l) => ({ text: callPhrase(l, settings), lang: l })))}
        >
          <Volume2Icon aria-hidden="true" />
          {t('call.test')}
        </Button>
      </fieldset>
      <p className="text-[0.8125rem] text-muted-foreground">{t('call.closedHint')}</p>
    </section>
  )
}
