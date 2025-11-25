"use server"

import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function createUserForm(userId: string, userEmail: string) {
  // First ensure user exists in public.users (bypass RLS with service role)
  const { data: existingUser } = await supabaseAdmin.from("users").select("id").eq("id", userId).single()

  if (!existingUser) {
    const { error: userError } = await supabaseAdmin.from("users").insert({
      id: userId,
      email: userEmail,
      role: "user",
    })

    if (userError) {
      console.error("Error creating user:", userError)
      return { error: "Ошибка создания пользователя: " + userError.message }
    }
  }

  // Create the form
  const { data: newForm, error: formError } = await supabaseAdmin
    .from("forms")
    .insert({
      owner_id: userId,
      name: "Моя форма",
      lead_limit: 20,
      lead_count: 0,
      is_active: true,
    })
    .select()
    .single()

  if (formError) {
    console.error("Error creating form:", formError)
    return { error: "Ошибка создания формы: " + formError.message }
  }

  // Create default content for the form
  const defaultContent = [
    { form_id: newForm.id, key: "page_title", value: "Анализ сайта с помощью ИИ" },
    { form_id: newForm.id, key: "page_subtitle", value: "Получите детальный анализ вашего сайта за 30 секунд" },
    { form_id: newForm.id, key: "submit_button", value: "Получить анализ" },
    { form_id: newForm.id, key: "url_placeholder", value: "https://example.com" },
    { form_id: newForm.id, key: "disclaimer", value: "Бесплатно • Занимает 30 секунд" },
    {
      form_id: newForm.id,
      key: "ai_system_prompt",
      value:
        "You are an expert business consultant. Analyze the provided website and generate clear, actionable recommendations in Russian.",
    },
    { form_id: newForm.id, key: "ai_result_format", value: "text" },
    { form_id: newForm.id, key: "loading_message_1", value: "Анализируем сайт..." },
    { form_id: newForm.id, key: "loading_message_2", value: "Генерируем рекомендации..." },
    { form_id: newForm.id, key: "loading_message_3", value: "Почти готово..." },
    { form_id: newForm.id, key: "email_title", value: "Получите результаты" },
    { form_id: newForm.id, key: "email_subtitle", value: "Введите email чтобы получить полный анализ" },
    { form_id: newForm.id, key: "email_button", value: "Получить результат" },
    { form_id: newForm.id, key: "email_placeholder", value: "your@email.com" },
    { form_id: newForm.id, key: "result_title", value: "Ваш результат" },
    { form_id: newForm.id, key: "result_blur_text", value: "Введите email чтобы увидеть полный результат" },
    { form_id: newForm.id, key: "success_title", value: "Готово!" },
    { form_id: newForm.id, key: "success_message", value: "Ваш результат готов" },
    { form_id: newForm.id, key: "share_button", value: "Поделиться" },
    { form_id: newForm.id, key: "download_button", value: "Скачать" },
  ]

  await supabaseAdmin.from("form_content").insert(defaultContent)

  return { form: newForm }
}
