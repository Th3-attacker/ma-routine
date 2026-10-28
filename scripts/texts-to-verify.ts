// Génère TEXTES-A-VERIFIER.md : tous les textes religieux et les traductions à faire relire, avec leurs sources.
// « pnpm texts » (à relancer quand un texte change).
import { writeFileSync } from 'node:fs'

import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
const load = (path: string) => server.ssrLoadModule(path)

const { ATHKAR, TASBIH_FORMULAS } = await load('/src/features/athkar/data.ts')
const { VERSES, RAMADAN_VERSES } = await load('/src/features/daily/verses.ts')
const { DEBT_VERSE, QADR_DUA } = await load('/src/features/daily/quotes.ts')
const { HISN, formatSources } = await load('/src/features/athkar/hisn.ts')
const { TEMPLATES } = await load('/src/features/projects/templates.ts')
const fr = (await load('/src/i18n/fr.json')).default
const ar = (await load('/src/i18n/ar.json')).default
await server.close()

type Text = { ar: string; fr: string; refFr?: string; refAr?: string; hadith?: boolean; an?: string; n?: number }

const out: string[] = []
const line = (s = '') => out.push(s)
let n = 0
const item = (t: Text, extra = '') => {
  n++
  line(`### ${n}. ${t.refFr ?? ''}${t.hadith ? ' (hadith)' : ''}${extra}`)
  line()
  line(`> ${t.ar.trim().replace(/\n/g, '\n> ')}`)
  line()
  line(`- **Sens en français** : ${t.fr}`)
  if (t.an) line(`- **Note en arabe** : ${t.an}`)
  if (t.refAr) line(`- **Référence (ar)** : ${t.refAr}`)
  if (t.n) line(`- **Répétitions** : ${t.n}`)
  line('- [ ] Vérifié')
  line()
}

line('# Textes à faire vérifier — Sama Jàmm (سلامي)')
line()
line('Fichier généré par `pnpm texts` depuis le code de l’application. Pour chaque texte, merci de vérifier :')
line('le texte arabe (lettres et voyelles), la référence (sourate et verset, ou recueil du hadith et son')
line('authenticité), le sens en français, et le nombre de répétitions. Cocher la case quand c’est bon, ou noter')
line('la correction juste en dessous.')
line()

line('## 1. Versets et hadiths du jour')
line()
for (const t of VERSES as Text[]) item(t)
line('## 2. Versets et hadiths du mode Ramadan')
line()
for (const t of RAMADAN_VERSES as Text[]) item(t)
line('## 3. Autres textes')
line()
item(DEBT_VERSE as Text, ' — écran Dettes')
item(
  { ar: QADR_DUA, fr: 'Du‘â’ des dix dernières nuits de Ramadan (« Ô Allah, Tu es Celui qui pardonne… »).' },
  'Du‘â’ de Laylat al-Qadr',
)

line('## 4. Athkar')
line()
for (const [key, series] of Object.entries(ATHKAR) as [
  string,
  { ar: string; hintFr: string; hintAr: string; items: Text[] },
][]) {
  line(`### Série « ${series.ar} » (${key})`)
  line()
  line(`- Moment (fr) : ${series.hintFr}`)
  line(`- Moment (ar) : ${series.hintAr}`)
  line()
  for (const t of series.items) item(t)
}
line('## 5. Formules du tasbih')
line()
for (const t of TASBIH_FORMULAS as Text[]) line(`- ${t.ar} — ${t.fr} — [ ] Vérifié`)
line()

line('## 6. Invocations du quotidien (Hisn al-Muslim)')
line()
line('Onglet « Invocations » de l’écran Athkar. Vérifier aussi le recueil indiqué pour chaque invocation.')
line()
for (const c of HISN as { id: string; fr: string; ar: string; items: (Text & { src: string[] })[] }[]) {
  line(`### ${c.fr} · ${c.ar} (${c.id})`)
  line()
  for (const d of c.items) item({ ...d, refFr: formatSources(d.src, 'fr'), refAr: formatSources(d.src, 'ar') })
}

line('## 7. Modèles d’étapes des projets (« Proposer des étapes »)')
line()
line('À relire surtout pour l’arabe (langue claire, mots simples).')
line()
for (const tpl of TEMPLATES as { id: string; steps: { fr: string; ar: string }[] }[]) {
  line(`### ${fr.templates[tpl.id]} · ${ar.templates[tpl.id]}`)
  line()
  line('| Français | العربية | Vérifié |')
  line('|---|---|---|')
  for (const s of tpl.steps) line(`| ${s.fr} | ${s.ar} | [ ] |`)
  line()
}

line('## 8. Traductions arabes de l’interface')
line()
line('Toutes les phrases de l’application, côte à côte. Les mots entre `{{ }}` sont remplacés par l’app (nom,')
line('nombre…) : ne pas les traduire.')
line()
const flat = (o: Record<string, unknown>, p = ''): [string, string][] =>
  Object.entries(o).flatMap(([k, v]) =>
    typeof v === 'object' && v ? flat(v as Record<string, unknown>, `${p}${k}.`) : [[`${p}${k}`, String(v)]],
  )
const arMap = new Map(flat(ar))
let section = ''
for (const [key, value] of flat(fr)) {
  const top = key.split('.')[0]
  if (top !== section) {
    section = top
    line(`### ${top}`)
    line()
    line('| Clé | Français | العربية |')
    line('|---|---|---|')
  }
  const cell = (s: string | undefined) => (s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
  line(`| \`${key}\` | ${cell(value)} | ${cell(arMap.get(key))} |`)
}
line()

writeFileSync('TEXTES-A-VERIFIER.md', out.join('\n'))
console.log(`TEXTES-A-VERIFIER.md : ${n} textes religieux, ${flat(fr).length} phrases d’interface.`)
