"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { InstallmentPlan } from "@/contexts/AdminContext"

const CATEGORY_LABELS: Record<"visa-mastercard" | "naranja", string> = {
  "visa-mastercard": "Visa/Mastercard",
  naranja: "Tarjeta Naranja",
}

export interface InstallmentFormData {
  months: number
  interestRate: number
  isActive: boolean
  category: "visa-mastercard" | "naranja"
}

export function InstallmentForm({
  category,
  plan,
  onSubmit,
  onCancel,
}: {
  category: InstallmentFormData["category"]
  plan?: InstallmentFormData
  onSubmit: (data: InstallmentFormData) => void
  onCancel?: () => void
}) {
  const [data, setData] = useState<InstallmentFormData>(() => ({
    months: plan?.months ?? 3,
    interestRate: plan?.interestRate ?? 0,
    isActive: plan?.isActive ?? true,
    category: plan?.category ?? category,
  }))

  useEffect(() => {
    if (plan) {
      setData({
        months: plan?.months,
        interestRate: plan.interestRate,
        isActive: plan.isActive,
        category: plan.category,
      })
    }
  }, [plan])

  useEffect(() => {
    if (!plan) {
      setData((prev) => ({
        ...prev,
        category,
      }))
    }
  }, [category, plan])

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit({ ...data, category: data.category })
      }}
      className="space-y-4"
    >
      <div>
        <Label>Categoria seleccionada</Label>
        <p className="mt-1 text-sm font-medium text-gray-700">{CATEGORY_LABELS[data.category]}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Cuotas</Label>
          <Input
            type="number"
            min={1}
            value={data.months}
            onChange={(event) => setData({ ...data, months: Number(event.target.value) })}
            required
          />
        </div>
        <div>
          <Label>Interes (%)</Label>
          <Input
            type="number"
            step="0.1"
            value={data.interestRate}
            onChange={(event) => setData({ ...data, interestRate: Number(event.target.value) })}
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="isActive" checked={data.isActive} onCheckedChange={(value) => setData({ ...data, isActive: value })} />
        <Label htmlFor="isActive">Plan activo</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit">{plan ? "Actualizar" : "Crear"}</Button>
      </div>
    </form>
  )
}
