"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toNumericInputValue, toRequiredNumber, type NumericInputValue } from "@/lib/number-input"

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

type InstallmentPromotionFormTermState = {
  id?: string
  months: NumericInputValue
  interestRateInput: string
}

const createEmptyTerm = (): InstallmentPromotionFormTermState => ({
  months: 6,
  interestRateInput: "0",
})

const formatInterestRateInput = (interestRate: number) => String(Number(interestRate.toFixed(2)))
const parseInterestRateInput = (value: string) => {
  const normalized = value.replace("%", "").replace(",", ".").trim()
  if (normalized === "") {
    return 0
  }

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

export function InstallmentPromotionForm({ promotion, onSubmit, onCancel }: InstallmentPromotionFormProps) {
  const [data, setData] = useState<Omit<InstallmentPromotionFormData, "terms">>(() => ({
    name: promotion?.name ?? "",
    startDate: promotion?.startDate ?? null,
    endDate: promotion?.endDate ?? null,
    isActive: promotion?.isActive ?? true,
  }))
  const [terms, setTerms] = useState<InstallmentPromotionFormTermState[]>(() => {
    if (promotion?.terms && promotion.terms.length > 0) {
      return promotion.terms.map((term) => ({
        id: term.id,
        months: term.months,
        interestRateInput: formatInterestRateInput(term.interestRate),
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
            interestRateInput: formatInterestRateInput(term.interestRate),
          }))
        : [createEmptyTerm()],
    )
  }, [promotion])

  const isEdit = useMemo(() => Boolean(promotion), [promotion])

  const handleTermChange = (index: number, key: "months", value: NumericInputValue) => {
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
      className="flex max-h-[calc(92vh-7rem)] min-h-0 flex-col gap-5 overflow-hidden"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit({
          ...data,
          terms: terms.map((term) => ({
            id: term.id,
            months: toRequiredNumber(term.months, 1),
            interestRate: parseInterestRateInput(term.interestRateInput),
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
        <p className="text-xs text-slate-500">Usa un nombre simple, por ejemplo: Visa Banco Nacion o Amex.</p>
      </div>

      <div className="flex min-h-0 flex-col space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Label className="text-sm font-semibold text-gray-700">Opciones de pago</Label>
            <p className="mt-1 text-xs text-slate-500">Carga las variantes disponibles para este medio.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleAddTerm} className="w-full sm:w-auto">
            Agregar plan
          </Button>
        </div>
        <div className="min-h-0 max-h-[min(38vh,22rem)] space-y-3 overflow-y-auto pr-1">
          {terms.map((term, index) => (
            <div
              key={term.id ?? `term-${index}`}
              className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[minmax(0,1fr),minmax(0,1fr),auto]"
            >
              <div className="space-y-2">
                <Label>Pagos</Label>
                <Input
                  type="number"
                  min={1}
                  value={term.months}
                  onChange={(event) => handleTermChange(index, "months", toNumericInputValue(event.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Porcentaje (%)</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={term.interestRateInput}
                  onChange={(event) =>
                    setTerms((prev) =>
                      prev.map((termItem, termIndex) =>
                        termIndex === index
                          ? {
                              ...termItem,
                              interestRateInput: event.target.value,
                            }
                          : termItem,
                      ),
                    )
                  }
                  placeholder="Ej: 55%"
                  required
                />
                <p className="text-xs text-slate-500">Puedes escribir `55` o `55%`.</p>
              </div>
              <div className="flex items-end justify-end md:justify-start">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-red-600 hover:text-red-700 md:w-auto"
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

      <div className="mt-auto flex justify-end gap-2 border-t border-slate-200 bg-white pt-4">
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
