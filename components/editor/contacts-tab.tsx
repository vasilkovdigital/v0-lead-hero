/**
 * ContactsTab - Вкладка "Контакты"
 * Содержит поля для email формы: заголовок, подзаголовок, placeholder, кнопка
 */
"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ContactsTabProps {
  content: Record<string, string>
  onChange: (content: Record<string, string>) => void
}

export function ContactsTab({ content, onChange }: ContactsTabProps) {
  const handleChange = (key: string, value: string) => {
    onChange({ ...content, [key]: value })
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email_title" className="text-sm">Заголовок email формы</Label>
        <Input
          id="email_title"
          value={content.email_title || ""}
          onChange={(e) => handleChange("email_title", e.target.value)}
          placeholder="Получите результаты"
          className="h-10 sm:h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email_subtitle" className="text-sm">Подзаголовок email формы</Label>
        <Textarea
          id="email_subtitle"
          value={content.email_subtitle || ""}
          onChange={(e) => handleChange("email_subtitle", e.target.value)}
          placeholder="Введите email чтобы получить полный анализ"
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email_placeholder" className="text-sm">Плейсхолдер email</Label>
        <Input
          id="email_placeholder"
          value={content.email_placeholder || ""}
          onChange={(e) => handleChange("email_placeholder", e.target.value)}
          placeholder="your@email.com"
          className="h-10 sm:h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email_button" className="text-sm">Текст кнопки email</Label>
        <Input
          id="email_button"
          value={content.email_button || ""}
          onChange={(e) => handleChange("email_button", e.target.value)}
          placeholder="Получить результат"
          className="h-10 sm:h-11"
        />
      </div>
    </div>
  )
}
