import { Link } from '@tanstack/react-router'
import type { ComponentType, SVGProps } from 'react'
import { useTranslation } from 'react-i18next'

import { BeadsIcon, ChecklistIcon, MosqueIcon, SunIcon, WalletIcon } from './icons'

type Tab = {
  to: '/' | '/priere' | '/athkar' | '/budget' | '/projets'
  label: 'tabs.today' | 'tabs.prayer' | 'tabs.athkar' | 'tabs.budget' | 'tabs.projects'
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

const TABS: readonly Tab[] = [
  { to: '/', label: 'tabs.today', Icon: SunIcon },
  { to: '/priere', label: 'tabs.prayer', Icon: MosqueIcon },
  { to: '/athkar', label: 'tabs.athkar', Icon: BeadsIcon },
  { to: '/budget', label: 'tabs.budget', Icon: WalletIcon },
  { to: '/projets', label: 'tabs.projects', Icon: ChecklistIcon },
]

export function TabBar() {
  const { t } = useTranslation()
  return (
    <nav
      aria-label={t('tabs.label')}
      className="pb-safe fixed inset-x-0 bottom-0 z-25 border-t border-line bg-surface ps-[max(16px,env(safe-area-inset-left,0px))] pe-[max(16px,env(safe-area-inset-right,0px))]"
    >
      <div className="mx-auto grid max-w-[528px] grid-cols-5">
        {TABS.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: true }}
            className="flex min-h-[56px] min-w-0 flex-col items-center justify-center gap-[3px] py-[9px] text-center text-[11px] font-bold text-ink-3 data-[status=active]:text-primary rtl:text-[12px]"
          >
            <Icon className="size-6" />
            <span className="max-w-full truncate">{t(label)}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
