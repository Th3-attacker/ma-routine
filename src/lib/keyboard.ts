import { useEffect, useState } from 'react'

/**
 * Place prise par le clavier du téléphone en bas de l'écran (0 sans clavier), et hauteur visible restante.
 * Sur iPhone, le clavier recouvre la page sans la rétrécir : seul visualViewport le voit.
 */
export function useKeyboard(active: boolean): { inset: number; visible: number | null } {
  const [state, setState] = useState<{ inset: number; visible: number | null }>({ inset: 0, visible: null })
  useEffect(() => {
    const vv = window.visualViewport
    if (!active || !vv) return
    const update = () => {
      const inset = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop))
      setState({ inset: inset > 80 ? inset : 0, visible: inset > 80 ? Math.round(vv.height) : null })
    }
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [active])
  return active ? state : { inset: 0, visible: null }
}
