"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getSystemSetting, updateSystemSetting } from "@/app/actions/system-settings"
import { useCurrentUser } from "./use-auth"

interface SystemSettings {
  globalTextPrompt: string
  globalImagePrompt: string
}

/**
 * Загрузка системных настроек
 */
async function fetchSystemSettings(): Promise<SystemSettings> {
  const [textResult, imageResult] = await Promise.all([
    getSystemSetting("global_text_prompt"),
    getSystemSetting("global_image_prompt"),
  ])

  if (textResult.error) throw new Error(textResult.error)
  if (imageResult.error) throw new Error(imageResult.error)

  return {
    globalTextPrompt: textResult.value || "",
    globalImagePrompt: imageResult.value || "",
  }
}

/**
 * Хук для получения системных настроек
 */
export function useSystemSettings() {
  return useQuery({
    queryKey: ["systemSettings"],
    queryFn: fetchSystemSettings,
    staleTime: 5 * 60 * 1000, // 5 минут
  })
}

/**
 * Хук для сохранения системных настроек
 */
export function useSaveSystemSettings() {
  const queryClient = useQueryClient()
  const { data: user } = useCurrentUser()

  return useMutation({
    mutationFn: async ({
      globalTextPrompt,
      globalImagePrompt,
    }: {
      globalTextPrompt: string
      globalImagePrompt: string
    }) => {
      if (!user) throw new Error("Пользователь не авторизован")

      const [textResult, imageResult] = await Promise.all([
        updateSystemSetting(user.id, "global_text_prompt", globalTextPrompt),
        updateSystemSetting(user.id, "global_image_prompt", globalImagePrompt),
      ])

      if (!textResult.success) throw new Error(textResult.error || "Ошибка сохранения текстового промпта")
      if (!imageResult.success) throw new Error(imageResult.error || "Ошибка сохранения промпта изображений")

      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemSettings"] })
    },
  })
}

