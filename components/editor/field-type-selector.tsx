/**
 * FieldTypeSelector - Диалог выбора типа поля
 * Отображает 6 типов полей: текст, ссылка, выпадающий список, множ. выбор, чек-бокс, изображение
 */
"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Type, Link, List, ListChecks, CheckSquare, Image } from "lucide-react"
import type { FieldType } from "@/app/actions/form-fields"

interface FieldTypeSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (type: FieldType) => void
}

const FIELD_TYPES: { type: FieldType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    type: "text",
    label: "Текст",
    icon: <Type className="h-5 w-5" />,
    description: "Однострочное текстовое поле",
  },
  {
    type: "url",
    label: "Ссылка",
    icon: <Link className="h-5 w-5" />,
    description: "Поле для ввода URL",
  },
  {
    type: "select",
    label: "Выпадающий список (один выбор)",
    icon: <List className="h-5 w-5" />,
    description: "Выбор одного значения из списка",
  },
  {
    type: "multiselect",
    label: "Выпадающий список (множ. выбор)",
    icon: <ListChecks className="h-5 w-5" />,
    description: "Выбор нескольких значений из списка",
  },
  {
    type: "checkbox",
    label: "Чек-бокс с текстом",
    icon: <CheckSquare className="h-5 w-5" />,
    description: "Галочка с текстовой подписью",
  },
  {
    type: "image",
    label: "Изображение (jpeg, png)",
    icon: <Image className="h-5 w-5" />,
    description: "Загрузка изображения",
  },
]

export function FieldTypeSelector({ open, onOpenChange, onSelect }: FieldTypeSelectorProps) {
  const handleSelect = (type: FieldType) => {
    onSelect(type)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Выберите тип поля:</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 pt-4">
          {FIELD_TYPES.map((fieldType) => (
            <Button
              key={fieldType.type}
              variant="ghost"
              className="w-full justify-start h-auto py-3 px-4 hover:bg-accent"
              onClick={() => handleSelect(fieldType.type)}
            >
              <div className="flex items-center gap-3">
                <div className="text-muted-foreground">{fieldType.icon}</div>
                <div className="text-left">
                  <div className="font-medium">{fieldType.label}</div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { FIELD_TYPES }
