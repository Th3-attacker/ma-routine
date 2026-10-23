import { useId, type ReactNode } from 'react'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

type Option<T extends string> = { value: T; label: ReactNode; lang?: string }

/**
 * Choix unique en pastilles (style « chip » de la maquette), dans un fieldset avec sa légende.
 * Impossible de tout désélectionner.
 */
export function ChipGroup<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T
  onChange: (v: T) => void
  options: readonly Option<T>[]
  label: string
}) {
  const legendId = useId()
  return (
    <fieldset className="flex min-w-0 flex-col gap-[7px]">
      <legend
        id={legendId}
        className="mb-[7px] text-[0.71875rem] font-extrabold tracking-[0.07em] text-ink-2 uppercase rtl:text-[0.8125rem] rtl:tracking-normal rtl:normal-case"
      >
        {label}
      </legend>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(v) => {
          if (v) onChange(v as T)
        }}
        aria-labelledby={legendId}
        spacing={1.5}
        className="w-full flex-wrap"
      >
        {options.map((o) => (
          <ToggleGroupItem
            key={o.value}
            value={o.value}
            lang={o.lang}
            className="h-11 rounded-full border border-line bg-surface px-3.5 text-[0.8125rem] font-bold text-ink-2 hover:bg-surface-2 data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground [&_svg:not([class*='size-'])]:size-4"
          >
            {o.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </fieldset>
  )
}
