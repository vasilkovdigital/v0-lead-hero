import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/admin-dashboard"

export default async function AdminPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen px-[10%] md:px-0">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-12 gap-4 py-8">
        <div className="col-span-12">
          <AdminDashboard />
        </div>
      </div>
    </div>
  )
}
