"use client"

import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuotaCounterProps {
  value: number | null
  onChange: (value: number | null) => void
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
  const isUnlimited = value === null
  const displayValue = isUnlimited ? "∞" : value

  const handleDecrement = () => {
    if (disabled || loading) return
    if (isUnlimited) {
      // Переход от безлимита к начальному значению (min или 1000 если min = 0)
      onChange(min > 0 ? min : 1000)
    } else if (value > min) {
      onChange(value - step)
    }
  }

  const handleIncrement = () => {
    if (disabled || loading) return
    if (isUnlimited) return // Уже безлимит
    // Если max не задан, можно увеличивать без ограничений
    if (max === undefined || value < max) {
      onChange(value + step)
    }
  }

  const handleSetUnlimited = () => {
    if (disabled || loading) return
    onChange(null)
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7"
        onClick={handleDecrement}
        disabled={disabled || loading || (!isUnlimited && value <= min)}
      >
        <Minus className="h-3 w-3" />
      </Button>
      
      <span 
        className={cn(
          "min-w-[40px] text-center text-sm font-medium tabular-nums",
          loading && "opacity-50"
        )}
      >
        {displayValue}
      </span>
      
      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7"
        onClick={handleIncrement}
        disabled={disabled || loading || isUnlimited || (max !== undefined && value >= max)}
      >
        <Plus className="h-3 w-3" />
      </Button>
      
      <Button
        variant={isUnlimited ? "default" : "outline"}
        size="icon"
        className="h-7 w-7 ml-1"
        onClick={handleSetUnlimited}
        disabled={disabled || loading || isUnlimited}
        title="Безлимит"
      >
        <span className="text-xs font-bold">∞</span>
      </Button>
    </div>
  )
}

