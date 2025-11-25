"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeadsTable } from "./leads-table"
import { ContentEditor } from "./content-editor"
import { AdminHeader } from "./admin-header"
import { FormsManager } from "./forms-manager"
import { createClient } from "@/lib/supabase/client"

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
        setUserRole(data?.role || "admin")
      }
      setLoading(false)
    }

    fetchUserRole()
  }, [])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  const isSuperAdmin = userRole === "superadmin"

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="container mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">{isSuperAdmin ? "Super Admin Dashboard" : "Admin Dashboard"}</h1>
          <p className="text-muted-foreground">
            {isSuperAdmin ? "Manage the main form and view all leads" : "Manage your forms and leads"}
          </p>
        </div>

        <Tabs defaultValue={isSuperAdmin ? "content" : "forms"} className="space-y-6">
          <TabsList>
            {!isSuperAdmin && <TabsTrigger value="forms">My Forms</TabsTrigger>}
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="content">{isSuperAdmin ? "Main Form Editor" : "Form Content"}</TabsTrigger>
          </TabsList>

          {!isSuperAdmin && (
            <TabsContent value="forms" className="space-y-4">
              <FormsManager />
            </TabsContent>
          )}

          <TabsContent value="leads" className="space-y-4">
            <LeadsTable />
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <ContentEditor formId={isSuperAdmin ? "f5fad560-eea2-443c-98e9-1a66447dae86" : undefined} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
