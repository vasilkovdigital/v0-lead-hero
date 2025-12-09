/**
 * UsersTable - Компонент для управления пользователями
 * Только для superadmin. Показывает статистику и позволяет управлять квотами.
 * 
 * Использует React Query для кэширования данных
 */
"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { QuotaCounter } from "@/components/quota-counter"
import { cn } from "@/lib/utils"
import { useUsers, useUpdateUserQuotas } from "@/lib/hooks"
import { AlertCircle } from "lucide-react"

export function UsersTable() {
  // React Query хуки
  const { data: users, isLoading, error } = useUsers()
  const updateQuotasMutation = useUpdateUserQuotas()

  const handleQuotaUpdate = async (
    userId: string,
    field: "max_forms" | "max_leads" | "can_publish_forms",
    value: number | null | boolean
  ) => {
    try {
      await updateQuotasMutation.mutateAsync({ userId, field, value })
    } catch (err) {
      console.error("Ошибка обновления квот:", err)
    }
  }

  if (isLoading) {
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
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-lg font-medium mb-2">Ошибка загрузки</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-xl sm:text-2xl">Пользователи</CardTitle>
        <CardDescription className="text-sm">Управление квотами и статистика пользователей</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Email</TableHead>
                <TableHead className="min-w-[100px]">Роль</TableHead>
                <TableHead className="min-w-[80px] text-center">Формы</TableHead>
                <TableHead className="min-w-[150px] text-center">Лимит форм</TableHead>
                <TableHead className="min-w-[180px] text-center">Использование лидов</TableHead>
                <TableHead className="min-w-[100px] text-center">Публикация</TableHead>
                <TableHead className="min-w-[120px]">Регистрация</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!users || users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Пользователей пока нет
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const isUpdating = updateQuotasMutation.isPending && 
                    updateQuotasMutation.variables?.userId === user.id
                  const isSuperAdmin = user.role === "superadmin"
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium text-xs sm:text-sm max-w-[150px] truncate">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.role === "superadmin" ? "default" : user.role === "admin" ? "secondary" : "outline"} 
                          className="text-xs"
                        >
                          {user.role === "superadmin" ? "Суперадмин" : user.role === "admin" ? "Админ" : "Пользователь"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm text-center tabular-nums">
                        {user.form_count}
                      </TableCell>
                      <TableCell className="text-center">
                        {isSuperAdmin ? (
                          <div className="text-center text-muted-foreground text-sm">∞</div>
                        ) : (
                          <div className="flex justify-center">
                            <QuotaCounter
                              value={user.max_forms ?? 0}
                              onChange={(value) => handleQuotaUpdate(user.id, "max_forms", value)}
                              min={0}
                              disabled={isSuperAdmin}
                              loading={isUpdating}
                            />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {isSuperAdmin ? (
                          <div className="text-xs sm:text-sm tabular-nums text-muted-foreground">
                            {user.lead_count} (∞)
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <span
                              className={cn(
                                "text-xs sm:text-sm tabular-nums font-medium",
                                user.max_leads !== null && user.lead_count >= user.max_leads * 0.9
                                  ? "text-destructive"
                                  : user.max_leads !== null && user.lead_count >= user.max_leads * 0.7
                                  ? "text-yellow-500"
                                  : ""
                              )}
                            >
                              {user.lead_count} / {user.max_leads ?? 0}
                            </span>
                            <QuotaCounter
                              value={user.max_leads ?? 0}
                              onChange={(value) => handleQuotaUpdate(user.id, "max_leads", value)}
                              min={0}
                              step={10}
                              disabled={isSuperAdmin}
                              loading={isUpdating}
                              className="ml-2"
                            />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {isSuperAdmin ? (
                          <div className="text-muted-foreground text-sm">✓</div>
                        ) : (
                          <div className="flex justify-center">
                            <Switch
                              checked={user.can_publish_forms}
                              onCheckedChange={(checked) => handleQuotaUpdate(user.id, "can_publish_forms", checked)}
                              disabled={isSuperAdmin || isUpdating}
                            />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {new Date(user.created_at).toLocaleDateString("ru-RU")}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
