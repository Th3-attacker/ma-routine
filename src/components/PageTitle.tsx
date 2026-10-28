import type { ReactNode } from 'react'

export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className="font-display text-2xl leading-snug font-semibold rtl:font-bold">{children}</h1>
}
