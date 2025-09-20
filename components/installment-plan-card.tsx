"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { InstallmentPlan } from "@/contexts/AdminContext"
import { Edit, Trash2 } from "lucide-react"

const CATEGORY_META: Record<InstallmentPlan["category"], { label: string; bg: string; border: string; accent: string }> = {
  "visa-mastercard": {
    label: "Visa/Mastercard",
    bg: "bg-blue-50",
    border: "border-blue-200",
    accent: "text-blue-600",
  },
  naranja: {
    label: "Tarjeta Naranja",
    bg: "bg-orange-50",
    border: "border-orange-200",
    accent: "text-orange-600",
  },
}

export function InstallmentPlanCard({
  plan,
  onEdit,
  onDelete,
}: {
  plan: InstallmentPlan
  onEdit: (plan: InstallmentPlan) => void
  onDelete: (id: string) => void
}) {
  const meta = CATEGORY_META[plan.category]
  const installmentLabel = `${plan.months} ${plan.months === 1 ? "cuota" : "cuotas"}`

  return (
    <Card className={`${meta.bg} ${meta.border}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900">{meta.label}</CardTitle>
          <Badge variant={plan.isActive ? "default" : "secondary"}>{plan.isActive ? "Activo" : "Inactivo"}</Badge>
        </div>
        <p className={`${meta.accent} text-sm font-medium`}>
          {installmentLabel} - {plan.interestRate}% interes
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
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

