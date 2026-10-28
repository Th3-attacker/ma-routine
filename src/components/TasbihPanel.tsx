import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import type { Day } from '@/db/types'
import { tapTasbih } from '@/features/athkar/actions'
import { TASBIH_FORMULAS } from '@/features/athkar/data'
import { vibrate } from '@/lib/haptics'
import { readLocal, writeLocal } from '@/lib/storage'

import { ChipGroup } from './ChipGroup'
import { ProgressRing } from './ProgressRing'

const TARGETS = ['33', '99', '100', '0'] as const
type Target = (typeof TARGETS)[number]

// Formule et objectif choisis : préférence de l'appareil.
const KEY = 'elhadj.tasbih'
function readPrefs(): { formula: number; target: Target } {
  try {
    const v = JSON.parse(readLocal(KEY) ?? '{}') as { formula?: number; target?: string }
    return {
      formula: Number.isInteger(v.formula) && v.formula! >= 0 && v.formula! < TASBIH_FORMULAS.length ? v.formula! : 0,
      target: TARGETS.includes(v.target as Target) ? (v.target as Target) : '33',
    }
  } catch {
    return { formula: 0, target: '33' }
  }
}

/** Tasbih : 6 formules, objectif 33 / 99 / 100 / sans limite, gros bouton avec anneau, total du jour. */
export function TasbihPanel({ day }: { day: Day }) {
  const { t, i18n } = useTranslation()
  const ar = i18n.language === 'ar'
  const [prefs, setPrefs] = useState(readPrefs)
  const [n, setN] = useState(0)
  const target = Number(prefs.target)
  const formula = TASBIH_FORMULAS[prefs.formula]
  const frac = target ? Math.min(1, n / target) : (n % 100) / 100

  const update = (p: Partial<typeof prefs>) => {
    const next = { ...prefs, ...p }
    setPrefs(next)
    writeLocal(KEY, JSON.stringify(next))
  }

  function tap() {
    const next = n + 1
    setN(next)
    vibrate(target && next === target ? [40, 60, 40] : 6)
    void tapTasbih(day.id, prefs.formula)
  }

  return (
    <div className="flex flex-col items-center gap-4 pt-1">
      <ChipGroup
        centered
        label={t('tasbih.formulas')}
        value={String(prefs.formula)}
        onChange={(v) => {
          update({ formula: Number(v) })
          setN(0)
        }}
        options={TASBIH_FORMULAS.map((f, i) => ({
          value: String(i),
          label: ar ? <span className="font-quran text-base">{f.ar}</span> : f.fr,
          lang: ar ? 'ar' : undefined,
        }))}
      />
      <div className="text-center">
        <p lang="ar" dir="rtl" className="font-quran text-[1.875rem] leading-normal">
          {formula.ar}
        </p>
        {!ar && <p className="text-[0.8125rem] font-semibold text-muted-foreground">{formula.fr}</p>}
      </div>
      <button
        type="button"
        onClick={tap}
        aria-label={t('tasbih.count', { n })}
        className="relative grid aspect-square w-[min(250px,72vw)] touch-manipulation place-items-center rounded-full border border-line bg-surface shadow-card select-none active:scale-[0.97]"
      >
        <ProgressRing
          value={frac}
          r={46}
          stroke={5}
          className="absolute inset-2 size-[calc(100%-16px)]"
          fillClass="stroke-gold transition-[stroke-dashoffset] duration-150"
        />
        <span aria-live="polite">
          <span className="tabular block font-display text-[4.25rem] leading-none font-semibold">{n}</span>
          <span className="block text-center text-[0.8125rem] font-bold text-muted-foreground">
            {target ? (n >= target ? t('tasbih.reached') : t('tasbih.of', { n: target })) : t('tasbih.free')}
          </span>
        </span>
      </button>
      <ChipGroup
        centered
        label={t('tasbih.target')}
        value={prefs.target}
        onChange={(v) => update({ target: v })}
        options={TARGETS.map((v) => ({ value: v, label: v === '0' ? t('tasbih.noLimit') : v }))}
      />
      <p className="text-[0.8125rem] text-ink-2">
        {t('tasbih.total')}
        <b className="tabular">{day.tasbih}</b>
      </p>
      <Button variant="secondary" className="h-11 rounded-[14px] font-bold" onClick={() => setN(0)}>
        {t('tasbih.reset')}
      </Button>
    </div>
  )
}
