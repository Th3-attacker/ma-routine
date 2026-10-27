// Écran pré-dessiné, inséré dans index.html au moment du build (plugin « shell » de vite.config.ts).
// Il s'affiche avant le JavaScript : bienvenue (premier lancement) ou en-tête de l'écran du code, en français ou
// en arabe. React le remplace dès qu'il démarre, avec les mêmes classes : rien ne bouge à l'écran.
// Les textes viennent de fr.json / ar.json, comme partout ailleurs.

type Texts = {
  app: { name: string; nameAr: string; tagline: string }
  lock: { welcomeTitle: string; welcomeText: string; languageLabel: string; next: string; step: string }
}

export type ShellVariant = 'welcome' | 'unlock'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Mêmes classes que LockLayout, Logo, ChipGroup et l'étape 1 d'Onboarding.
const LAYOUT =
  'mx-auto flex min-h-dvh max-w-[480px] flex-col ps-[max(16px,env(safe-area-inset-left,0px))] pe-[max(16px,env(safe-area-inset-right,0px))] pt-[calc(12px+env(safe-area-inset-top,0px))] pb-[calc(20px+env(safe-area-inset-bottom,0px))]'
const LABEL =
  'text-[0.71875rem] font-extrabold tracking-[0.07em] text-ink-2 uppercase rtl:text-[0.8125rem] rtl:tracking-normal rtl:normal-case'
const CHIP =
  'inline-flex h-11 min-w-8 shrink-0 items-center justify-center rounded-full border px-3.5 text-[0.8125rem] font-bold whitespace-nowrap'

function header(t: Texts): string {
  return `<header class="flex flex-col items-center gap-2">
<span aria-hidden="true" class="grid size-16 flex-none place-items-center overflow-hidden rounded-full bg-primary font-display text-[24px] font-bold tracking-[-0.02em] text-primary-foreground ring-[3px] ring-gold">SJ</span>
<p class="flex items-baseline gap-2"><span dir="ltr" class="font-display text-2xl font-bold tracking-[0.01em] text-primary">${esc(t.app.name)}</span><span lang="ar" class="font-quran text-[22px] text-gold-ink">${esc(t.app.nameAr)}</span></p>
<p class="text-center text-sm text-ink-2 italic rtl:not-italic">${esc(t.app.tagline)}</p>
</header>`
}

function languageChoice(t: Texts, lang: 'fr' | 'ar'): string {
  const chip = (value: 'fr' | 'ar', label: string) =>
    `<span lang="${value}" class="${CHIP} ${
      value === lang ? 'border-primary bg-primary text-primary-foreground' : 'border-line bg-surface text-ink-2'
    }">${label}</span>`
  return `<div class="flex justify-end"><fieldset class="flex min-w-0 flex-col gap-[7px]">
<legend class="${LABEL} mb-[7px]">${esc(t.lock.languageLabel)}</legend>
<div class="flex w-full flex-row flex-wrap items-center gap-1.5">${chip('fr', 'FR')}${chip('ar', 'ع')}</div>
</fieldset></div>`
}

/** Le HTML d'une variante, dans une langue. Rien n'y est cliquable : React prend le relais au démarrage. */
export function shellHtml(t: Texts, lang: 'fr' | 'ar', variant: ShellVariant): string {
  const top = variant === 'welcome' ? languageChoice(t, lang) : ''
  const body =
    variant === 'welcome'
      ? `<p class="text-[0.8125rem] font-semibold text-muted-foreground">${esc(t.lock.step.replace('{{n}}', '1'))}</p>
<section class="flex w-full flex-col items-center gap-5 text-center">
<p class="font-display text-[1.75rem] font-semibold rtl:font-bold">${esc(t.lock.welcomeTitle)}</p>
<p class="max-w-[36ch] text-ink-2">${esc(t.lock.welcomeText)}</p>
<span class="inline-flex h-12 w-full items-center justify-center rounded-[14px] bg-primary text-[0.9375rem] font-bold text-primary-foreground">${esc(t.lock.next)}</span>
</section>`
      : ''
  return `<div data-shell="${variant}-${lang}" aria-hidden="true" class="${LAYOUT}">${top}<div class="flex flex-1 flex-col items-center justify-center gap-6 py-4">${header(t)}${body}</div></div>`
}

/** Les 4 variantes, plus le petit script qui garde la bonne (langue, premier lancement ou non). */
export function shellMarkup(fr: Texts, ar: Texts): string {
  const variants = (['welcome', 'unlock'] as const).flatMap((v) => [shellHtml(fr, 'fr', v), shellHtml(ar, 'ar', v)])
  const keep = `<script>(function(){var o;try{o=localStorage.getItem('elhadj.onboarded')}catch(e){}var w=(o?'unlock-':'welcome-')+document.documentElement.lang;document.querySelectorAll('#root>[data-shell]').forEach(function(e){if(e.getAttribute('data-shell')!==w)e.remove()})})()</script>`
  return variants.join('') + keep
}
