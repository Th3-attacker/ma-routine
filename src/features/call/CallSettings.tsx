import { Volume2Icon } from 'lucide-react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { usePreferences } from '@/app/PreferencesProvider'
import { AppSelect } from '@/components/AppSelect'
import { ChipGroup } from '@/components/ChipGroup'
import { Field, labelClass, SectionTitle } from '@/components/Field'
import { ToggleChip } from '@/components/ToggleChip'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { updateSettings } from '@/db/settings'
import { PRAYERS, type CallLang, type CallSettings as Call, type Settings } from '@/db/types'
import { usePrayerName } from '@/features/prayer/usePrayerName'
import { readLocal, removeLocal, writeLocal } from '@/lib/storage'
import { cn } from '@/lib/utils'

import { callLangs, callPhrase } from './phrase'
import { isMaleVoice, speak, voiceKey } from './speech'
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
  const missing = voices.listed ? langs.filter((l) => voices[l].length === 0) : []
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
            <AppSelect
              {...p}
              value={String(call.minutesBefore)}
              onChange={(v) => set({ minutesBefore: Number(v) })}
              options={MINUTES.map((m) => ({ value: String(m), label: t('call.minutesValue', { count: m }) }))}
            />
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

        {langs
          .filter((l) => voices[l].length > 0)
          .map((l) => (
            <VoiceSelect key={l} lang={l} voices={voices[l]} />
          ))}

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

/** Choix de la voix pour une langue, sur cet appareil. « Automatique » prend une voix d'homme si le téléphone en a. */
function VoiceSelect({ lang, voices }: { lang: 'fr' | 'ar'; voices: { uri: string; name: string }[] }) {
  const { t } = useTranslation()
  const [chosen, setChosen] = useState(() => readLocal(voiceKey(lang)) ?? '')
  const hasMale = voices.some((v) => isMaleVoice({ name: v.name, voiceURI: v.uri }))
  return (
    <Field
      label={t(lang === 'ar' ? 'call.voiceAr' : 'call.voiceFr')}
      hint={chosen === '' && !hasMale ? t('call.noMaleVoice') : undefined}
    >
      {(p) => (
        <AppSelect
          {...p}
          value={chosen}
          onChange={(v) => {
            setChosen(v)
            if (v) writeLocal(voiceKey(lang), v)
            else removeLocal(voiceKey(lang))
          }}
          options={[
            { value: '', label: t('call.voiceAuto') },
            ...voices.map((v) => ({
              value: v.uri,
              label: isMaleVoice({ name: v.name, voiceURI: v.uri }) ? t('call.voiceMale', { name: v.name }) : v.name,
            })),
          ]}
        />
      )}
    </Field>
  )
}
