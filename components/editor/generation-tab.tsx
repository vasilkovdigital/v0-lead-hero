/**
 * GenerationTab - Вкладка "Генерация"
 * Содержит настройки AI: системный промпт, формат результата, сообщения загрузки
 */
"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface GenerationTabProps {
  content: Record<string, string>
  systemPrompt: string
  resultFormat: string
  loadingMessages: string[]
  onContentChange: (content: Record<string, string>) => void
  onSystemPromptChange: (value: string) => void
  onResultFormatChange: (value: string) => void
  onLoadingMessageChange: (index: number, value: string) => void
}

export function GenerationTab({
  content,
  systemPrompt,
  resultFormat,
  loadingMessages,
  onContentChange,
  onSystemPromptChange,
  onResultFormatChange,
  onLoadingMessageChange,
}: GenerationTabProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* AI Настройки */}
      <div className="p-3 sm:p-4 border border-accent/20 rounded-lg space-y-3 sm:space-y-4 bg-accent/5">
        <h3 className="text-base sm:text-lg font-semibold text-accent">Настройки AI</h3>

        <div className="space-y-2">
          <Label htmlFor="system_prompt" className="text-sm">Индивидуальный промпт формы</Label>
          <Textarea
            id="system_prompt"
            value={systemPrompt}
            onChange={(e) => onSystemPromptChange(e.target.value)}
            placeholder="Введите индивидуальный промпт для этой формы (необязательно)..."
            rows={6}
            className="font-mono text-xs sm:text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Индивидуальный промпт для этой формы (необязательно). Добавляется к глобальному промпту
            для выбранного формата результата (текст или изображение).
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="result_format" className="text-sm">Формат результата</Label>
          <Select value={resultFormat} onValueChange={onResultFormatChange}>
            <SelectTrigger id="result_format" className="w-full h-10">
              <SelectValue placeholder="Выберите формат" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Текст</SelectItem>
              <SelectItem value="image">Изображение (DALL-E)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Выберите формат результата: текст или сгенерированное изображение через DALL-E 3.
          </p>
        </div>
      </div>

      {/* Сообщения загрузки */}
      <div className="space-y-2">
        <Label className="text-sm">Сообщения загрузки</Label>
        <p className="text-xs text-muted-foreground mb-2">Показываются пока AI генерирует результат</p>
        {[0, 1, 2].map((index) => (
          <Input
            key={index}
            value={loadingMessages[index] || ""}
            onChange={(e) => onLoadingMessageChange(index, e.target.value)}
            placeholder={`Сообщение ${index + 1}`}
            className="h-10 sm:h-11"
          />
        ))}
      </div>
    </div>
  )
}
