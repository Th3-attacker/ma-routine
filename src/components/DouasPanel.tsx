import { ChevronRightIcon } from 'lucide-react'
import { useDeferredValue, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AppDrawer } from '@/components/AppDrawer'
import { Field, inputClass } from '@/components/Field'
import { subClass } from '@/components/Section'
import { Input } from '@/components/ui/input'
import { formatSources, HISN, searchHisn, type Dua, type HisnChapter } from '@/features/athkar/hisn'

/** Onglet Invocations : les situations de Hisn al-Muslim, avec une recherche. Chargé à la demande. */
export default function DouasPanel() {
  const { t, i18n } = useTranslation()
  const ar = i18n.language === 'ar'
  const [query, setQuery] = useState('')
  const deferred = useDeferredValue(query)
  const chapters = searchHisn(deferred)
  const [openId, setOpenId] = useState<string | null>(null)
  const current = HISN.find((c) => c.id === openId)

  return (
    <section aria-labelledby="douas-title" className="flex flex-col gap-3">
      <div>
        <h2 id="douas-title" className="font-display text-[1.375rem] font-semibold rtl:font-bold">
          {t('athkar.douas.title')}
        </h2>
        <p className={subClass}>{t('athkar.douas.hint')}</p>
      </div>
      <search>
        <Field label={t('athkar.douas.search')}>
          {(p) => (
            <Input
              {...p}
              type="search"
              className={inputClass}
              autoComplete="off"
              enterKeyHint="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          )}
        </Field>
      </search>
      <p className="sr-only" aria-live="polite">
        {deferred.trim() &&
          (chapters.length
            ? t('athkar.douas.results', { count: chapters.length })
            : t('athkar.douas.empty', { q: deferred.trim() }))}
      </p>
      {chapters.length === 0 ? (
        <p className="py-6 text-center text-ink-2">{t('athkar.douas.empty', { q: deferred.trim() })}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {chapters.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setOpenId(c.id)}
                className="flex min-h-14 w-full items-center gap-3 rounded-[16px] border border-line bg-surface px-4 py-3 text-start"
              >
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  {ar ? (
                    <span className="font-bold">{c.ar}</span>
                  ) : (
                    <>
                      <span className="font-bold">{c.fr}</span>
                      <span lang="ar" dir="rtl" className="text-start font-quran text-base font-bold text-gold-ink">
                        {c.ar}
                      </span>
                    </>
                  )}
                </span>
                <span className="flex-none text-xs font-semibold text-muted-foreground">
                  {t('athkar.douas.count', { count: c.items.length })}
                </span>
                <ChevronRightIcon className="rtl-flip size-4 flex-none text-ink-3" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <AppDrawer
        open={!!current}
        onOpenChange={(o) => !o && setOpenId(null)}
        title={current ? (ar ? current.ar : current.fr) : ''}
        description={current && !ar ? <span lang="ar">{current.ar}</span> : undefined}
      >
        {current && <ChapterList chapter={current} />}
      </AppDrawer>
    </section>
  )
}

function ChapterList({ chapter }: { chapter: HisnChapter }) {
  return (
    <ol className="flex flex-col gap-2.5">
      {chapter.items.map((d, i) => (
        <li key={i}>
          <DuaCard dua={d} />
        </li>
      ))}
    </ol>
  )
}

/** Une invocation : texte arabe, sens (ou note arabe), répétitions et recueils. */
function DuaCard({ dua }: { dua: Dua }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'fr'
  const note = lang === 'ar' ? dua.an : dua.fr
  return (
    <div className="flex flex-col gap-2.5 rounded-[18px] border border-line bg-surface p-4">
      <p lang="ar" dir="rtl" className="font-quran text-[1.375rem] leading-[2.05] whitespace-pre-line">
        {dua.ar}
      </p>
      {note && <p className="text-[0.8125rem] text-ink-2">{note}</p>}
      <p className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs font-semibold text-muted-foreground">
        <span>{dua.n > 1 ? t('athkar.times', { n: dua.n }) : t('athkar.once')}</span>
        <span>{t('athkar.douas.source', { src: formatSources(dua.src, lang) })}</span>
      </p>
    </div>
  )
}
