"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink, Users, Code2, Trash2, Settings } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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
  const [forms, setForms] = useState<Form[]>([])
  const [userRole, setUserRole] = useState<string>("admin")
  const [userId, setUserId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedForm, setSelectedForm] = useState<Form | null>(null)
  const [formName, setFormName] = useState("")
  const [formLimit, setFormLimit] = useState(20)

  useEffect(() => {
    fetchUserRole()
  }, [])

  const fetchUserRole = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      setUserId(user.id)
      const { data } = await supabase.from("users").select("role").eq("id", user.id).single()

      const role = data?.role || "admin"
      setUserRole(role)
      await fetchForms(user.id, role)
    }
    setLoading(false)
  }

  const fetchForms = async (uid: string, role: string) => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .eq("owner_id", uid)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setForms(data)
    }
  }

  const createNewForm = async () => {
    setIsCreating(true)
    const supabase = createClient()

    const { data: newForm, error } = await supabase
      .from("forms")
      .insert({
        name: `My Form ${forms.length + 1}`,
        owner_id: userId,
        lead_limit: 20,
        is_active: true,
      })
      .select()
      .single()

    if (!error && newForm) {
      const defaultContent = [
        { form_id: newForm.id, key: "page_title", value: "Get Your Personalized Recommendations" },
        { form_id: newForm.id, key: "page_subtitle", value: "Enter your website URL to get started" },
        { form_id: newForm.id, key: "url_placeholder", value: "https://example.com" },
        { form_id: newForm.id, key: "submit_button", value: "Get Recommendations" },
        { form_id: newForm.id, key: "disclaimer", value: "No credit card required • Takes less than 30 seconds" },
        { form_id: newForm.id, key: "loading_message_1", value: "Analyzing your website..." },
        { form_id: newForm.id, key: "loading_message_2", value: "Gathering insights..." },
        { form_id: newForm.id, key: "loading_message_3", value: "Generating recommendations..." },
        { form_id: newForm.id, key: "result_title", value: "Your Recommendations" },
        { form_id: newForm.id, key: "result_blur_text", value: "Enter your email to see the full results" },
        { form_id: newForm.id, key: "email_title", value: "Get Your Results" },
        { form_id: newForm.id, key: "email_subtitle", value: "Enter your email to receive your recommendations" },
        { form_id: newForm.id, key: "email_placeholder", value: "your@email.com" },
        { form_id: newForm.id, key: "email_button", value: "Show Results" },
        { form_id: newForm.id, key: "success_title", value: "Success!" },
        { form_id: newForm.id, key: "success_message", value: "Your recommendations have been sent" },
        { form_id: newForm.id, key: "share_button", value: "Share" },
        { form_id: newForm.id, key: "download_button", value: "Download Results" },
        {
          form_id: newForm.id,
          key: "ai_system_prompt",
          value:
            "You are an expert consultant. Analyze the provided website and generate clear, actionable recommendations.",
        },
        { form_id: newForm.id, key: "ai_result_format", value: "text" },
      ]

      await supabase.from("form_content").insert(defaultContent)
      await fetchForms(userId, userRole)
    }

    setIsCreating(false)
  }

  const deleteForm = async (formId: string) => {
    if (!confirm("Are you sure you want to delete this form? This action cannot be undone.")) return

    const supabase = createClient()

    await supabase.from("form_content").delete().eq("form_id", formId)
    const { error } = await supabase.from("forms").delete().eq("id", formId)

    if (!error) {
      await fetchForms(userId, userRole)
    }
  }

  const updateForm = async () => {
    if (!selectedForm) return

    const supabase = createClient()
    const { error } = await supabase
      .from("forms")
      .update({
        name: formName,
        lead_limit: formLimit,
      })
      .eq("id", selectedForm.id)

    if (!error) {
      await fetchForms(userId, userRole)
      setShowEditDialog(false)
      setSelectedForm(null)
    }
  }

  const toggleFormActive = async (formId: string, currentStatus: boolean) => {
    const supabase = createClient()
    await supabase.from("forms").update({ is_active: !currentStatus }).eq("id", formId)
    await fetchForms(userId, userRole)
  }

  const openEditDialog = (form: Form) => {
    setSelectedForm(form)
    setFormName(form.name)
    setFormLimit(form.lead_limit)
    setShowEditDialog(true)
  }

  const copyFormLink = (formId: string) => {
    const link = `${window.location.origin}/form/${formId}`
    navigator.clipboard.writeText(link)
    alert("Form link copied to clipboard!")
  }

  const openEmbedDialog = (form: Form) => {
    setSelectedForm(form)
    setShowEmbedDialog(true)
  }

  const copyEmbedCode = () => {
    if (!selectedForm) return
    const embedCode = `<iframe src="${window.location.origin}/form/${selectedForm.id}" width="100%" height="700" frameborder="0" style="border: none; border-radius: 8px;"></iframe>`
    navigator.clipboard.writeText(embedCode)
    alert("Embed code copied to clipboard!")
  }

  if (loading) {
    return <div className="text-center py-12">Loading forms...</div>
  }

  const isSuperAdmin = userRole === "superadmin"
  const mainFormId = "f5fad560-eea2-443c-98e9-1a66447dae86"

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Forms</h2>
          <p className="text-muted-foreground">
            {isSuperAdmin ? "Manage the main form" : "Create and manage your forms"}
          </p>
        </div>
        {!isSuperAdmin && (
          <Button onClick={createNewForm} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create New Form"}
          </Button>
        )}
      </div>

      {!isSuperAdmin && forms.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{forms.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{forms.reduce((acc, f) => acc + f.lead_count, 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Forms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{forms.filter((f) => f.is_active).length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {forms.map((form) => {
          const isMainForm = form.id === mainFormId
          const progressPercent = (form.lead_count / form.lead_limit) * 100

          return (
            <Card key={form.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">
                      {form.name}
                      {isMainForm && (
                        <Badge className="ml-2" variant="secondary">
                          Main
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Created {new Date(form.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant={form.is_active ? "default" : "secondary"}>
                    {form.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Leads:</span>
                    <span className="font-medium">
                      {form.lead_count} / {form.lead_limit}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => copyFormLink(form.id)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy Link
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => window.open(`/form/${form.id}`, "_blank")}>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => openEmbedDialog(form)}
                  >
                    <Code2 className="h-3 w-3 mr-1" />
                    Embed Code
                  </Button>

                  {!isMainForm && (
                    <>
                      <Button size="sm" variant="secondary" className="w-full" onClick={() => openEditDialog(form)}>
                        <Settings className="h-3 w-3 mr-1" />
                        Settings
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => toggleFormActive(form.id, form.is_active)}
                      >
                        {form.is_active ? "Deactivate" : "Activate"}
                      </Button>

                      <Button size="sm" variant="destructive" className="w-full" onClick={() => deleteForm(form.id)}>
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {forms.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No forms yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              {isSuperAdmin
                ? "The main form is available for editing in the Content tab"
                : "Click 'Create New Form' to get started"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Embed Code Dialog */}
      <Dialog open={showEmbedDialog} onOpenChange={setShowEmbedDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Embed Form</DialogTitle>
            <DialogDescription>Copy this code and paste it into your website to embed the form</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Embed Code</Label>
              <Textarea
                readOnly
                value={
                  selectedForm
                    ? `<iframe src="${window.location.origin}/form/${selectedForm.id}" width="100%" height="700" frameborder="0" style="border: none; border-radius: 8px;"></iframe>`
                    : ""
                }
                className="font-mono text-xs mt-2"
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={copyEmbedCode} className="flex-1">
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
              <Button variant="outline" onClick={() => setShowEmbedDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Form Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Form Settings</DialogTitle>
            <DialogDescription>Update your form name and lead limit</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="formName">Form Name</Label>
              <Input
                id="formName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="My Form"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="leadLimit">Lead Limit</Label>
              <Input
                id="leadLimit"
                type="number"
                value={formLimit}
                onChange={(e) => setFormLimit(Number.parseInt(e.target.value) || 20)}
                min={1}
                max={1000}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">Maximum number of leads this form can collect</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={updateForm} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
