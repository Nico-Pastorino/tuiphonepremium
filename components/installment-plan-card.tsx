"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Trash2 } from "lucide-react"

export function InstallmentPlanCard({
  plan,
  onEdit,
  onDelete,
  onUpdate,
}: {
  plan: any
  onEdit: (p: any) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, d: any) => void
}) {
  const colors =
    plan.category === "naranja"
      ? {
          bg: "bg-orange-50",
          border: "border-orange-200",
          accent: "text-orange-600",
        }
      : {
          bg: "bg-blue-50",
          border: "border-blue-200",
          accent: "text-blue-600",
        }

  return (
    <Card className={`${colors.bg} ${colors.border}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{plan.name}</CardTitle>
          <Badge variant={plan.isActive ? "default" : "secondary"}>{plan.isActive ? "Activo" : "Inactivo"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className={`${colors.accent} font-bold text-xl`}>
          {plan.months} cuotas • {plan.interestRate}% interés
        </p>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => onEdit(plan)}>
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
          <Button variant="outline" size="sm" className="text-red-600 bg-transparent" onClick={() => onDelete(plan.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
