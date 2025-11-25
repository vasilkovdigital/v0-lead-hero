"use server"

import { createClient } from "@supabase/supabase-js"

// Use service role to bypass RLS for server-side operations
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const TEST_EMAIL = "hello@vasilkov.digital"

interface CreateLeadParams {
  formId: string
  email: string
  url: string
  resultText: string
  resultImageUrl: string | null
}

export async function createLead({ formId, email, url, resultText, resultImageUrl }: CreateLeadParams) {
  const isTestEmail = email.toLowerCase() === TEST_EMAIL.toLowerCase()

  if (!isTestEmail) {
    // Check if email already used for this form
    const { data: existing } = await supabaseAdmin
      .from("leads")
      .select("id")
      .eq("form_id", formId)
      .eq("email", email)
      .single()

    if (existing) {
      return { error: "Вы уже отправляли заявку с этого email" }
    }
  } else {
    await supabaseAdmin.from("leads").delete().eq("form_id", formId).eq("email", email)
  }

  // Create lead with all data
  const { error: insertError } = await supabaseAdmin.from("leads").insert({
    id: crypto.randomUUID(),
    form_id: formId,
    email,
    url,
    result_text: resultText,
    result_image_url: resultImageUrl,
    status: "completed",
  })

  if (insertError) {
    return { error: "Ошибка при сохранении заявки" }
  }

  // Increment lead count (not for test email)
  if (!isTestEmail) {
    await supabaseAdmin.rpc("increment_lead_count", { form_id: formId })
  }

  return { success: true }
}

// Legacy function - kept for compatibility
export async function updateLeadWithEmail(
  leadId: string,
  formId: string,
  email: string,
  resultText: string,
  resultImageUrl: string | null,
) {
  return createLead({ formId, email, url: "", resultText, resultImageUrl })
}
