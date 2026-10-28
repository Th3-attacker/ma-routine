import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useKeyboard } from './keyboard'

class FakeViewport extends EventTarget {
  height = 800
  offsetTop = 0
}

describe('clavier du téléphone', () => {
  const original = window.visualViewport
  afterEach(() => Object.defineProperty(window, 'visualViewport', { value: original, configurable: true }))

  it('mesure la place prise par le clavier, seulement quand le volet est ouvert', () => {
    const vv = new FakeViewport()
    Object.defineProperty(window, 'visualViewport', { value: vv, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
    const { result, rerender } = renderHook(({ on }) => useKeyboard(on), { initialProps: { on: true } })
    expect(result.current).toEqual({ inset: 0, visible: null })
    act(() => {
      vv.height = 460
      vv.dispatchEvent(new Event('resize'))
    })
    expect(result.current).toEqual({ inset: 340, visible: 460 })
    rerender({ on: false })
    expect(result.current).toEqual({ inset: 0, visible: null })
  })
})
