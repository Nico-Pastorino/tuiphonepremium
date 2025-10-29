"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import type { InstallmentPromotion } from "@/types/finance"
import { CalendarRange, Edit, Trash2 } from "lucide-react"

interface InstallmentPromotionCardProps {
  promotion: InstallmentPromotion
  onEdit: (promotion: InstallmentPromotion) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, value: boolean) => void
}

const formatDate = (value: string | null) => {
  if (!value) {
    return null
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }
  return parsed.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function InstallmentPromotionCard({
  promotion,
  onEdit,
  onDelete,
  onToggleActive,
}: InstallmentPromotionCardProps) {
  const startLabel = formatDate(promotion.startDate)
  const endLabel = formatDate(promotion.endDate)
  let rangeLabel = "Disponible todo el tiempo"
  if (startLabel && endLabel) {
    rangeLabel = `Del ${startLabel} al ${endLabel}`
  } else if (startLabel) {
    rangeLabel = `Desde el ${startLabel}`
  } else if (endLabel) {
    rangeLabel = `Hasta el ${endLabel}`
  }

  return (
    <Card className="border-purple-200 bg-purple-50/70">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold text-gray-900">{promotion.name}</CardTitle>
          {promotion.terms.length > 0 ? (
            <div className="space-y-1 text-sm text-purple-700">
              {promotion.terms.map((term) => (
                <p key={term.id}>
                  {term.months} {term.months === 1 ? "cuota" : "cuotas"}
                  {term.interestRate === 0 ? " · sin interes" : " · con interes"}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-xs text-purple-500">No hay combinaciones registradas.</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={promotion.isActive ? "default" : "secondary"}>
            {promotion.isActive ? "Activa" : "En pausa"}
          </Badge>
          <div className="flex items-center gap-2 rounded-full border border-purple-200 bg-white px-3 py-1 text-xs text-purple-700">
            <Switch
              id={`promotion-${promotion.id}-toggle`}
              checked={promotion.isActive}
              onCheckedChange={(value) => onToggleActive(promotion.id, value)}
            />
            <span>{promotion.isActive ? "Activa" : "Inactiva"}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-sm text-purple-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
            <CalendarRange className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-purple-900">Vigencia</p>
            <p>{rangeLabel}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="bg-white" onClick={() => onEdit(promotion)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-red-200 bg-white text-red-600 hover:bg-red-50"
            onClick={() => onDelete(promotion.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
