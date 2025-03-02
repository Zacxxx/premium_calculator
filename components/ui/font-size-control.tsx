"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Minus, Plus, RotateCcw } from "lucide-react"
import { useFontSize } from "@/lib/context/font-size-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface FontSizeControlProps {
  showTitle?: boolean
  compact?: boolean
  variant?: "default" | "horizontal" | "slider-only"
}

export function FontSizeControl({ 
  showTitle = true, 
  compact = false, 
  variant = "default" 
}: FontSizeControlProps) {
  const { fontScale, setFontScale, increaseFontSize, decreaseFontSize, resetFontSize } = useFontSize()

  // Convertir l'échelle en pourcentage pour l'affichage
  const scalePercentage = Math.round(fontScale * 100)

  // Gérer le changement de valeur du slider
  const handleSliderChange = (value: number[]) => {
    if (value.length > 0) {
      setFontScale(value[0] / 100)
    }
  }

  if (variant === "slider-only") {
    return (
      <div className="flex items-center gap-2 w-full max-w-xs">
        <Minus className="h-4 w-4 text-muted-foreground" />
        <Slider
          value={[scalePercentage]}
          min={70}
          max={150}
          step={5}
          onValueChange={handleSliderChange}
          className="flex-1"
        />
        <Plus className="h-4 w-4 text-muted-foreground" />
      </div>
    )
  }

  if (variant === "horizontal") {
    return (
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={decreaseFontSize}
          disabled={scalePercentage <= 70}
          title="Réduire la taille du texte"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <span className="text-sm font-medium w-12 text-center">{scalePercentage}%</span>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={increaseFontSize}
          disabled={scalePercentage >= 150}
          title="Augmenter la taille du texte"
        >
          <Plus className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={resetFontSize}
          title="Réinitialiser la taille du texte"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  // Version par défaut avec Card
  return (
    <Card className={compact ? "w-72" : "w-80"}>
      <CardHeader className={compact ? "py-3" : "py-4"}>
        {showTitle && (
          <>
            <CardTitle className={compact ? "text-sm" : "text-base"}>Taille du texte</CardTitle>
            <CardDescription className={compact ? "text-xs" : "text-sm"}>
              Ajustez la taille des caractères
            </CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={decreaseFontSize}
              disabled={scalePercentage <= 70}
            >
              <Minus className="h-3 w-3 mr-1" />
              <span>Réduire</span>
            </Button>
            
            <span className="font-medium">{scalePercentage}%</span>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={increaseFontSize}
              disabled={scalePercentage >= 150}
            >
              <span>Augmenter</span>
              <Plus className="h-3 w-3 ml-1" />
            </Button>
          </div>
          
          <div className="pt-2">
            <Slider
              value={[scalePercentage]}
              min={70}
              max={150}
              step={5}
              onValueChange={handleSliderChange}
            />
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>70%</span>
              <span>Normal</span>
              <span>150%</span>
            </div>
          </div>
          
          <div className="flex justify-center pt-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFontSize}
              className="text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Réinitialiser
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 