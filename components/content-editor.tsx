/**
 * ContentEditor - Редактор контента формы
 * Позволяет настраивать тексты, AI-промпты и другие параметры формы
 * Поддерживает выбор формы для редактирования если у пользователя несколько форм
 * Для суперадмина также доступна главная форма
 * 
 * Использует React Query для кэширования данных
 */
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Save, Settings, AlertCircle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useEditorForms, useFormContent, useSaveFormContent } from "@/lib/hooks"

interface ContentEditorProps {
  formId?: string
}

export function ContentEditor({ formId: propFormId }: ContentEditorProps) {
  // React Query хуки
  const { data: formsData, isLoading: formsLoading } = useEditorForms()
  const saveContentMutation = useSaveFormContent()

  // Локальное состояние
  const [selectedFormId, setSelectedFormId] = useState<string | null>(propFormId || null)
  const [content, setContent] = useState<Record<string, string>>({})
  const [loadingMessages, setLoadingMessages] = useState<string[]>(["", "", ""])
  const [systemPrompt, setSystemPrompt] = useState<string>("")
  const [resultFormat, setResultFormat] = useState<string>("text")

  const forms = formsData?.forms || []

  // Устанавливаем первую форму по умолчанию
  useEffect(() => {
    if (!propFormId && forms.length > 0 && !selectedFormId) {
      setSelectedFormId(forms[0].id)
    }
  }, [forms, propFormId, selectedFormId])

  // Загружаем контент выбранной формы
  const { data: contentData, isLoading: contentLoading } = useFormContent(selectedFormId)

  // Обновляем локальное состояние когда загружаем контент
  useEffect(() => {
    if (contentData) {
      setContent(contentData.content)
      setLoadingMessages(contentData.loadingMessages)
      setSystemPrompt(contentData.systemPrompt)
      setResultFormat(contentData.resultFormat)
    }
  }, [contentData])

  const handleFormChange = (formId: string) => {
    setSelectedFormId(formId)
  }

  const handleSave = async () => {
    if (!selectedFormId) return

    try {
      await saveContentMutation.mutateAsync({
        formId: selectedFormId,
        content,
        loadingMessages,
        systemPrompt,
        resultFormat,
      })
      toast.success("Контент сохранён!")
    } catch (err) {
      toast.error("Ошибка сохранения: " + (err instanceof Error ? err.message : "Неизвестная ошибка"))
    }
  }

  const handleLoadingMessageChange = (index: number, value: string) => {
    const newMessages = [...loadingMessages]
    newMessages[index] = value
    setLoadingMessages(newMessages)
  }

  const isLoading = formsLoading || contentLoading

  if (isLoading && !contentData) {
    return <div className="text-center py-8">Загрузка контента...</div>
  }

  if (!selectedFormId && forms.length === 0 && !formsLoading) {
    return (
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">Форма не найдена</p>
          <p className="text-sm text-muted-foreground">Сначала создайте форму.</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Редактор контента</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Настройка текстов и AI параметров</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {/* Выбор формы (если несколько) */}
            {forms.length > 1 && !propFormId && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Settings className="h-4 w-4 text-muted-foreground shrink-0" />
                <Select value={selectedFormId || ""} onValueChange={handleFormChange}>
                  <SelectTrigger className="!h-9 w-full sm:w-[200px]">
                    <SelectValue placeholder="Выберите форму" />
                  </SelectTrigger>
                  <SelectContent>
                    {forms.map((form) => (
                      <SelectItem key={form.id} value={form.id}>
                        {form.isMain ? `⭐ ${form.name} (Главная)` : form.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button 
              onClick={handleSave} 
              disabled={saveContentMutation.isPending || contentLoading} 
              className="min-w-[140px] w-full sm:w-auto h-10 sm:h-11"
            >
              <Save className="mr-2 h-4 w-4" />
              {saveContentMutation.isPending ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* AI Настройки */}
          <div className="p-3 sm:p-4 border border-accent/20 rounded-lg space-y-3 sm:space-y-4 bg-accent/5">
            <h3 className="text-base sm:text-lg font-semibold text-accent">Настройки AI</h3>

            <div className="space-y-2">
              <Label htmlFor="system_prompt" className="text-sm">Индивидуальный промпт формы</Label>
              <Textarea
                id="system_prompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
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
              <Select value={resultFormat} onValueChange={setResultFormat}>
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

          {/* Основные тексты */}
          <div className="space-y-2">
            <Label htmlFor="page_title" className="text-sm">Заголовок страницы</Label>
            <Input
              id="page_title"
              value={content.page_title || ""}
              onChange={(e) => setContent({ ...content, page_title: e.target.value })}
              className="h-10 sm:h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="page_subtitle" className="text-sm">Подзаголовок страницы</Label>
            <Textarea
              id="page_subtitle"
              value={content.page_subtitle || ""}
              onChange={(e) => setContent({ ...content, page_subtitle: e.target.value })}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url_placeholder" className="text-sm">Плейсхолдер для URL</Label>
            <Input
              id="url_placeholder"
              value={content.url_placeholder || ""}
              onChange={(e) => setContent({ ...content, url_placeholder: e.target.value })}
              className="h-10 sm:h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="submit_button" className="text-sm">Текст кнопки отправки</Label>
            <Input
              id="submit_button"
              value={content.submit_button || ""}
              onChange={(e) => setContent({ ...content, submit_button: e.target.value })}
              className="h-10 sm:h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="disclaimer" className="text-sm">Дисклеймер</Label>
            <Input
              id="disclaimer"
              value={content.disclaimer || ""}
              onChange={(e) => setContent({ ...content, disclaimer: e.target.value })}
              className="h-10 sm:h-11"
            />
          </div>

          {/* Сообщения загрузки */}
          <div className="space-y-2">
            <Label className="text-sm">Сообщения загрузки</Label>
            <p className="text-xs text-muted-foreground mb-2">Показываются пока AI генерирует результат</p>
            {[0, 1, 2].map((index) => (
              <Input
                key={index}
                value={loadingMessages[index] || ""}
                onChange={(e) => handleLoadingMessageChange(index, e.target.value)}
                placeholder={`Сообщение ${index + 1}`}
                className="h-10 sm:h-11"
              />
            ))}
          </div>

          {/* Результат */}
          <div className="space-y-2">
            <Label htmlFor="result_title" className="text-sm">Заголовок результата</Label>
            <Input
              id="result_title"
              value={content.result_title || ""}
              onChange={(e) => setContent({ ...content, result_title: e.target.value })}
              className="h-10 sm:h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="result_blur_text" className="text-sm">Текст блюра результата (до ввода email)</Label>
            <Input
              id="result_blur_text"
              value={content.result_blur_text || ""}
              onChange={(e) => setContent({ ...content, result_blur_text: e.target.value })}
              className="h-10 sm:h-11"
            />
          </div>

          {/* Email форма */}
          <div className="space-y-2">
            <Label htmlFor="email_title" className="text-sm">Заголовок email формы</Label>
            <Input
              id="email_title"
              value={content.email_title || ""}
              onChange={(e) => setContent({ ...content, email_title: e.target.value })}
              className="h-10 sm:h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email_subtitle" className="text-sm">Подзаголовок email формы</Label>
            <Textarea
              id="email_subtitle"
              value={content.email_subtitle || ""}
              onChange={(e) => setContent({ ...content, email_subtitle: e.target.value })}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email_placeholder" className="text-sm">Плейсхолдер email</Label>
            <Input
              id="email_placeholder"
              value={content.email_placeholder || ""}
              onChange={(e) => setContent({ ...content, email_placeholder: e.target.value })}
              className="h-10 sm:h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email_button" className="text-sm">Текст кнопки email</Label>
            <Input
              id="email_button"
              value={content.email_button || ""}
              onChange={(e) => setContent({ ...content, email_button: e.target.value })}
              className="h-10 sm:h-11"
            />
          </div>

          {/* Успех */}
          <div className="space-y-2">
            <Label htmlFor="success_title" className="text-sm">Заголовок успеха</Label>
            <Input
              id="success_title"
              value={content.success_title || ""}
              onChange={(e) => setContent({ ...content, success_title: e.target.value })}
              className="h-10 sm:h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="success_message" className="text-sm">Сообщение успеха</Label>
            <Textarea
              id="success_message"
              value={content.success_message || ""}
              onChange={(e) => setContent({ ...content, success_message: e.target.value })}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="share_button" className="text-sm">Текст кнопки &quot;Поделиться&quot;</Label>
            <Input
              id="share_button"
              value={content.share_button || ""}
              onChange={(e) => setContent({ ...content, share_button: e.target.value })}
              className="h-10 sm:h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="download_button" className="text-sm">Текст кнопки &quot;Скачать&quot;</Label>
            <Input
              id="download_button"
              value={content.download_button || ""}
              onChange={(e) => setContent({ ...content, download_button: e.target.value })}
              className="h-10 sm:h-11"
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
