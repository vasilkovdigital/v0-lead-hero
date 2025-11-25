"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeadsTable } from "./leads-table"
import { ContentEditor } from "./content-editor"
import { AdminHeader } from "./admin-header"
import { FormsManager } from "./forms-manager"
import { UsersTable } from "./users-table"
import { createClient } from "@/lib/supabase/client"

const MAIN_FORM_ID = "f5fad560-eea2-443c-98e9-1a66447dae86"

export function AdminDashboard() {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserRole = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase.from("users").select("role").eq("id", user.id).single()
        setUserRole(data?.role || "user")
      }
      setLoading(false)
    }

    fetchUserRole()
  }, [])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Загрузка...</div>
  }

  const isSuperAdmin = userRole === "superadmin"

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="container mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">{isSuperAdmin ? "Панель суперадмина" : "Панель управления"}</h1>
          <p className="text-muted-foreground">
            {isSuperAdmin
              ? "Управление главной формой и просмотр всех пользователей"
              : "Управление вашей формой и лидами"}
          </p>
        </div>

        <Tabs defaultValue={isSuperAdmin ? "content" : "form"} className="space-y-6">
          <TabsList>
            {isSuperAdmin ? (
              <>
                <TabsTrigger value="content">Главная форма</TabsTrigger>
                <TabsTrigger value="leads">Лиды</TabsTrigger>
                <TabsTrigger value="users">Пользователи</TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="form">Моя форма</TabsTrigger>
                <TabsTrigger value="leads">Лиды</TabsTrigger>
                <TabsTrigger value="content">Контент</TabsTrigger>
              </>
            )}
          </TabsList>

          {isSuperAdmin ? (
            <>
              <TabsContent value="content" className="space-y-4">
                <ContentEditor formId={MAIN_FORM_ID} />
              </TabsContent>
              <TabsContent value="leads" className="space-y-4">
                <LeadsTable formId={MAIN_FORM_ID} />
              </TabsContent>
              <TabsContent value="users" className="space-y-4">
                <UsersTable />
              </TabsContent>
            </>
          ) : (
            <>
              <TabsContent value="form" className="space-y-4">
                <FormsManager />
              </TabsContent>
              <TabsContent value="leads" className="space-y-4">
                <LeadsTable />
              </TabsContent>
              <TabsContent value="content" className="space-y-4">
                <ContentEditor />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  )
}
