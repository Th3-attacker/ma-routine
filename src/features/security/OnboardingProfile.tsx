import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { Field, inputClass } from '@/components/Field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateSettings } from '@/db/settings'
import type { Settings } from '@/db/types'
import { CUSTOM_CITY_ID } from '@/features/prayer/cities'
import { deviceTimezone, parseNumber } from '@/features/settings/form'
import { PlaceFields } from '@/features/settings/SettingsForm'

// Étape 2 de l'inscription, chargée à part : l'écran de bienvenue s'affiche sans attendre le formulaire.

const coord = (max: number) =>
  z.string().refine((v) => v.trim() === '' || Math.abs(parseNumber(v)) <= max, 'errors.coords')

const profileSchema = z
  .object({
    name: z.string().trim().min(1, 'errors.required').max(40, 'errors.tooLong?max=40'),
    cityId: z.string(),
    lat: coord(66),
    lng: coord(180),
  })
  .superRefine((v, ctx) => {
    if (v.cityId === CUSTOM_CITY_ID && (v.lat.trim() === '' || v.lng.trim() === '')) {
      ctx.addIssue({ code: 'custom', path: ['cityId'], message: 'errors.position' })
    }
  })

const btn = 'h-12 w-full rounded-[14px] text-[0.9375rem] font-bold'

export default function OnboardingProfile({
  settings,
  onBack,
  onNext,
}: {
  settings: Settings
  onBack: () => void
  onNext: () => void
}) {
  const { t } = useTranslation()
  const form = useForm({
    defaultValues: {
      name: settings.name,
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
        cityId: value.cityId,
        custom:
          Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng, timezone: deviceTimezone() } : settings.custom,
      })
      onNext()
    },
  })

  return (
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
      <form.Subscribe selector={(s) => s.values.lat !== '' && s.values.lng !== ''}>
        {(hasPosition) => (
          <form.Field name="cityId">
            {(field) => (
              <PlaceFields
                cityId={field.state.value}
                onCityChange={field.handleChange}
                hasPosition={hasPosition}
                errors={field.state.meta.errors}
                onCoords={(la, ln) => {
                  form.setFieldValue('lat', String(la))
                  form.setFieldValue('lng', String(ln))
                  field.handleChange(CUSTOM_CITY_ID)
                }}
              />
            )}
          </form.Field>
        )}
      </form.Subscribe>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" className={`${btn} w-auto px-5`} onClick={onBack}>
          {t('lock.back')}
        </Button>
        <Button type="submit" className={`${btn} flex-1`}>
          {t('lock.next')}
        </Button>
      </div>
    </form>
  )
}
