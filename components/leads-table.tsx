"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Download } from "lucide-react"
import { Card } from "@/components/ui/card"

interface Lead {
  id: string
  url: string
  email: string
  result_text: string | null
  result_image_url: string | null
  status: string
  created_at: string
  form_id: string | null
}

interface LeadsTableProps {
  formId?: string
}

export function LeadsTable({ formId: propFormId }: LeadsTableProps) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLeads()
  }, [propFormId])

  const fetchLeads = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    let query = supabase.from("leads").select("*").order("created_at", { ascending: false })

    if (propFormId) {
      // Superadmin viewing specific form
      query = query.eq("form_id", propFormId)
    } else {
      // Regular user - get their form's leads
      const { data: userForm } = await supabase.from("forms").select("id").eq("owner_id", user.id).single()

      if (userForm) {
        query = query.eq("form_id", userForm.id)
      }
    }

    const { data, error } = await query

    if (!error && data) {
      setLeads(data)
    }
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить этот лид?")) return

    const supabase = createClient()
    const { error } = await supabase.from("leads").delete().eq("id", id)

    if (!error) {
      setLeads(leads.filter((lead) => lead.id !== id))
    }
  }

  const handleExport = () => {
    const csv = [
      ["URL", "Email", "Статус", "Дата", "Результат"],
      ...leads.map((lead) => [
        lead.url,
        lead.email || "",
        lead.status,
        new Date(lead.created_at).toLocaleString("ru-RU"),
        lead.result_text || lead.result_image_url || "",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  if (isLoading) {
    return <div className="text-center py-8">Загрузка лидов...</div>
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Лиды</h2>
          <p className="text-muted-foreground">{leads.length} всего</p>
        </div>
        <Button onClick={handleExport} variant="outline" disabled={leads.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Экспорт CSV
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Результат</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Лидов пока нет
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium max-w-xs truncate">{lead.url}</TableCell>
                  <TableCell>{lead.email || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={lead.status === "completed" ? "default" : "outline"}>
                      {lead.status === "completed" ? "Завершен" : "В обработке"}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {lead.result_image_url ? (
                      <a
                        href={lead.result_image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        Картинка
                      </a>
                    ) : lead.result_text ? (
                      <span className="text-xs">{lead.result_text.substring(0, 50)}...</span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{new Date(lead.created_at).toLocaleDateString("ru-RU")}</TableCell>
                  <TableCell className="text-right">
                    <Button onClick={() => handleDelete(lead.id)} variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
