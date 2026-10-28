/** Prénom pour l'arabe : le prénom arabe s'il est rempli, sinon le prénom tel quel (latin ou déjà en arabe). */
export function arabicName(name: string, nameAr: string): string {
  return nameAr.trim() || name.trim()
}

export function displayName(s: { name: string; nameAr: string }, lang: 'fr' | 'ar'): string {
  return lang === 'ar' ? arabicName(s.name, s.nameAr) : s.name.trim()
}
