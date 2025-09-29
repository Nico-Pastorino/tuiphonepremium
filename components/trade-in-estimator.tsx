"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeftRight, AlertCircle, MessageCircle } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAdmin } from "@/contexts/AdminContext"
import type { TradeInConditionId, TradeInStorageId } from "@/types/trade-in"

interface TradeInEstimatorProps {
  productName: string
  productPriceARS: number
  productPriceUSD: number | null
}

export function TradeInEstimator({ productName, productPriceARS, productPriceUSD }: TradeInEstimatorProps) {
  const { tradeInConfig, getEffectiveDollarRate, homeConfig } = useAdmin()
  const effectiveDollarRate = getEffectiveDollarRate()

  const tradeInConditionLabels: Record<TradeInConditionId, string> = {
    under90: "-90%",
    over90: "90+",
  }

  const tradeInOptions = useMemo(() => {
    return tradeInConfig.sections.flatMap((section) =>
      section.rows
        .filter((row) =>
          section.storageColumns.some((column) => {
            const values = row.values[column.id]
            return values.under90 !== null || values.over90 !== null
          }),
        )
        .map((row) => ({
          value: `${section.id}::${row.id}`,
          label: `${section.title} · ${row.label}`,
          sectionId: section.id,
          rowId: row.id,
        })),
    )
  }, [tradeInConfig.sections])

  const [selectedModelKey, setSelectedModelKey] = useState(() => tradeInOptions[0]?.value ?? "")

  useEffect(() => {
    if (tradeInOptions.length === 0) {
      setSelectedModelKey("")
      return
    }
    setSelectedModelKey((previous) =>
      tradeInOptions.some((option) => option.value === previous) ? previous : tradeInOptions[0].value,
    )
  }, [tradeInOptions])

  const selectedOption = useMemo(
    () => tradeInOptions.find((option) => option.value === selectedModelKey) ?? null,
    [tradeInOptions, selectedModelKey],
  )

  const selectedSection = useMemo(
    () => tradeInConfig.sections.find((section) => section.id === selectedOption?.sectionId) ?? null,
    [tradeInConfig.sections, selectedOption],
  )

  const selectedRow = useMemo(
    () => selectedSection?.rows.find((row) => row.id === selectedOption?.rowId) ?? null,
    [selectedSection, selectedOption],
  )

  const availableStorageOptions = useMemo(() => {
    if (!selectedSection || !selectedRow) {
      return [] as { id: TradeInStorageId; label: string }[]
    }
    return selectedSection.storageColumns
      .filter((column) => {
        const values = selectedRow.values[column.id]
        return values.under90 !== null || values.over90 !== null
      })
      .map((column) => ({ id: column.id, label: column.label }))
  }, [selectedSection, selectedRow])

  const [selectedStorageId, setSelectedStorageId] = useState<TradeInStorageId | null>(
    () => availableStorageOptions[0]?.id ?? null,
  )

  useEffect(() => {
    if (availableStorageOptions.length === 0) {
      setSelectedStorageId(null)
      return
    }
    setSelectedStorageId((previous) =>
      previous && availableStorageOptions.some((option) => option.id === previous)
        ? previous
        : availableStorageOptions[0].id,
    )
  }, [availableStorageOptions])

  const [selectedCondition, setSelectedCondition] = useState<TradeInConditionId>("over90")

  const tradeInValueUSD =
    selectedRow && selectedStorageId ? selectedRow.values[selectedStorageId][selectedCondition] : null

  const tradeInValueARS = tradeInValueUSD !== null && effectiveDollarRate
    ? Math.round(tradeInValueUSD * effectiveDollarRate)
    : null

  const finalPriceARS = tradeInValueARS !== null ? Math.max(productPriceARS - tradeInValueARS, 0) : productPriceARS
  const finalPriceUSD =
    tradeInValueUSD !== null && productPriceUSD !== null
      ? Math.max(productPriceUSD - tradeInValueUSD, 0)
      : productPriceUSD

  const canEstimate = tradeInOptions.length > 0

  if (!canEstimate) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6 flex items-center gap-3 text-sm text-gray-600">
          <AlertCircle className="w-5 h-5 text-gray-500" />
          <span>Pronto compartiremos los valores de canje para este modelo.</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-blue-200 shadow-md">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-blue-500">Plan canje</p>
            <h2 className="text-lg font-semibold text-gray-900">
              Calculá cuánto pagás por {productName} entregando tu usado
            </h2>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Modelo a entregar</label>
            <Select value={selectedModelKey} onValueChange={setSelectedModelKey}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Elegí tu modelo" />
              </SelectTrigger>
              <SelectContent>
                {tradeInOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Capacidad</label>
            <Select
              value={selectedStorageId ?? ""}
              onValueChange={(value) => setSelectedStorageId(value as TradeInStorageId)}
              disabled={availableStorageOptions.length === 0}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Seleccioná la capacidad" />
              </SelectTrigger>
              <SelectContent>
                {availableStorageOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Condición de batería</label>
            <Select
              value={selectedCondition}
              onValueChange={(value) => setSelectedCondition(value as TradeInConditionId)}
              disabled={!selectedStorageId}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Seleccioná la condición" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(tradeInConditionLabels).map(([conditionId, label]) => (
                  <SelectItem key={conditionId} value={conditionId}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-2xl bg-blue-50 border border-blue-100 p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-widest text-blue-500">Valor estimado de tu usado</p>
              <p className="text-xl font-semibold text-blue-700">
                {tradeInValueUSD !== null ? `USD ${tradeInValueUSD.toLocaleString('es-AR')}` : 'Sin estimación'}
              </p>
              {tradeInValueARS !== null && (
                <p className="text-sm text-blue-600">
                  Aproximadamente ${tradeInValueARS.toLocaleString('es-AR')} ARS
                </p>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-blue-500 text-right">Pagás por el iPhone</p>
              <p className="text-xl font-semibold text-blue-700 text-right">
                {finalPriceUSD !== null ? `USD ${finalPriceUSD.toLocaleString('es-AR')}` : 'Consulta'}
              </p>
              {finalPriceARS !== null && (
                <p className="text-sm text-blue-600 text-right">
                  ${finalPriceARS.toLocaleString('es-AR')} ARS
                </p>
              )}
            </div>
          </div>
          <p className="text-xs text-blue-600 leading-relaxed">
            Los montos son estimativos y pueden ajustarse luego de revisar el equipo. Cotizamos únicamente modelos Apple con condiciones similares a las aquí listadas.
          </p>
        </div>

        <Button
          className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-300"
          asChild
        >
          <a
            href={homeConfig.whatsappNumber ? `https://wa.me/${homeConfig.whatsappNumber}` : "https://wa.me/5491112345678"}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Quiero entregar mi usado
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
