"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
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
  // Локальное состояние для ввода
  const [localValue, setLocalValue] = useState<string>(value.toString())

  // Синхронизируем локальное состояние при изменении value извне
  useEffect(() => {
    setLocalValue(value.toString())
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || loading) return
    
    // Обновляем только локальное состояние при вводе
    setLocalValue(e.target.value)
  }

  const commitValue = () => {
    if (disabled || loading) return

    const inputValue = localValue.trim()
    
    // Если поле пустое, устанавливаем min
    if (inputValue === '') {
      const finalValue = min
      setLocalValue(finalValue.toString())
      onChange(finalValue)
      return
    }
    
    const numValue = parseInt(inputValue, 10)
    
    // Если невалидное число, возвращаемся к исходному значению
    if (isNaN(numValue)) {
      setLocalValue(value.toString())
      return
    }
    
    // Применяем ограничения min/max
    let newValue = numValue
    if (newValue < min) newValue = min
    if (max !== undefined && newValue > max) newValue = max
    
    // Обновляем локальное состояние и вызываем onChange
    setLocalValue(newValue.toString())
    onChange(newValue)
  }

  const handleBlur = () => {
    commitValue()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      commitValue()
    }
  }

  return (
    <div className={cn("flex items-center", className)}>
      <Input
        type="number"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled || loading}
        min={min}
        max={max}
        step={step}
        className={cn(
          "w-20 h-8 text-center text-sm font-medium tabular-nums",
          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          loading && "opacity-50"
        )}
      />
    </div>
  )
}

