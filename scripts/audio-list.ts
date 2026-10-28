// Génère ENREGISTREMENTS.md : la liste des enregistrements à faire par le récitant, avec le nom de chaque fichier.
// « pnpm audio » (à relancer quand un texte change ou qu'un fichier est ajouté).
import { existsSync, writeFileSync } from 'node:fs'

import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
const load = (path: string) => server.ssrLoadModule(path)
const { ATHKAR } = await load('/src/features/athkar/data.ts')
const { HISN } = await load('/src/features/athkar/hisn.ts')
const { athkarAudioKey, duaAudioKey } = await load('/src/features/athkar/audio.ts')
await server.close()

type Text = { ar: string; fr: string; n: number }
const has = (key: string) => ['mp3', 'm4a', 'ogg'].some((ext) => existsSync(`src/assets/audio/${key}.${ext}`))

const out: string[] = []
const line = (s = '') => out.push(s)
let total = 0
let done = 0
const seen = new Map<string, string>()
const item = (key: string, t: Text) => {
  const same = seen.get(t.ar.trim())
  if (same) {
    line(`#### \`${key}\` — même texte que \`${same}\` : rien à enregistrer`)
    line()
    return
  }
  seen.set(t.ar.trim(), key)
  total++
  if (has(key)) done++
  line(`#### \`${key}.mp3\` ${has(key) ? '✅' : '⬜'}`)
  line()
  line(`> ${t.ar.trim().replace(/\n/g, '\n> ')}`)
  line()
  line(`${t.fr}${t.n > 1 ? ` — **à lire une seule fois** (l’app le répète ${t.n} fois).` : ''}`)
  line()
}

line('# Enregistrements à faire — Sama Jàmm (سلامي)')
line()
line('Fichier généré par `pnpm audio`. Chaque texte s’enregistre **une seule fois**, même s’il se répète :')
line('l’application le rejoue le bon nombre de fois.')
line()
line('## Conseils')
line()
line('- Une pièce calme, sans écho (une chambre avec des rideaux, pas une salle de bain).')
line('- Le téléphone posé à 20–30 cm de la bouche, mode avion pour éviter les sonneries.')
line('- Une seconde de silence au début et à la fin ; pas de « bismillah » ajouté si le texte ne le contient pas.')
line('- Format **MP3**, mono, 64 à 96 kb/s suffisent pour la voix. Nommer le fichier exactement comme indiqué.')
line('- Accord écrit du récitant pour diffuser sa voix dans l’application.')
line()
line('Déposer les fichiers dans `src/assets/audio/athkar/` et `src/assets/audio/douas/`.')
line()
const head = out.length

line('## Athkar')
line()
for (const [set, series] of Object.entries(ATHKAR) as [string, { ar: string; items: Text[] }][]) {
  line(`### Série « ${series.ar} » (${set})`)
  line()
  series.items.forEach((t, i) => item(athkarAudioKey(set, i), t))
}
line('## Invocations (Hisn al-Muslim)')
line()
for (const c of HISN as { id: string; fr: string; ar: string; items: Text[] }[]) {
  line(`### ${c.fr} · ${c.ar}`)
  line()
  c.items.forEach((t, i) => item(duaAudioKey(c.id, i), t))
}

out.splice(head, 0, `**Avancement : ${done} / ${total} enregistrements.**`, '')
writeFileSync('ENREGISTREMENTS.md', out.join('\n'))
console.log(`ENREGISTREMENTS.md : ${done} / ${total} enregistrements.`)
