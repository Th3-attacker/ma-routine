import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { Field, inputClass } from '@/components/Field'
import { PageTitle } from '@/components/PageTitle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateSettings } from '@/db/settings'
import type { Settings } from '@/db/types'
import { CUSTOM_CITY_ID } from '@/features/prayer/cities'

import { deviceTimezone, fromFormValues, settingsFormSchema, toFormValues } from './form'
import { PlaceFields } from './SettingsForm'
import { useHabitName } from './useHabitName'

/** Premier lancement : prénom et lieu, puis l'écran Aujourd'hui. */
export function WelcomeScreen({ settings }: { settings: Settings }) {
  const { t } = useTranslation()
  const habitName = useHabitName()

  const form = useForm({
    defaultValues: toFormValues(settings, habitName),
    validators: { onSubmit: settingsFormSchema },
    onSubmit: async ({ value }) => {
      await updateSettings({ ...fromFormValues(value, settings, habitName, deviceTimezone()), onboarded: true })
    },
  })

  return (
    <>
      <hgroup className="flex flex-col gap-1.5 pt-0.5">
        <PageTitle>{t('welcome.title')}</PageTitle>
        <p className="text-ink-2">{t('welcome.intro')}</p>
      </hgroup>
      <form
        noValidate
        className="flex flex-col gap-4 rounded-xl bg-card p-4 shadow-card"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <form.Field name="name">
          {(field) => (
            <Field label={t('settings.name')} errors={field.state.meta.errors}>
              {(p) => (
                <Input
                  {...p}
                  className={inputClass}
                  autoComplete="given-name"
                  placeholder={t('settings.namePlaceholder')}
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
        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(submitting) => (
            <Button type="submit" className="h-12 rounded-[14px] text-[0.9375rem] font-bold" disabled={submitting}>
              {t('welcome.start')}
            </Button>
          )}
        </form.Subscribe>
        <p className="text-[0.8125rem] text-muted-foreground">{t('welcome.hint')}</p>
      </form>
    </>
  )
}
