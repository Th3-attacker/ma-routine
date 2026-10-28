// Lecture audio des athkar et des invocations : enregistrements d'un récitant, rangés dans src/assets/audio/.
// Un texte sans fichier n'a pas de bouton ▶. Les fichiers ne sont pas dans l'installation : chacun est gardé
// sur le téléphone après sa première écoute (src/sw.ts). Noms attendus : « pnpm audio » (ENREGISTREMENTS.md).

import { useSyncExternalStore } from 'react'

import type { AthkarSet } from '@/db/types'

import { ATHKAR } from './data'

const FILES = import.meta.glob<string>('/src/assets/audio/**/*.{mp3,m4a,ogg}', {
  eager: true,
  query: '?url',
  import: 'default',
})

/** Adresse de chaque enregistrement, par clé (« athkar/matin-01 », « douas/reveil-02 »). */
export const AUDIO: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(FILES).map(([path, url]) => [path.replace(/^\/src\/assets\/audio\//, '').replace(/\.\w+$/, ''), url]),
)

const pad = (i: number) => String(i + 1).padStart(2, '0')
export const athkarAudioKey = (set: AthkarSet, i: number) => `athkar/${set}-${pad(i)}`
export const duaAudioKey = (chapter: string, i: number) => `douas/${chapter}-${pad(i)}`

/** Un enregistrement à jouer n fois de suite (les répétitions du dhikr). « ar » : texte, pour réutiliser
 * l'enregistrement d'un texte identique (Âyat al-Kursî est dans trois séries : enregistrée une seule fois).
 * « onEnd » : appelé à la fin de chaque écoute complète (le dhikr compte alors une répétition). */
export type Track = { key: string; n: number; ar?: string; title?: string; onEnd?: () => void }

const byText = new Map<string, string>()

/** Rend les enregistrements de ces textes réutilisables par les textes identiques (le premier gagne). */
export function indexTexts(tracks: readonly Track[]): void {
  for (const t of tracks) {
    const url = AUDIO[t.key]
    if (url && t.ar && !byText.has(t.ar.trim())) byText.set(t.ar.trim(), url)
  }
}

/** Adresse de l'enregistrement d'un texte : le sien, sinon celui d'un texte identique. */
export function audioUrl(t: Track | undefined): string | undefined {
  if (!t) return undefined
  return AUDIO[t.key] ?? (t.ar ? byText.get(t.ar.trim()) : undefined)
}

/** Les enregistrements d'une série d'athkar, dans l'ordre. */
export function seriesTracks(set: AthkarSet, lang: string): Track[] {
  const series = ATHKAR[set]
  return series.items.map((it, i) => ({
    key: athkarAudioKey(set, i),
    n: it.n,
    ar: it.ar,
    title: lang === 'ar' ? series.ar : `${series.ar} · ${i + 1}`,
  }))
}

export type PlayerState = {
  queue: readonly Track[]
  /** Position dans la file. */
  index: number
  /** Répétition en cours (0 = première écoute). */
  rep: number
  playing: boolean
}

const IDLE: PlayerState = { queue: [], index: 0, rep: 0, playing: false }

/**
 * Lecteur unique de l'app : une file d'enregistrements, chacun répété le bon nombre de fois.
 * L'élément audio est passé en paramètre pour les tests.
 */
export function createPlayer(make: () => HTMLAudioElement = () => new Audio(), urlOf = audioUrl) {
  let state = IDLE
  let el: HTMLAudioElement | null = null
  const listeners = new Set<() => void>()
  let onError: (() => void) | null = null

  const set = (next: PlayerState) => {
    state = next
    for (const l of listeners) l()
  }

  const element = () => {
    if (el) return el
    el = make()
    el.preload = 'auto'
    el.addEventListener('ended', () => {
      state.queue[state.index]?.onEnd?.()
      next()
    })
    el.addEventListener('error', () => {
      set({ ...state, playing: false })
      onError?.()
    })
    return el
  }

  function start(rep: number) {
    const track = state.queue[state.index]
    const url = urlOf(track)
    if (!url) return stop()
    const a = element()
    if (!a.src.endsWith(url)) a.src = url
    a.currentTime = 0
    set({ ...state, rep, playing: true })
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator && track.title && 'MediaMetadata' in window) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: track.title, artist: 'Sama Jàmm' })
    }
    a.play().catch(() => {
      set({ ...state, playing: false })
      onError?.()
    })
  }

  function next() {
    const track = state.queue[state.index]
    if (!track) return stop()
    if (state.rep + 1 < track.n) return start(state.rep + 1)
    // Enregistrement suivant qui existe.
    let i = state.index + 1
    while (i < state.queue.length && !urlOf(state.queue[i])) i++
    if (i >= state.queue.length) return stop()
    state = { ...state, index: i }
    start(0)
  }

  function stop() {
    el?.pause()
    set(IDLE)
  }

  return {
    get state() {
      return state
    },
    subscribe(l: () => void) {
      listeners.add(l)
      return () => void listeners.delete(l)
    },
    /** Joue la file à partir de « from » (les textes sans enregistrement sont sautés). */
    play(queue: readonly Track[], from = 0, error?: () => void) {
      onError = error ?? null
      let i = from
      while (i < queue.length && !urlOf(queue[i])) i++
      if (i >= queue.length) return
      el?.pause()
      state = { queue, index: i, rep: 0, playing: false }
      start(0)
    },
    /** Pause / reprise. */
    toggle() {
      if (!el || !state.queue.length) return
      if (state.playing) {
        el.pause()
        set({ ...state, playing: false })
      } else {
        set({ ...state, playing: true })
        el.play().catch(() => {
          set({ ...state, playing: false })
          onError?.()
        })
      }
    },
    stop,
    /** Passe à l'enregistrement suivant. */
    skip() {
      if (!state.queue.length) return
      state = { ...state, rep: state.queue[state.index]?.n ?? 0 }
      next()
    },
  }
}

for (const set of Object.keys(ATHKAR) as AthkarSet[]) indexTexts(seriesTracks(set, 'fr'))

export const player = createPlayer()

/** État du lecteur (pour les boutons ▶ / ⏸). */
export function usePlayer(): PlayerState {
  return useSyncExternalStore(player.subscribe, () => player.state)
}

/** La clé en cours de lecture, ou null. */
export function currentKey(s: PlayerState): string | null {
  return s.queue.length ? (s.queue[s.index]?.key ?? null) : null
}
