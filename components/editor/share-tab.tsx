/**
 * ShareTab - Вкладка "Поделиться"
 * Содержит поля успеха и кнопок шаринга: заголовок успеха, сообщение, кнопки поделиться/скачать
 */
"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ShareTabProps {
  content: Record<string, string>
  onChange: (content: Record<string, string>) => void
}

export function ShareTab({ content, onChange }: ShareTabProps) {
  const handleChange = (key: string, value: string) => {
    onChange({ ...content, [key]: value })
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <Label htmlFor="success_title" className="text-sm">Заголовок успеха</Label>
        <Input
          id="success_title"
          value={content.success_title || ""}
          onChange={(e) => handleChange("success_title", e.target.value)}
          placeholder="Готово!"
          className="h-10 sm:h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="success_message" className="text-sm">Сообщение успеха</Label>
        <Textarea
          id="success_message"
          value={content.success_message || ""}
          onChange={(e) => handleChange("success_message", e.target.value)}
          placeholder="Ваш результат готов"
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="share_button" className="text-sm">Текст кнопки &quot;Поделиться&quot;</Label>
        <Input
          id="share_button"
          value={content.share_button || ""}
          onChange={(e) => handleChange("share_button", e.target.value)}
          placeholder="Поделиться"
          className="h-10 sm:h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="download_button" className="text-sm">Текст кнопки &quot;Скачать&quot;</Label>
        <Input
          id="download_button"
          value={content.download_button || ""}
          onChange={(e) => handleChange("download_button", e.target.value)}
          placeholder="Скачать"
          className="h-10 sm:h-11"
        />
      </div>
    </div>
  )
}
