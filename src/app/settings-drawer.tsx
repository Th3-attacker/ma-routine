import { createContext, useContext } from 'react'

/** Permet à un écran d'ouvrir le volet Réglages (bouton « Ajuster » de l'écran Prière). */
export const OpenSettingsContext = createContext<() => void>(() => {})

export const useOpenSettings = () => useContext(OpenSettingsContext)
