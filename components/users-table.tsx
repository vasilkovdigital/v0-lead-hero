"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface UserWithStats {
  id: string
  email: string
  role: string
  created_at: string
  form_count: number
  lead_count: number
}

export function UsersTable() {
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      const supabase = createClient()

      // Get all users
      const { data: usersData, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })

      if (error || !usersData) {
        setLoading(false)
        return
      }

      // Get stats for each user
      const usersWithStats = await Promise.all(
        usersData.map(async (user) => {
          const { data: forms } = await supabase.from("forms").select("id, lead_count").eq("owner_id", user.id)

          const formCount = forms?.length || 0
          const leadCount = forms?.reduce((sum, f) => sum + (f.lead_count || 0), 0) || 0

          return {
            ...user,
            form_count: formCount,
            lead_count: leadCount,
          }
        }),
      )

      setUsers(usersWithStats)
      setLoading(false)
    }

    fetchUsers()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Загрузка пользователей...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Пользователи</CardTitle>
        <CardDescription>Все зарегистрированные пользователи и их статистика</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead>Формы</TableHead>
              <TableHead>Лиды</TableHead>
              <TableHead>Дата регистрации</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Пользователей пока нет
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "superadmin" ? "default" : "secondary"}>
                      {user.role === "superadmin" ? "Суперадмин" : "Пользователь"}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.form_count}</TableCell>
                  <TableCell>{user.lead_count}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString("ru-RU")}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
