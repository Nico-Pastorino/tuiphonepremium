"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

export interface InstallmentFormData {
  name: string
  months: number
  interestRate: number
  minAmount: number
  maxAmount: number
  description: string
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
  const [data, setData] = useState<InstallmentFormData>(
    plan ?? {
      name: "",
      months: 3,
      interestRate: 0,
      minAmount: 0,
      maxAmount: 1000000,
      description: "",
      isActive: true,
      category,
    },
  )

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(data)
      }}
      className="space-y-4"
    >
      <div>
        <Label>Nombre</Label>
        <Input value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Cuotas</Label>
          <Input
            type="number"
            value={data.months}
            min={1}
            onChange={(e) => setData({ ...data, months: Number(e.target.value) })}
            required
          />
        </div>
        <div>
          <Label>Interés (%)</Label>
          <Input
            type="number"
            step="0.1"
            value={data.interestRate}
            onChange={(e) => setData({ ...data, interestRate: Number(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Monto mínimo</Label>
          <Input
            type="number"
            value={data.minAmount}
            onChange={(e) => setData({ ...data, minAmount: Number(e.target.value) })}
            required
          />
        </div>
        <div>
          <Label>Monto máximo</Label>
          <Input
            type="number"
            value={data.maxAmount}
            onChange={(e) => setData({ ...data, maxAmount: Number(e.target.value) })}
            required
          />
        </div>
      </div>

      <div>
        <Label>Descripción</Label>
        <Textarea
          rows={2}
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="isActive" checked={data.isActive} onCheckedChange={(v) => setData({ ...data, isActive: v })} />
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
