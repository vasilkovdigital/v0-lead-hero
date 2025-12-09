/**
 * SystemSettingsEditor - Редактор системных настроек
 * Доступен только для суперадминов
 * Позволяет настраивать глобальные промпты: для текста и для изображений
 * 
 * Использует React Query для кэширования данных
 */
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Save, Settings, AlertCircle, CheckCircle2 } from "lucide-react"
import { useSystemSettings, useSaveSystemSettings } from "@/lib/hooks"

export function SystemSettingsEditor() {
  // React Query хуки
  const { data, isLoading, error: queryError } = useSystemSettings()
  const saveSettingsMutation = useSaveSystemSettings()

  // Локальное состояние для редактирования
  const [globalTextPrompt, setGlobalTextPrompt] = useState<string>("")
  const [globalImagePrompt, setGlobalImagePrompt] = useState<string>("")
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")

  // Синхронизируем локальное состояние с данными из кэша
  useEffect(() => {
    if (data) {
      setGlobalTextPrompt(data.globalTextPrompt)
      setGlobalImagePrompt(data.globalImagePrompt)
    }
  }, [data])

  // Сбрасываем статус через 3 секунды
  useEffect(() => {
    if (saveStatus !== "idle") {
      const timer = setTimeout(() => setSaveStatus("idle"), 3000)
      return () => clearTimeout(timer)
    }
  }, [saveStatus])

  const handleSave = async () => {
    setSaveStatus("idle")

    try {
      await saveSettingsMutation.mutateAsync({
        globalTextPrompt,
        globalImagePrompt,
      })
      setSaveStatus("success")
    } catch (err) {
      setSaveStatus("error")
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Загрузка настроек...</div>
  }

  if (queryError) {
    return (
      <Card className="p-4 sm:p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка загрузки</AlertTitle>
          <AlertDescription>{queryError.message}</AlertDescription>
        </Alert>
      </Card>
    )
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
              Системные настройки
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Глобальные настройки, применяемые ко всем формам
            </p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saveSettingsMutation.isPending} 
            className="min-w-[140px] w-full sm:w-auto h-10 sm:h-11"
          >
            <Save className="mr-2 h-4 w-4" />
            {saveSettingsMutation.isPending ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>

        {/* Статус сохранения */}
        {saveStatus === "success" && (
          <Alert className="border-green-500/50 bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-500">Сохранено</AlertTitle>
            <AlertDescription className="text-green-500/80">
              Системные настройки успешно обновлены
            </AlertDescription>
          </Alert>
        )}

        {(saveStatus === "error" || saveSettingsMutation.error) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Ошибка</AlertTitle>
            <AlertDescription>
              {saveSettingsMutation.error?.message || "Ошибка сохранения"}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 sm:space-y-6">
          {/* Глобальный промпт для текста */}
          <div className="p-3 sm:p-4 border border-accent/20 rounded-lg space-y-3 sm:space-y-4 bg-accent/5">
            <h3 className="text-base sm:text-lg font-semibold text-accent">
              Системный промпт для текста
            </h3>

            <div className="space-y-2">
              <Label htmlFor="global_text_prompt" className="text-sm">
                Инструкции AI для генерации текстовых результатов
              </Label>
              <Textarea
                id="global_text_prompt"
                value={globalTextPrompt}
                onChange={(e) => setGlobalTextPrompt(e.target.value)}
                placeholder="Введите системный промпт для текстового формата..."
                rows={12}
                className="font-mono text-xs sm:text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Применяется к формам с форматом результата «Текст». Индивидуальный промпт формы 
                (если задан) добавляется к этому глобальному промпту.
              </p>
            </div>
          </div>

          {/* Глобальный промпт для изображений */}
          <div className="p-3 sm:p-4 border border-purple-500/20 rounded-lg space-y-3 sm:space-y-4 bg-purple-500/5">
            <h3 className="text-base sm:text-lg font-semibold text-purple-500">
              Системный промпт для изображений (DALL-E)
            </h3>

            <div className="space-y-2">
              <Label htmlFor="global_image_prompt" className="text-sm">
                Инструкции AI для генерации промптов DALL-E
              </Label>
              <Textarea
                id="global_image_prompt"
                value={globalImagePrompt}
                onChange={(e) => setGlobalImagePrompt(e.target.value)}
                placeholder="Введите системный промпт для генерации изображений..."
                rows={10}
                className="font-mono text-xs sm:text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Применяется к формам с форматом результата «Изображение». GPT использует этот промпт 
                для создания безопасного промпта DALL-E. Индивидуальный промпт формы добавляется сюда.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
