import { useForm } from '@tanstack/react-form'
import { LocateFixedIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { usePreferences } from '@/app/PreferencesProvider'
import { AppSelect } from '@/components/AppSelect'
import { Field, inputClass, labelClass, SectionTitle } from '@/components/Field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { updateSettings } from '@/db/settings'
import { METHOD_IDS, type Settings } from '@/db/types'
import { CITIES, CUSTOM_CITY_ID } from '@/features/prayer/cities'
import { TIME_KEYS } from '@/features/prayer/times'
import { cn } from '@/lib/utils'

import { deviceTimezone, fromFormValues, settingsFormSchema, toFormValues } from './form'
import { getPosition } from './geolocation'
import { useHabitName } from './useHabitName'

const HIJRI_ADJ = ['-2', '-1', '0', '1', '2'] as const

/** Ville ou « Autre lieu », avec le bouton « Utiliser ma position ». Partagé avec l'écran d'accueil. */
export function PlaceFields({
  cityId,
  onCityChange,
  lat,
  lng,
  onCoords,
  latErrors,
  lngErrors,
  onLatChange,
  onLngChange,
}: {
  cityId: string
  onCityChange: (v: string) => void
  lat: string
  lng: string
  onCoords: (lat: number, lng: number) => void
  latErrors?: readonly unknown[]
  lngErrors?: readonly unknown[]
  onLatChange: (v: string) => void
  onLngChange: (v: string) => void
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

  return (
    <>
      <Field label={t('settings.city')}>
        {(p) => (
          <AppSelect
            {...p}
            value={cityId}
            onChange={onCityChange}
            options={[
              ...CITIES.map((c) => ({ value: c.id, label: c[lang] })),
              { value: CUSTOM_CITY_ID, label: t('settings.customCity') },
            ]}
          />
        )}
      </Field>
      <Button
        type="button"
        variant="secondary"
        className="h-11 rounded-[14px] font-bold"
        onClick={locate}
        disabled={locating}
      >
        <LocateFixedIcon aria-hidden="true" />
        {locating ? t('settings.locating') : t('settings.useLocation')}
      </Button>
      {cityId === CUSTOM_CITY_ID && (
        <div className="grid grid-cols-2 gap-2.5">
          <Field label={t('settings.lat')} errors={latErrors}>
            {(p) => (
              <Input
                {...p}
                className={inputClass}
                inputMode="decimal"
                dir="ltr"
                placeholder="18.0858"
                value={lat}
                onChange={(e) => onLatChange(e.target.value)}
              />
            )}
          </Field>
          <Field label={t('settings.lng')} errors={lngErrors}>
            {(p) => (
              <Input
                {...p}
                className={inputClass}
                inputMode="decimal"
                dir="ltr"
                placeholder="-15.9785"
                value={lng}
                onChange={(e) => onLngChange(e.target.value)}
              />
            )}
          </Field>
          <p className="col-span-2 text-[0.8125rem] text-muted-foreground">{t('settings.coordsHint')}</p>
        </div>
      )}
    </>
  )
}

/** Formulaire des réglages enregistrés (profil, lieu, calcul, calendrier, budget, Coran, habitudes). */
export function SettingsForm({ settings, onSaved }: { settings: Settings; onSaved: () => void }) {
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
    name: 'name' | 'nameAr' | 'currency' | 'goal' | 'page' | 'total',
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
              dir={extra.numeric || name === 'currency' ? 'ltr' : name === 'nameAr' ? 'rtl' : undefined}
              lang={name === 'nameAr' ? 'ar' : undefined}
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
      <section aria-labelledby="settings-profile" className="flex flex-col gap-4">
        <SectionTitle id="settings-profile">{t('settings.profile')}</SectionTitle>
        {textField('name', t('settings.name'), { placeholder: t('settings.namePlaceholder'), maxLength: 40 })}
        {textField('nameAr', t('settings.nameAr'), { hint: t('lock.nameArHint'), maxLength: 40 })}
      </section>

      <section aria-labelledby="settings-place" className="flex flex-col gap-4">
        <SectionTitle id="settings-place">{t('settings.place')}</SectionTitle>
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
      </section>

      <section aria-labelledby="settings-calc" className="flex flex-col gap-4">
        <SectionTitle id="settings-calc">{t('settings.calc')}</SectionTitle>
        <form.Field name="method">
          {(field) => (
            <Field label={t('settings.method')}>
              {(p) => (
                <AppSelect
                  {...p}
                  value={field.state.value}
                  onChange={(v) => field.handleChange(v)}
                  options={METHOD_IDS.map((m) => ({ value: m, label: t(`methods.${m}`) }))}
                />
              )}
            </Field>
          )}
        </form.Field>
        <form.Field name="asrSchool">
          {(field) => (
            <Field label={t('settings.asr')}>
              {(p) => (
                <AppSelect
                  {...p}
                  value={field.state.value}
                  onChange={(v) => field.handleChange(v)}
                  options={[
                    { value: 'standard' as const, label: t('settings.asrStandard') },
                    { value: 'hanafi' as const, label: t('settings.asrHanafi') },
                  ]}
                />
              )}
            </Field>
          )}
        </form.Field>
        <fieldset className="flex min-w-0 flex-col gap-[7px]">
          <legend className={cn(labelClass, 'mb-[7px]')}>{t('settings.tune')}</legend>
          <div className="grid grid-cols-3 gap-2">
            {TIME_KEYS.map((k) => (
              <form.Field key={k} name={`tune.${k}`}>
                {(field) => (
                  <label className="flex min-w-0 flex-col gap-1 text-xs font-bold text-ink-2">
                    {t(`prayers.${k}`)}
                    <Input
                      className={inputClass}
                      inputMode="numeric"
                      dir="ltr"
                      value={field.state.value}
                      aria-invalid={field.state.meta.errors.length ? true : undefined}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </label>
                )}
              </form.Field>
            ))}
          </div>
        </fieldset>
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
