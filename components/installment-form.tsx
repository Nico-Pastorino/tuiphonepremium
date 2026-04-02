"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { InstallmentPlan } from "@/contexts/AdminContext"
import { toNumericInputValue, toRequiredNumber, type NumericInputValue } from "@/lib/number-input"

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

type InstallmentFormState = {
  months: NumericInputValue
  factor: NumericInputValue
  isActive: boolean
  category: "visa-mastercard" | "naranja"
}

const toFactorValue = (interestRate: number) => Number((1 + interestRate / 100).toFixed(2))
const toInterestRate = (factorValue: NumericInputValue) => Number(((toRequiredNumber(factorValue, 1) - 1) * 100).toFixed(2))

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
  const [data, setData] = useState<InstallmentFormState>(() => ({
    months: plan?.months ?? 3,
    factor: plan ? toFactorValue(plan.interestRate) : 1,
    isActive: plan?.isActive ?? true,
    category: plan?.category ?? category,
  }))

  useEffect(() => {
    if (plan) {
      setData({
        months: plan?.months,
        factor: toFactorValue(plan.interestRate),
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
        onSubmit({
          months: toRequiredNumber(data.months, 1),
          interestRate: toInterestRate(data.factor),
          isActive: data.isActive,
          category: data.category,
        })
      }}
      className="space-y-5"
    >
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Medio de pago</p>
        <p className="mt-1 text-sm font-semibold text-slate-900">{CATEGORY_LABELS[data.category]}</p>
        <p className="mt-1 text-xs text-slate-600">Tipo de plan: cuotas fijas</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Cantidad de pagos</Label>
          <Input
            type="number"
            min={1}
            value={data.months}
            onChange={(event) => setData({ ...data, months: toNumericInputValue(event.target.value) })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Factor / multiplicador</Label>
          <Input
            type="number"
            step="0.1"
            min={1}
            value={data.factor}
            onChange={(event) => setData({ ...data, factor: toNumericInputValue(event.target.value) })}
            required
          />
          <p className="text-xs text-slate-500">1.00 mantiene el precio. 1.15 agrega un 15% sobre el precio base.</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 rounded-2xl border border-slate-200 px-4 py-3">
        <Switch id="isActive" checked={data.isActive} onCheckedChange={(value) => setData({ ...data, isActive: value })} />
        <div>
          <Label htmlFor="isActive">Plan activo</Label>
          <p className="text-xs text-slate-500">Puedes pausarlo sin eliminarlo.</p>
        </div>
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
