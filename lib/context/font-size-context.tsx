"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"

// Plage de valeurs autorisées (de 70% à 150% de la taille normale)
const MIN_FONT_SCALE = 0.7
const MAX_FONT_SCALE = 1.5
const DEFAULT_FONT_SCALE = 1.0

// Interface pour le contexte
interface FontSizeContextType {
  fontScale: number
  setFontScale: (scale: number) => void
  increaseFontSize: () => void
  decreaseFontSize: () => void
  resetFontSize: () => void
}

// Création du contexte avec des valeurs par défaut
const FontSizeContext = createContext<FontSizeContextType>({
  fontScale: DEFAULT_FONT_SCALE,
  setFontScale: () => {},
  increaseFontSize: () => {},
  decreaseFontSize: () => {},
  resetFontSize: () => {},
})

// Hook personnalisé pour utiliser le contexte
export const useFontSize = () => useContext(FontSizeContext)

// Clé pour le stockage local
const FONT_SCALE_STORAGE_KEY = "app-font-scale"

// Pas d'ajustement pour les augmentations/diminutions
const FONT_SCALE_STEP = 0.1

interface FontSizeProviderProps {
  children: ReactNode
}

export function FontSizeProvider({ children }: FontSizeProviderProps) {
  // État pour stocker l'échelle de la police
  const [fontScale, setFontScaleState] = useState<number>(DEFAULT_FONT_SCALE)

  // Charger la valeur sauvegardée au démarrage
  useEffect(() => {
    const savedScale = localStorage.getItem(FONT_SCALE_STORAGE_KEY)
    if (savedScale) {
      try {
        const parsedScale = parseFloat(savedScale)
        if (!isNaN(parsedScale) && parsedScale >= MIN_FONT_SCALE && parsedScale <= MAX_FONT_SCALE) {
          setFontScaleState(parsedScale)
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'échelle de police:", error)
      }
    }
  }, [])

  // Appliquer l'échelle de police à l'élément racine
  useEffect(() => {
    // Définir une propriété CSS personnalisée pour l'échelle de police
    document.documentElement.style.setProperty("--font-scale", fontScale.toString())
    
    // Sauvegarder la valeur dans le stockage local
    localStorage.setItem(FONT_SCALE_STORAGE_KEY, fontScale.toString())
  }, [fontScale])

  // Fonction pour définir l'échelle de police avec des limites
  const setFontScale = (scale: number) => {
    // S'assurer que la valeur est dans la plage autorisée
    const clampedScale = Math.min(Math.max(scale, MIN_FONT_SCALE), MAX_FONT_SCALE)
    setFontScaleState(clampedScale)
  }

  // Fonction pour augmenter la taille de la police
  const increaseFontSize = () => {
    setFontScale(fontScale + FONT_SCALE_STEP)
  }

  // Fonction pour diminuer la taille de la police
  const decreaseFontSize = () => {
    setFontScale(fontScale - FONT_SCALE_STEP)
  }

  // Fonction pour réinitialiser la taille de la police
  const resetFontSize = () => {
    setFontScale(DEFAULT_FONT_SCALE)
  }

  // Valeur du contexte
  const contextValue: FontSizeContextType = {
    fontScale,
    setFontScale,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
  }

  return (
    <FontSizeContext.Provider value={contextValue}>
      {children}
    </FontSizeContext.Provider>
  )
} 