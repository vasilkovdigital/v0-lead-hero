"use client"

import { useEffect, useState } from "react"
import { getAllUsers } from "@/app/actions/users"
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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      const result = await getAllUsers()

      if ("error" in result) {
        setError(result.error)
        setLoading(false)
        return
      }

      setUsers(result.users)
      setLoading(false)
    }

    fetchUsers()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Загрузка пользователей...</div>
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Пользователи</CardTitle>
          <CardDescription>Все зарегистрированные пользователи и их статистика</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-xl sm:text-2xl">Пользователи</CardTitle>
        <CardDescription className="text-sm">Все зарегистрированные пользователи и их статистика</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Email</TableHead>
                <TableHead className="min-w-[100px]">Роль</TableHead>
                <TableHead className="min-w-[80px]">Формы</TableHead>
                <TableHead className="min-w-[80px]">Лиды</TableHead>
                <TableHead className="min-w-[120px]">Дата регистрации</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Пользователей пока нет
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-xs sm:text-sm max-w-[150px] truncate">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "superadmin" ? "default" : user.role === "admin" ? "secondary" : "outline"} className="text-xs">
                        {user.role === "superadmin" ? "Суперадмин" : user.role === "admin" ? "Админ" : "Пользователь"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">{user.form_count}</TableCell>
                    <TableCell className="text-xs sm:text-sm">{user.lead_count}</TableCell>
                    <TableCell className="text-xs sm:text-sm">{new Date(user.created_at).toLocaleDateString("ru-RU")}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
