"use client"

import { useState, useRef } from "react"
import InteractiveDots, { type InteractiveDotsRef } from "@/app/components/interactive-dots"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function Home() {
  // Default values - centralized for easy maintenance
  const DEFAULT_DENSITY_LEVEL = 14
  const DEFAULT_DOT_SIZE_SCALER = 1.5

  // State for all animation parameters
  const [densityLevel, setDensityLevel] = useState([DEFAULT_DENSITY_LEVEL])
  const [dotSizeScaler, setDotSizeScaler] = useState([DEFAULT_DOT_SIZE_SCALER])

  const interactiveDotsRef = useRef<InteractiveDotsRef>(null)

  const handleReset = () => {
    // Reset UI controls to default values
    setDensityLevel([DEFAULT_DENSITY_LEVEL])
    setDotSizeScaler([DEFAULT_DOT_SIZE_SCALER])

    // Reset the animation state
    interactiveDotsRef.current?.resetAnimation()
  }

  return (
    <div className="flex h-svh w-full flex-col justify-center items-center gap-8 p-8">
      <main className="flex w-full justify-center items-center min-w-0">
        <div className="relative mb-4 w-[500px] h-[224px]">
          <InteractiveDots ref={interactiveDotsRef} densityLevel={densityLevel[0]} dotSizeScaler={dotSizeScaler[0]} />
        </div>
      </main>

      {/* Controls */}
      <div className="flex flex-col items-start gap-5 w-full max-w-md">
        <div className="w-full space-y-3 sm:space-y-3">
          <Label htmlFor="dot-density" className="text-sm font-medium">
            Dot Density: {densityLevel[0]}
          </Label>
          <Slider
            id="dot-density"
            min={3}
            max={20}
            step={1}
            value={densityLevel}
            onValueChange={setDensityLevel}
            className="w-full"
          />
          <div className="font-mono flex justify-between text-xs text-muted-foreground select-none">
            <span>decrease</span>
            <span>increase</span>
          </div>
        </div>

        <div className="w-full space-y-3 sm:space-y-3">
          <Label htmlFor="dot-size" className="text-sm font-medium">
            Dot Size: {dotSizeScaler[0].toFixed(1)}
          </Label>
          <Slider
            id="dot-size"
            min={1.0}
            max={4.0}
            step={0.1}
            value={dotSizeScaler}
            onValueChange={setDotSizeScaler}
            className="w-full"
          />
          <div className="font-mono flex justify-between text-xs text-muted-foreground select-none">
            <span>decrease</span>
            <span>increase</span>
          </div>
        </div>

        <div className="flex w-full sm:max-w-fit">
          <Button onClick={handleReset}>
            Reset All
          </Button>
        </div>
      </div>
    </div>
  )
}
