import { describe, expect, it, vi } from 'vitest'

import { athkarAudioKey, createPlayer, duaAudioKey, seriesTracks } from './audio'

function fakeAudio() {
  const handlers: Record<string, () => void> = {}
  const el = {
    src: '',
    currentTime: 0,
    preload: '',
    play: vi.fn(() => Promise.resolve()),
    pause: vi.fn(),
    addEventListener: (type: string, fn: () => void) => (handlers[type] = fn),
    end: () => handlers.ended(),
  }
  return el
}

const URLS: Record<string, string> = { a: '/a.mp3', c: '/c.mp3' }
const urlOf = (t?: { key: string }) => (t ? URLS[t.key] : undefined)

describe('lecteur audio', () => {
  it('répète chaque enregistrement, saute les textes sans fichier, puis s’arrête', () => {
    const el = fakeAudio()
    const p = createPlayer(() => el as unknown as HTMLAudioElement, urlOf)
    p.play([
      { key: 'a', n: 2 },
      { key: 'b', n: 1 },
      { key: 'c', n: 1 },
    ])
    expect(p.state).toMatchObject({ index: 0, rep: 0, playing: true })
    expect(el.src).toBe('/a.mp3')
    el.end()
    expect(p.state).toMatchObject({ index: 0, rep: 1, playing: true })
    el.end()
    expect(p.state).toMatchObject({ index: 2, rep: 0 })
    expect(el.src).toBe('/c.mp3')
    el.end()
    expect(p.state).toMatchObject({ queue: [], playing: false })
    expect(el.play).toHaveBeenCalledTimes(3)
  })

  it('met en pause, reprend et passe au suivant', () => {
    const el = fakeAudio()
    const p = createPlayer(() => el as unknown as HTMLAudioElement, urlOf)
    p.play(
      [
        { key: 'a', n: 3 },
        { key: 'c', n: 1 },
      ],
      0,
    )
    p.toggle()
    expect(p.state.playing).toBe(false)
    expect(el.pause).toHaveBeenCalled()
    p.toggle()
    expect(p.state.playing).toBe(true)
    p.skip()
    expect(p.state).toMatchObject({ index: 1, rep: 0 })
  })

  it('ne fait rien sans enregistrement', () => {
    const p = createPlayer(() => fakeAudio() as unknown as HTMLAudioElement, urlOf)
    p.play([{ key: 'b', n: 1 }])
    expect(p.state.queue).toHaveLength(0)
  })

  it('nomme les fichiers d’après la série et la position', () => {
    expect(athkarAudioKey('matin', 0)).toBe('athkar/matin-01')
    expect(duaAudioKey('voyage', 11)).toBe('douas/voyage-12')
    const tracks = seriesTracks('salat', 'fr')
    expect(tracks[3]).toMatchObject({ key: 'athkar/salat-04', n: 33 })
  })
})

describe('fin d’écoute', () => {
  it('appelle onEnd à chaque écoute complète, pas quand on passe au suivant', () => {
    const el = fakeAudio()
    const p = createPlayer(() => el as unknown as HTMLAudioElement, urlOf)
    const onA = vi.fn()
    const onC = vi.fn()
    p.play([
      { key: 'a', n: 2, onEnd: onA },
      { key: 'c', n: 1, onEnd: onC },
    ])
    el.end()
    el.end()
    expect(onA).toHaveBeenCalledTimes(2)
    p.skip()
    expect(onC).not.toHaveBeenCalled()
  })
})
