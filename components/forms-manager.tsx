"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink, Users, Code2, Settings, AlertCircle, Plus, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createUserForm } from "@/app/actions/forms"

interface Form {
  id: string
  name: string
  is_active: boolean
  lead_count: number
  lead_limit: number
  created_at: string
  owner_id: string
}

export function FormsManager() {
  const [form, setForm] = useState<Form | null>(null)
  const [userId, setUserId] = useState<string>("")
  const [userEmail, setUserEmail] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [formName, setFormName] = useState("")

  useEffect(() => {
    fetchUserForm()
  }, [])

  const fetchUserForm = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      setUserId(user.id)
      setUserEmail(user.email || "")

      const { data: existingForm } = await supabase.from("forms").select("*").eq("owner_id", user.id).single()

      if (existingForm) {
        setForm(existingForm)
        setFormName(existingForm.name)
      }
    }
    setLoading(false)
  }

  const createForm = async () => {
    if (!userId || !userEmail) return

    setCreating(true)
    setError(null)

    const result = await createUserForm(userId, userEmail)

    if (result.error) {
      setError(result.error)
      setCreating(false)
      return
    }

    if (result.form) {
      setForm(result.form)
      setFormName(result.form.name)
    }
    setCreating(false)
  }

  const updateFormName = async () => {
    if (!form) return

    const supabase = createClient()
    const { error } = await supabase.from("forms").update({ name: formName }).eq("id", form.id)

    if (!error) {
      setForm({ ...form, name: formName })
      setShowEditDialog(false)
    }
  }

  const toggleFormActive = async () => {
    if (!form) return

    const supabase = createClient()
    await supabase.from("forms").update({ is_active: !form.is_active }).eq("id", form.id)
    setForm({ ...form, is_active: !form.is_active })
  }

  const copyFormLink = () => {
    if (!form) return
    const link = `${window.location.origin}/form/${form.id}`
    navigator.clipboard.writeText(link)
    alert("Ссылка скопирована!")
  }

  const copyEmbedCode = () => {
    if (!form) return
    const embedCode = `<iframe src="${window.location.origin}/form/${form.id}" width="100%" height="700" frameborder="0" style="border: none; border-radius: 8px;"></iframe>`
    navigator.clipboard.writeText(embedCode)
    alert("Код для встраивания скопирован!")
  }

  if (loading) {
    return <div className="text-center py-12">Загрузка...</div>
  }

  if (!form) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">Форма не найдена</p>
          <p className="text-sm text-muted-foreground mb-6">Создайте форму для сбора лидов</p>
          {error && (
            <Alert variant="destructive" className="mb-4 max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button onClick={createForm} disabled={creating}>
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Создание...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Создать форму
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  const progressPercent = (form.lead_count / form.lead_limit) * 100
  const isLimitReached = form.lead_count >= form.lead_limit

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Моя форма</h2>
        <p className="text-muted-foreground">Управление вашей формой для сбора лидов</p>
      </div>

      {isLimitReached && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Лимит исчерпан</AlertTitle>
          <AlertDescription>
            Вы достигли лимита в {form.lead_limit} лидов. Для увеличения лимита напишите на{" "}
            <a href="mailto:hello@vasilkov.digital" className="underline font-medium">
              hello@vasilkov.digital
            </a>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Лиды</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {form.lead_count} / {form.lead_limit}
            </div>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all ${isLimitReached ? "bg-destructive" : "bg-primary"}`}
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Статус</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={form.is_active ? "default" : "secondary"} className="text-lg px-3 py-1">
              {form.is_active ? "Активна" : "Неактивна"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Создана</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Date(form.created_at).toLocaleDateString("ru-RU")}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{form.name}</CardTitle>
              <CardDescription>ID: {form.id}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
              <Settings className="h-4 w-4 mr-1" />
              Настройки
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={copyFormLink}>
              <Copy className="h-4 w-4 mr-2" />
              Копировать ссылку
            </Button>
            <Button variant="outline" onClick={() => window.open(`/form/${form.id}`, "_blank")}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Открыть форму
            </Button>
            <Button variant="outline" onClick={() => setShowEmbedDialog(true)}>
              <Code2 className="h-4 w-4 mr-2" />
              Код для сайта
            </Button>
            <Button variant="secondary" onClick={toggleFormActive}>
              {form.is_active ? "Деактивировать" : "Активировать"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Embed Dialog */}
      <Dialog open={showEmbedDialog} onOpenChange={setShowEmbedDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Встроить форму на сайт</DialogTitle>
            <DialogDescription>Скопируйте этот код и вставьте на ваш сайт</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              readOnly
              value={`<iframe src="${window.location.origin}/form/${form.id}" width="100%" height="700" frameborder="0" style="border: none; border-radius: 8px;"></iframe>`}
              className="font-mono text-xs"
              rows={4}
            />
            <div className="flex gap-2">
              <Button onClick={copyEmbedCode} className="flex-1">
                <Copy className="h-4 w-4 mr-2" />
                Копировать код
              </Button>
              <Button variant="outline" onClick={() => setShowEmbedDialog(false)}>
                Закрыть
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Настройки формы</DialogTitle>
            <DialogDescription>Измените название вашей формы</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="formName">Название формы</Label>
              <Input id="formName" value={formName} onChange={(e) => setFormName(e.target.value)} className="mt-2" />
            </div>
            <div className="flex gap-2">
              <Button onClick={updateFormName} className="flex-1">
                Сохранить
              </Button>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
