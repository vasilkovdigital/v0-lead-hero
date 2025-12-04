"use client"

import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuotaCounterProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  loading?: boolean
  className?: string
}

export function QuotaCounter({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  disabled = false,
  loading = false,
  className,
}: QuotaCounterProps) {
  const handleDecrement = () => {
    if (disabled || loading) return
    if (value > min) {
      onChange(value - step)
    }
  }

  const handleIncrement = () => {
    if (disabled || loading) return
    // Если max не задан, можно увеличивать без ограничений
    if (max === undefined || value < max) {
      onChange(value + step)
    }
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7"
        onClick={handleDecrement}
        disabled={disabled || loading || value <= min}
      >
        <Minus className="h-3 w-3" />
      </Button>
      
      <span 
        className={cn(
          "min-w-[40px] text-center text-sm font-medium tabular-nums",
          loading && "opacity-50"
        )}
      >
        {value}
      </span>
      
      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7"
        onClick={handleIncrement}
        disabled={disabled || loading || (max !== undefined && value >= max)}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  )
}

