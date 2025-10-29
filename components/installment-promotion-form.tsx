"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export interface InstallmentPromotionFormTermData {
  id?: string
  months: number
  interestRate: number
}

export interface InstallmentPromotionFormData {
  name: string
  terms: InstallmentPromotionFormTermData[]
  startDate: string | null
  endDate: string | null
  isActive: boolean
}

interface InstallmentPromotionFormProps {
  promotion?: InstallmentPromotionFormData
  onSubmit: (data: InstallmentPromotionFormData) => void
  onCancel?: () => void
}

const formatDateInput = (value: string | null) => {
  if (!value) {
    return ""
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return ""
  }
  const iso = parsed.toISOString()
  return iso.slice(0, 10)
}

const createEmptyTerm = (): InstallmentPromotionFormTermData => ({
  months: 6,
  interestRate: 0,
})

export function InstallmentPromotionForm({ promotion, onSubmit, onCancel }: InstallmentPromotionFormProps) {
  const [data, setData] = useState<Omit<InstallmentPromotionFormData, "terms">>(() => ({
    name: promotion?.name ?? "",
    startDate: promotion?.startDate ?? null,
    endDate: promotion?.endDate ?? null,
    isActive: promotion?.isActive ?? true,
  }))
  const [terms, setTerms] = useState<InstallmentPromotionFormTermData[]>(() => {
    if (promotion?.terms && promotion.terms.length > 0) {
      return promotion.terms.map((term) => ({
        id: term.id,
        months: term.months,
        interestRate: term.interestRate,
      }))
    }
    return [createEmptyTerm()]
  })

  useEffect(() => {
    if (!promotion) {
      return
    }
    setData({
      name: promotion.name,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      isActive: promotion.isActive,
    })
    setTerms(
      promotion.terms.length > 0
        ? promotion.terms.map((term) => ({
            id: term.id,
            months: term.months,
            interestRate: term.interestRate,
          }))
        : [createEmptyTerm()],
    )
  }, [promotion])

  const isEdit = useMemo(() => Boolean(promotion), [promotion])

  const handleTermChange = (index: number, key: "months" | "interestRate", value: number) => {
    setTerms((prev) =>
      prev.map((term, termIndex) =>
        termIndex === index
          ? {
              ...term,
              [key]: value,
            }
          : term,
      ),
    )
  }

  const handleAddTerm = () => {
    setTerms((prev) => [...prev, createEmptyTerm()])
  }

  const handleRemoveTerm = (index: number) => {
    setTerms((prev) => (prev.length > 1 ? prev.filter((_, termIndex) => termIndex !== index) : prev))
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit({
          ...data,
          terms: terms.map((term) => ({
            id: term.id,
            months: Number(term.months),
            interestRate: Number(term.interestRate),
          })),
          startDate: data.startDate ?? null,
          endDate: data.endDate ?? null,
        })
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="promotion-name">Nombre de la promocion</Label>
        <Input
          id="promotion-name"
          value={data.name}
          onChange={(event) => setData((prev) => ({ ...prev, name: event.target.value }))}
          placeholder="Ej: Hot Sale 12 cuotas sin interes"
          required
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold text-gray-700">Combinaciones de cuotas</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddTerm}>
            Agregar opcion
          </Button>
        </div>
        <div className="space-y-3">
          {terms.map((term, index) => (
            <div
              key={term.id ?? `term-${index}`}
              className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:grid-cols-[1fr,1fr,auto]"
            >
              <div className="space-y-2">
                <Label>Cuotas</Label>
                <Input
                  type="number"
                  min={1}
                  value={term.months}
                  onChange={(event) => handleTermChange(index, "months", Number(event.target.value) || 1)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Interes (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={term.interestRate}
                  onChange={(event) =>
                    handleTermChange(index, "interestRate", Number(event.target.value) || 0)
                  }
                  required
                />
              </div>
              <div className="flex items-end justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleRemoveTerm(index)}
                  disabled={terms.length === 1}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="promotion-start">Fecha de inicio</Label>
          <Input
            id="promotion-start"
            type="date"
            value={formatDateInput(data.startDate)}
            onChange={(event) =>
              setData((prev) => ({
                ...prev,
                startDate: event.target.value ? event.target.value : null,
              }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="promotion-end">Fecha de finalizacion</Label>
          <Input
            id="promotion-end"
            type="date"
            value={formatDateInput(data.endDate)}
            onChange={(event) =>
              setData((prev) => ({
                ...prev,
                endDate: event.target.value ? event.target.value : null,
              }))
            }
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-gray-800">Promocion activa</p>
          <p className="text-xs text-gray-500">Puedes activarla o pausarla cuando quieras.</p>
        </div>
        <Switch
          id="promotion-active"
          checked={data.isActive}
          onCheckedChange={(value) => setData((prev) => ({ ...prev, isActive: value }))}
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit">{isEdit ? "Guardar cambios" : "Crear promocion"}</Button>
      </div>
    </form>
  )
}
