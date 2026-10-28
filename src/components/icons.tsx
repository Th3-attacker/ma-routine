import type { SVGProps } from 'react'

// Icônes dessinées pour la maquette (barre d'onglets et thème). Les autres viennent de lucide-react.

type IconProps = SVGProps<SVGSVGElement>

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'aria-hidden': true,
  focusable: false,
} as const

export function SunIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.8} strokeLinecap="round" {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
    </svg>
  )
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.8} strokeLinejoin="round" {...props}>
      <path d="M20 14.6A8.2 8.2 0 0 1 9.4 4a8.2 8.2 0 1 0 10.6 10.6z" />
    </svg>
  )
}

/** Demi-cercle : thème automatique. */
export function AutoThemeIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.8} {...props}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 3.8a8.2 8.2 0 0 1 0 16.4z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function MosqueIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3.2c0 1.8 4.6 3.1 4.6 7.3H7.4C7.4 6.3 12 5 12 3.2z" />
      <path d="M3 21h18M7.4 21V10.5h9.2V21M4.6 21v-9M19.4 21v-9M4.6 9.8v.6M19.4 9.8v.6" />
      <path d="M10.4 21v-3a1.6 1.6 0 0 1 3.2 0v3" />
    </svg>
  )
}

/** Chapelet. */
export function BeadsIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.7} {...props}>
      <circle cx="12" cy="3.8" r="1.6" />
      <circle cx="16.9" cy="5.6" r="1.6" />
      <circle cx="19.2" cy="10.2" r="1.6" />
      <circle cx="17.6" cy="14.9" r="1.6" />
      <circle cx="7.1" cy="5.6" r="1.6" />
      <circle cx="4.8" cy="10.2" r="1.6" />
      <circle cx="6.4" cy="14.9" r="1.6" />
      <circle cx="12" cy="16.6" r="1.6" />
      <path d="M12 18.3v3.4M10.6 21.7h2.8" strokeLinecap="round" />
    </svg>
  )
}

export function WalletIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.8} strokeLinejoin="round" {...props}>
      <path d="M4 8V7.2A2.2 2.2 0 0 1 6.2 5H17v3" />
      <rect x="3.5" y="8" width="17" height="11.5" rx="2.6" />
      <circle cx="16.4" cy="13.7" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function ChecklistIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3.8 6.6l1.6 1.6 3-3.1M3.8 13.4l1.6 1.6 3-3.1M4 19.6h4.4M11.5 7h8.7M11.5 13.7h8.7M11.5 19.6h8.7" />
    </svg>
  )
}

export function SlidersIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.8} strokeLinecap="round" {...props}>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2.2" />
      <circle cx="9" cy="17" r="2.2" />
    </svg>
  )
}
