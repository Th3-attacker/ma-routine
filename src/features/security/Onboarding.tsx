import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { usePreferences } from '@/app/PreferencesProvider'
import { ChipGroup } from '@/components/ChipGroup'
import { Field, inputClass } from '@/components/Field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateSettings } from '@/db/settings'
import type { Settings } from '@/db/types'
import { CUSTOM_CITY_ID } from '@/features/prayer/cities'
import { deviceTimezone, parseNumber } from '@/features/settings/form'
import { PlaceFields } from '@/features/settings/SettingsForm'
import { displayName } from '@/lib/names'

import { CreatePin } from './CreatePin'
import { LockLayout } from './LockLayout'

const coord = (max: number) =>
  z.string().refine((v) => v.trim() === '' || Math.abs(parseNumber(v)) <= max, 'errors.coords')

const profileSchema = z
  .object({
    name: z.string().trim().min(1, 'errors.required').max(40, 'errors.tooLong?max=40'),
    nameAr: z.string().trim().max(40, 'errors.tooLong?max=40'),
    cityId: z.string(),
    lat: coord(66),
    lng: coord(180),
  })
  .superRefine((v, ctx) => {
    if (v.cityId === CUSTOM_CITY_ID && (v.lat.trim() === '' || v.lng.trim() === '')) {
      ctx.addIssue({ code: 'custom', path: [v.lat.trim() === '' ? 'lat' : 'lng'], message: 'errors.coords' })
    }
  })

const btn = 'h-12 w-full rounded-[14px] text-[0.9375rem] font-bold'

/** Inscription au premier lancement : Bienvenue (langue) → Prénom et ville → Code (2 saisies). */
export function Onboarding({ settings, onDone }: { settings: Settings; onDone: () => void }) {
  const { t } = useTranslation()
  const { lang, setLang } = usePreferences()
  const [step, setStep] = useState<1 | 2 | 3 | 'done'>(1)

  const form = useForm({
    defaultValues: {
      name: settings.name,
      nameAr: settings.nameAr,
      cityId: settings.cityId,
      lat: settings.custom ? String(settings.custom.lat) : '',
      lng: settings.custom ? String(settings.custom.lng) : '',
    },
    validators: { onSubmit: profileSchema },
    onSubmit: async ({ value }) => {
      const lat = parseNumber(value.lat)
      const lng = parseNumber(value.lng)
      await updateSettings({
        name: value.name.trim(),
        nameAr: value.nameAr.trim(),
        cityId: value.cityId,
        custom:
          Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng, timezone: deviceTimezone() } : settings.custom,
      })
      setStep(3)
    },
  })

  const languageChoice = (
    <ChipGroup
      label={t('lock.languageLabel')}
      value={lang}
      onChange={setLang}
      options={[
        { value: 'fr', label: 'FR', lang: 'fr' },
        { value: 'ar', label: 'ع', lang: 'ar' },
      ]}
    />
  )

  if (step === 'done') {
    return (
      <LockLayout>
        <h1 className="text-center font-display text-[1.75rem] font-semibold rtl:font-bold" role="status">
          {t('lock.welcomeName', { name: displayName(settings, lang) })}
        </h1>
      </LockLayout>
    )
  }

  return (
    <LockLayout top={step === 1 ? languageChoice : undefined}>
      <p className="text-[0.8125rem] font-semibold text-muted-foreground">{t('lock.step', { n: step })}</p>

      {step === 1 && (
        <section aria-labelledby="ob-welcome" className="flex w-full flex-col items-center gap-5 text-center">
          <h1 id="ob-welcome" className="font-display text-[1.75rem] font-semibold rtl:font-bold">
            {t('lock.welcomeTitle')}
          </h1>
          <p className="max-w-[36ch] text-ink-2">{t('lock.welcomeText')}</p>
          <Button className={btn} onClick={() => setStep(2)}>
            {t('lock.next')}
          </Button>
        </section>
      )}

      {step === 2 && (
        <form
          noValidate
          aria-labelledby="ob-name"
          className="flex w-full flex-col gap-4 rounded-xl bg-card p-4 shadow-card"
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          <h1 id="ob-name" className="font-display text-xl font-semibold rtl:font-bold">
            {t('lock.nameTitle')}
          </h1>
          <form.Field name="name">
            {(field) => (
              <Field label={t('lock.nameField')} errors={field.state.meta.errors}>
                {(p) => (
                  <Input
                    {...p}
                    className={inputClass}
                    autoComplete="given-name"
                    placeholder={t('lock.namePlaceholder')}
                    maxLength={40}
                    required
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                )}
              </Field>
            )}
          </form.Field>
          <form.Field name="nameAr">
            {(field) => (
              <Field label={t('lock.nameAr')} hint={t('lock.nameArHint')} errors={field.state.meta.errors}>
                {(p) => (
                  <Input
                    {...p}
                    lang="ar"
                    dir="rtl"
                    className={inputClass}
                    placeholder={t('lock.nameArPlaceholder')}
                    maxLength={40}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                )}
              </Field>
            )}
          </form.Field>
          <form.Subscribe selector={(s) => [s.values.cityId, s.values.lat, s.values.lng] as const}>
            {([cityId, lat, lng]) => (
              <form.Field name="lat">
                {(latField) => (
                  <form.Field name="lng">
                    {(lngField) => (
                      <PlaceFields
                        cityId={cityId}
                        onCityChange={(v) => form.setFieldValue('cityId', v)}
                        lat={lat}
                        lng={lng}
                        latErrors={latField.state.meta.errors}
                        lngErrors={lngField.state.meta.errors}
                        onLatChange={latField.handleChange}
                        onLngChange={lngField.handleChange}
                        onCoords={(la, ln) => {
                          form.setFieldValue('cityId', CUSTOM_CITY_ID)
                          latField.handleChange(String(la))
                          lngField.handleChange(String(ln))
                        }}
                      />
                    )}
                  </form.Field>
                )}
              </form.Field>
            )}
          </form.Subscribe>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" className={`${btn} w-auto px-5`} onClick={() => setStep(1)}>
              {t('lock.back')}
            </Button>
            <Button type="submit" className={`${btn} flex-1`}>
              {t('lock.next')}
            </Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <section aria-labelledby="ob-code" className="flex w-full flex-col items-center gap-2">
          <h1 id="ob-code" className="sr-only">
            {t('lock.codeTitle')}
          </h1>
          <CreatePin
            onDone={async () => {
              await updateSettings({ onboarded: true })
              setStep('done')
              setTimeout(onDone, 1600)
            }}
          />
        </section>
      )}
    </LockLayout>
  )
}
