import { createClient } from "@/lib/supabase/server"

export const maxDuration = 60

async function fetchUrlContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LeadHeroBot/1.0)",
      },
    })

    if (!response.ok) {
      return `Unable to fetch URL content (Status: ${response.status})`
    }

    const html = await response.text()

    const textContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 3000)

    return textContent || "Unable to extract meaningful content from URL"
  } catch (error) {
    console.error("[v0] Error fetching URL:", error)
    return `Error fetching URL: ${error instanceof Error ? error.message : "Unknown error"}`
  }
}

export async function POST(req: Request) {
  try {
    const { url, formId } = await req.json()

    const supabase = await createClient()

    // Fetch ALL content settings from form_content
    const { data: contentData } = await supabase.from("form_content").select("key, value").eq("form_id", formId)

    const getContent = (key: string, defaultValue: string) => {
      return contentData?.find((c) => c.key === key)?.value || defaultValue
    }

    const systemPrompt = getContent(
      "ai_system_prompt",
      `You are an expert consultant. Analyze the provided content and give personalized, actionable recommendations.

IMPORTANT FORMATTING RULES:
- Write in plain text only, NO markdown formatting
- Do NOT use asterisks, hashtags, or any special characters for emphasis
- Use simple paragraphs separated by blank lines
- Keep your response clean, readable, and professional`,
    )

    const resultFormat = getContent("ai_result_format", "text")

    const urlContent = await fetchUrlContent(url)

    if (resultFormat === "image") {
      const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: systemPrompt, // Use the prompt from admin panel
          n: 1,
          size: "1024x1024",
          quality: "standard",
        }),
      })

      if (!imageResponse.ok) {
        const errorData = await imageResponse.json()
        console.error("[v0] DALL-E API error:", errorData)
        throw new Error(`DALL-E API error: ${errorData.error?.message || "Unknown error"}`)
      }

      const imageData = await imageResponse.json()
      const imageUrl = imageData.data[0]?.url || ""

      return Response.json({
        success: true,
        result: {
          type: "image",
          imageUrl: imageUrl,
          text: `Generated based on: ${url}`,
        },
      })
    } else {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: `URL: ${url}\n\nContent:\n${urlContent}\n\nPlease provide your analysis and recommendations.`,
            },
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] OpenAI API error:", errorData)
        throw new Error(`OpenAI API error: ${errorData.error?.message || "Unknown error"}`)
      }

      const completion = await response.json()
      const generatedText = completion.choices[0]?.message?.content || ""

      return Response.json({
        success: true,
        result: {
          type: "text",
          text: generatedText,
        },
      })
    }
  } catch (error: any) {
    console.error("[v0] Generation error:", error)
    return Response.json(
      {
        error: "Failed to generate result",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
