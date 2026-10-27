/** Lance une tâche quand le téléphone est libre (après le premier affichage), au plus tard après `timeout` ms. */
export function whenIdle(task: () => void, timeout = 3000): void {
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(task, { timeout })
  else setTimeout(task, 1000)
}
