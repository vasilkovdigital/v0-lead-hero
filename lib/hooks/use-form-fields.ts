/**
 * Хуки для работы с динамическими полями форм
 * Использует React Query для кэширования и синхронизации данных
 */
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getFormFields,
  saveFormField,
  deleteFormField,
  reorderFormFields,
  type FormField,
  type FormFieldInput,
} from "@/app/actions/form-fields"
import { useCurrentUser } from "./use-auth"

// Ключ для кэша полей формы
const FORM_FIELDS_KEY = "form-fields"

/**
 * Хук для загрузки полей формы
 */
export function useFormFields(formId: string | null) {
  return useQuery({
    queryKey: [FORM_FIELDS_KEY, formId],
    queryFn: async () => {
      if (!formId) return { fields: [] }
      const result = await getFormFields(formId)
      if ("error" in result) {
        throw new Error(result.error)
      }
      return result
    },
    enabled: !!formId,
    staleTime: 1000 * 60 * 5, // 5 минут
  })
}

/**
 * Хук для создания/обновления поля формы
 */
export function useSaveFormField() {
  const queryClient = useQueryClient()
  const { data: user } = useCurrentUser()

  return useMutation({
    mutationFn: async ({
      formId,
      fieldData,
    }: {
      formId: string
      fieldData: FormFieldInput
    }) => {
      if (!user?.id) {
        throw new Error("Пользователь не авторизован")
      }
      const result = await saveFormField(user.id, formId, fieldData)
      if ("error" in result) {
        throw new Error(result.error)
      }
      return result
    },
    onSuccess: (_, variables) => {
      // Инвалидируем кэш полей формы
      queryClient.invalidateQueries({
        queryKey: [FORM_FIELDS_KEY, variables.formId],
      })
    },
  })
}

/**
 * Хук для удаления поля формы
 */
export function useDeleteFormField() {
  const queryClient = useQueryClient()
  const { data: user } = useCurrentUser()

  return useMutation({
    mutationFn: async ({
      formId,
      fieldId,
    }: {
      formId: string
      fieldId: string
    }) => {
      if (!user?.id) {
        throw new Error("Пользователь не авторизован")
      }
      const result = await deleteFormField(user.id, formId, fieldId)
      if ("error" in result) {
        throw new Error(result.error)
      }
      return result
    },
    onSuccess: (_, variables) => {
      // Инвалидируем кэш полей формы
      queryClient.invalidateQueries({
        queryKey: [FORM_FIELDS_KEY, variables.formId],
      })
    },
  })
}

/**
 * Хук для изменения порядка полей формы
 */
export function useReorderFormFields() {
  const queryClient = useQueryClient()
  const { data: user } = useCurrentUser()

  return useMutation({
    mutationFn: async ({
      formId,
      fieldIds,
    }: {
      formId: string
      fieldIds: string[]
    }) => {
      if (!user?.id) {
        throw new Error("Пользователь не авторизован")
      }
      const result = await reorderFormFields(user.id, formId, fieldIds)
      if ("error" in result) {
        throw new Error(result.error)
      }
      return result
    },
    onSuccess: (_, variables) => {
      // Инвалидируем кэш полей формы
      queryClient.invalidateQueries({
        queryKey: [FORM_FIELDS_KEY, variables.formId],
      })
    },
  })
}

export type { FormField, FormFieldInput }
