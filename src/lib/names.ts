/** Prénom affiché (le même dans les deux langues). */
export function displayName(s: { name: string }): string {
  return s.name.trim()
}
