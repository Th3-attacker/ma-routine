import { CheckIcon, ClockIcon, XIcon } from 'lucide-react'

import type { PrayerStatus } from '@/db/types'
import { cn } from '@/lib/utils'

const bg: Record<PrayerStatus, string> = {
  jamaa: 'bg-ok',
  ontime: 'bg-primary',
  late: 'bg-warn',
  missed: 'bg-bad',
}

/** Rond de statut : pointillés si la prière n'est pas encore marquée. */
export function StatusDot({ status, className }: { status?: PrayerStatus; className?: string }) {
  const Icon = status === 'missed' ? XIcon : status === 'late' ? ClockIcon : CheckIcon
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid size-[26px] flex-none place-items-center rounded-full text-primary-foreground',
        status ? bg[status] : 'border-2 border-dashed border-line',
        className,
      )}
    >
      {status && <Icon className="size-3.5" strokeWidth={3} />}
    </span>
  )
}
