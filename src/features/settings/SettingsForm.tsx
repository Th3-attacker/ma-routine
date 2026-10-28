import { useForm } from '@tanstack/react-form'
import { LocateFixedIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { usePreferences } from '@/app/PreferencesProvider'
import { AppSelect } from '@/components/AppSelect'
import { Field, inputClass, SectionTitle } from '@/components/Field'
import { subClass } from '@/components/Section'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { updateSettings } from '@/db/settings'
import type { Settings } from '@/db/types'
import { CITIES, CUSTOM_CITY_ID } from '@/features/prayer/cities'

import { deviceTimezone, fromFormValues, settingsFormSchema, toFormValues } from './form'
import { getPosition } from './geolocation'
import { useHabitName } from './useHabitName'

const HIJRI_ADJ = ['-2', '-1', '0', '1', '2'] as const

/**
 * Ville de la liste, ou « Ma position » trouvée par le bouton (pas de coordonnées à taper).
 * Partagé avec l'écran d'accueil.
 */
export function PlaceFields({
  cityId,
  onCityChange,
  hasPosition,
  onCoords,
  errors,
}: {
  cityId: string
  onCityChange: (v: string) => void
  /** Une position a déjà été trouvée : « Ma position » apparaît dans la liste. */
  hasPosition: boolean
  onCoords: (lat: number, lng: number) => void
  errors?: readonly unknown[]
}) {
  const { t } = useTranslation()
  const { lang } = usePreferences()
  const [locating, setLocating] = useState(false)

  async function locate() {
    setLocating(true)
    try {
      const p = await getPosition()
      onCoords(p.lat, p.lng)
      toast(t('settings.locationFound'))
    } catch {
      toast(t('settings.locationError'))
    } finally {
      setLocating(false)
    }
  }

  // La position d'abord (horaires exacts là où l'on est) ; la liste des villes reste en secours.
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Button type="button" className="h-12 rounded-[14px] font-bold" onClick={locate} disabled={locating}>
          <LocateFixedIcon aria-hidden="true" />
          {locating ? t('settings.locating') : t('settings.useLocation')}
        </Button>
        <p className={subClass} role="status">
          {cityId === CUSTOM_CITY_ID ? t('settings.positionHint') : t('settings.locationWhy')}
        </p>
      </div>
      <Field label={t('settings.cityFallback')} errors={errors}>
        {(p) => (
          <AppSelect
            {...p}
            value={cityId}
            onChange={onCityChange}
            options={[
              ...(hasPosition || cityId === CUSTOM_CITY_ID
                ? [{ value: CUSTOM_CITY_ID, label: t('settings.myPosition') }]
                : []),
              ...CITIES.map((c) => ({ value: c.id, label: c[lang] })),
            ]}
          />
        )}
      </Field>
    </>
  )
}

/** Rubrique « Profil et ville » (profil, lieu, calendrier) ou « Budget, Coran et habitudes ». */
export type SettingsFormPart = 'profile' | 'daily'

/** Formulaire des réglages enregistrés : n'affiche que les champs de sa rubrique. */
export function SettingsForm({
  settings,
  part,
  onSaved,
}: {
  settings: Settings
  part: SettingsFormPart
  onSaved: () => void
}) {
  const { t } = useTranslation()
  const habitName = useHabitName()

  const form = useForm({
    defaultValues: toFormValues(settings, habitName),
    validators: { onSubmit: settingsFormSchema },
    onSubmit: async ({ value }) => {
      await updateSettings(fromFormValues(value, settings, habitName, deviceTimezone()))
      toast(t('settings.saved'))
      onSaved()
    },
  })

  const textField = (
    name: 'name' | 'currency' | 'goal' | 'page' | 'total',
    label: string,
    extra: { hint?: string; numeric?: boolean; placeholder?: string; maxLength?: number } = {},
  ) => (
    <form.Field name={name}>
      {(field) => (
        <Field label={label} hint={extra.hint} errors={field.state.meta.errors}>
          {(p) => (
            <Input
              {...p}
              name={name}
              className={inputClass}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              inputMode={extra.numeric ? 'numeric' : undefined}
              dir={extra.numeric || name === 'currency' ? 'ltr' : undefined}
              placeholder={extra.placeholder}
              maxLength={extra.maxLength}
            />
          )}
        </Field>
      )}
    </form.Field>
  )

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      {part === 'profile' && (
        <>
          <section aria-labelledby="settings-profile" className="flex flex-col gap-4">
            <SectionTitle id="settings-profile">{t('settings.profile')}</SectionTitle>
            {textField('name', t('settings.name'), { placeholder: t('settings.namePlaceholder'), maxLength: 40 })}
          </section>

          <section aria-labelledby="settings-place" className="flex flex-col gap-4">
            <SectionTitle id="settings-place">{t('settings.place')}</SectionTitle>
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
          </section>

          <section aria-labelledby="settings-calendar" className="flex flex-col gap-4">
            <SectionTitle id="settings-calendar">{t('settings.calendar')}</SectionTitle>
            <form.Field name="hijriAdj">
              {(field) => (
                <Field label={t('settings.hijriAdj')}>
                  {(p) => (
                    <AppSelect
                      {...p}
                      value={field.state.value}
                      onChange={(v) => field.handleChange(v)}
                      options={HIJRI_ADJ.map((v) => ({
                        value: v,
                        label: t('settings.days', {
                          count: Math.abs(Number(v)),
                          value: `\u2066${Number(v) > 0 ? `+${v}` : v}\u2069`,
                        }),
                      }))}
                    />
                  )}
                </Field>
              )}
            </form.Field>
          </section>
        </>
      )}

      {part === 'daily' && (
        <>
          <section aria-labelledby="settings-budget" className="flex flex-col gap-4">
            <SectionTitle id="settings-budget">{t('settings.budget')}</SectionTitle>
            {textField('currency', t('settings.currency'), { maxLength: 6 })}
          </section>

          <section aria-labelledby="settings-quran" className="flex flex-col gap-4">
            <SectionTitle id="settings-quran">{t('settings.quran')}</SectionTitle>
            <div className="grid grid-cols-2 gap-2.5">
              {textField('goal', t('settings.wird'), { numeric: true })}
              {textField('page', t('settings.page'), { numeric: true })}
            </div>
            {textField('total', t('settings.total'), { numeric: true, hint: t('settings.totalHint') })}
          </section>

          <section aria-labelledby="settings-habits" className="flex flex-col gap-4">
            <SectionTitle id="settings-habits">{t('settings.habitsTitle')}</SectionTitle>
            <form.Field name="habits">
              {(field) => (
                <Field label={t('settings.habits')}>
                  {(p) => (
                    <Textarea
                      {...p}
                      className="min-h-28 rounded-[12px] border-line bg-surface px-3 py-2.5 text-base md:text-base dark:bg-surface"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  )}
                </Field>
              )}
            </form.Field>
          </section>
        </>
      )}

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(submitting) => (
          <Button type="submit" className="h-12 rounded-[14px] text-[0.9375rem] font-bold" disabled={submitting}>
            {t('settings.save')}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
