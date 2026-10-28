import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import type { PrayerOrSunrise } from '@/db/types'
import { TIME_KEYS, type DayTimes } from '@/features/prayer/times'

const W = 320
const H = 96
const HORIZON = 72
const AMPLITUDE = 54
const MARGIN_MS = 36 * 60_000

/** Arc solaire : course du soleil entre le lever et Maghrib, avec les horaires et le soleil (ou la lune). */
export function SunArc({ now, times, next }: { now: Date; times: DayTimes; next: PrayerOrSunrise }) {
  const { t } = useTranslation()
  const maskId = useId()
  const t0 = times.fajr.getTime() - MARGIN_MS
  const t1 = times.isha.getTime() + MARGIN_MS
  const sr = times.sunrise.getTime()
  const ss = times.maghrib.getTime()
  const x = (ms: number) => 14 + ((Math.min(t1, Math.max(t0, ms)) - t0) / (t1 - t0)) * (W - 28)
  const y = (ms: number) =>
    ms >= sr && ms <= ss ? HORIZON - AMPLITUDE * Math.sin((Math.PI * (ms - sr)) / (ss - sr)) : HORIZON

  let path = ''
  for (let i = 0; i <= 56; i++) {
    const ms = sr + ((ss - sr) * i) / 56
    path += `${i ? 'L' : 'M'}${x(ms).toFixed(1)} ${y(ms).toFixed(1)}`
  }
  const nowMs = now.getTime()
  const day = nowMs >= sr && nowMs <= ss

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={t('today.sunArc')}
      className="rtl-flip mt-1.5 block h-auto w-full"
    >
      <path d={`${path}Z`} fill="var(--sky-faint)" />
      <line x1="6" y1={HORIZON} x2={W - 6} y2={HORIZON} stroke="var(--sky-line)" strokeDasharray="2 4" />
      <path d={path} fill="none" stroke="var(--sky-line)" strokeWidth="1.4" />
      {TIME_KEYS.map((k) => (
        <circle
          key={k}
          cx={x(times[k].getTime()).toFixed(1)}
          cy={y(times[k].getTime()).toFixed(1)}
          r={k === next ? 4.5 : k === 'sunrise' ? 2 : 3}
          fill={k === next ? 'var(--sky-accent)' : 'var(--sky-ink)'}
          opacity={k === next ? 1 : 0.85}
        />
      ))}
      {day ? (
        <>
          <circle cx={x(nowMs)} cy={y(nowMs)} r="12" fill="var(--sky-accent)" opacity="0.28" />
          <circle cx={x(nowMs)} cy={y(nowMs)} r="6.5" fill="var(--sky-accent)" />
        </>
      ) : (
        <>
          <mask id={maskId}>
            <rect x="0" y="0" width={W} height={H} fill="#fff" />
            <circle cx={x(nowMs) + 3} cy={HORIZON + 12 - 2.2} r="5.2" fill="#000" />
          </mask>
          <circle cx={x(nowMs)} cy={HORIZON + 12} r="6" fill="var(--sky-ink)" mask={`url(#${maskId})`} />
        </>
      )}
    </svg>
  )
}
