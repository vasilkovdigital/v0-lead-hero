"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Save } from "lucide-react"

interface ContentItem {
  id: string
  key: string
  value: any
}

interface ContentEditorProps {
  formId?: string
}

export function ContentEditor({ formId: propFormId }: ContentEditorProps) {
  const [formId, setFormId] = useState<string | null>(propFormId || null)
  const [content, setContent] = useState<Record<string, string>>({})
  const [loadingMessages, setLoadingMessages] = useState<string[]>([])
  const [systemPrompt, setSystemPrompt] = useState<string>("")
  const [resultFormat, setResultFormat] = useState<string>("text")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (propFormId) {
      setFormId(propFormId)
      fetchContent(propFormId)
      setIsLoading(false)
    } else {
      fetchFormAndContent()
    }
  }, [propFormId])

  const fetchFormAndContent = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data: form } = await supabase.from("forms").select("id").eq("owner_id", user.id).single()

    if (form) {
      setFormId(form.id)
      await fetchContent(form.id)
    }
    setIsLoading(false)
  }

  const fetchContent = async (fId: string) => {
    const supabase = createClient()
    const { data, error } = await supabase.from("form_content").select("*").eq("form_id", fId)

    if (!error && data) {
      const contentMap: Record<string, string> = {}
      const messages: string[] = []
      let prompt = ""
      let format = "text"

      data.forEach((item: ContentItem) => {
        if (item.key.startsWith("loading_message_")) {
          messages.push(item.value)
        } else if (item.key === "ai_system_prompt") {
          prompt = item.value
        } else if (item.key === "ai_result_format") {
          format = item.value
        } else {
          contentMap[item.key] = item.value
        }
      })

      setContent(contentMap)
      setLoadingMessages(messages.length > 0 ? messages : ["Analyzing...", "Processing...", "Almost done..."])
      setSystemPrompt(
        prompt ||
          "You are an expert business consultant. Analyze the provided website and generate clear, actionable recommendations. Provide your response in plain text without any markdown formatting, asterisks, or special characters. Keep your tone professional and direct.",
      )
      setResultFormat(format)
    }
  }

  const handleSave = async () => {
    if (!formId) return

    setIsSaving(true)
    const supabase = createClient()

    for (const [key, value] of Object.entries(content)) {
      await supabase.from("form_content").upsert({ form_id: formId, key, value }, { onConflict: "form_id,key" })
    }

    for (let i = 0; i < loadingMessages.length; i++) {
      await supabase
        .from("form_content")
        .upsert(
          { form_id: formId, key: `loading_message_${i + 1}`, value: loadingMessages[i] },
          { onConflict: "form_id,key" },
        )
    }

    await supabase
      .from("form_content")
      .upsert({ form_id: formId, key: "ai_system_prompt", value: systemPrompt }, { onConflict: "form_id,key" })

    await supabase
      .from("form_content")
      .upsert({ form_id: formId, key: "ai_result_format", value: resultFormat }, { onConflict: "form_id,key" })

    setIsSaving(false)
    alert("Content saved successfully!")
  }

  const handleLoadingMessageChange = (index: number, value: string) => {
    const newMessages = [...loadingMessages]
    newMessages[index] = value
    setLoadingMessages(newMessages)
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading content...</div>
  }

  if (!formId) {
    return <div className="text-center py-8">No form found. Please create a form first.</div>
  }

  return (
    <Card className="p-6">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Content Editor</h2>
            <p className="text-muted-foreground">Customize the text shown to users and AI settings</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="space-y-6">
          <div className="p-4 border border-accent/20 rounded-lg space-y-4 bg-accent/5">
            <h3 className="text-lg font-semibold text-accent">AI Settings</h3>

            <div className="space-y-2">
              <Label htmlFor="system_prompt">System Prompt (OpenAI)</Label>
              <Textarea
                id="system_prompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Enter the system prompt for OpenAI..."
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                This prompt instructs the AI on how to analyze websites and generate recommendations.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="result_format">Result Format</Label>
              <select
                id="result_format"
                value={resultFormat}
                onChange={(e) => setResultFormat(e.target.value)}
                className="w-full h-10 px-3 rounded border border-input bg-background"
              >
                <option value="text">Text</option>
                <option value="image">Image (DALL-E)</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Choose whether results should be plain text or generated as an image using DALL-E 3.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="page_title">Page Title</Label>
            <Input
              id="page_title"
              value={content.page_title || ""}
              onChange={(e) => setContent({ ...content, page_title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="page_subtitle">Page Subtitle</Label>
            <Textarea
              id="page_subtitle"
              value={content.page_subtitle || ""}
              onChange={(e) => setContent({ ...content, page_subtitle: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url_placeholder">URL Input Placeholder</Label>
            <Input
              id="url_placeholder"
              value={content.url_placeholder || ""}
              onChange={(e) => setContent({ ...content, url_placeholder: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="submit_button">Submit Button Text</Label>
            <Input
              id="submit_button"
              value={content.submit_button || ""}
              onChange={(e) => setContent({ ...content, submit_button: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="disclaimer">Disclaimer Text</Label>
            <Input
              id="disclaimer"
              value={content.disclaimer || ""}
              onChange={(e) => setContent({ ...content, disclaimer: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Loading Messages</Label>
            <p className="text-xs text-muted-foreground mb-2">Messages shown while AI generates the result</p>
            {[0, 1, 2].map((index) => (
              <Input
                key={index}
                value={loadingMessages[index] || ""}
                onChange={(e) => handleLoadingMessageChange(index, e.target.value)}
                placeholder={`Loading message ${index + 1}`}
              />
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="result_title">Result Title</Label>
            <Input
              id="result_title"
              value={content.result_title || ""}
              onChange={(e) => setContent({ ...content, result_title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="result_blur_text">Result Blur Text (shown before email)</Label>
            <Input
              id="result_blur_text"
              value={content.result_blur_text || ""}
              onChange={(e) => setContent({ ...content, result_blur_text: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email_title">Email Capture Title</Label>
            <Input
              id="email_title"
              value={content.email_title || ""}
              onChange={(e) => setContent({ ...content, email_title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email_subtitle">Email Capture Subtitle</Label>
            <Textarea
              id="email_subtitle"
              value={content.email_subtitle || ""}
              onChange={(e) => setContent({ ...content, email_subtitle: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email_placeholder">Email Placeholder</Label>
            <Input
              id="email_placeholder"
              value={content.email_placeholder || ""}
              onChange={(e) => setContent({ ...content, email_placeholder: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email_button">Email Button Text</Label>
            <Input
              id="email_button"
              value={content.email_button || ""}
              onChange={(e) => setContent({ ...content, email_button: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="success_title">Success Title</Label>
            <Input
              id="success_title"
              value={content.success_title || ""}
              onChange={(e) => setContent({ ...content, success_title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="success_message">Success Message</Label>
            <Textarea
              id="success_message"
              value={content.success_message || ""}
              onChange={(e) => setContent({ ...content, success_message: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="share_button">Share Button Text</Label>
            <Input
              id="share_button"
              value={content.share_button || ""}
              onChange={(e) => setContent({ ...content, share_button: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="download_button">Download Button Text</Label>
            <Input
              id="download_button"
              value={content.download_button || ""}
              onChange={(e) => setContent({ ...content, download_button: e.target.value })}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
