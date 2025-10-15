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

const STORAGE_LABELS: Record<TradeInStorageId, string> = {
  "64gb": "64GB",
  "128gb": "128GB",
  "256gb": "256GB",
  "512gb": "512GB",
}

const hasAnyTradeInValue = (values: Record<TradeInConditionId, number | null>): boolean =>
  Object.values(values).some((value) => value !== null)

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
        .filter((row) => Object.values(row.values).some((storageValues) => hasAnyTradeInValue(storageValues)))
        .map((row) => ({
          value: `${section.id}::${row.id}`,
          label: `${section.title} - ${row.label}`,
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
    if (!selectedRow) {
      return [] as { id: TradeInStorageId; label: string }[]
    }

    return (Object.entries(selectedRow.values) as [TradeInStorageId, Record<TradeInConditionId, number | null>][]).filter(
      ([, conditionValues]) => hasAnyTradeInValue(conditionValues),
    ).map(([storageId]) => {
      const labelFromSection =
        selectedSection?.storageColumns.find((column) => column.id === storageId)?.label || STORAGE_LABELS[storageId]
      return {
        id: storageId,
        label: labelFromSection ?? storageId.toUpperCase(),
      }
    })
  }, [selectedRow, selectedSection])

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

  const tradeInValueARS =
    tradeInValueUSD !== null && effectiveDollarRate ? Math.round(tradeInValueUSD * effectiveDollarRate) : null

  const finalPriceARS = tradeInValueARS !== null ? Math.max(productPriceARS - tradeInValueARS, 0) : productPriceARS
  const finalPriceUSD =
    tradeInValueUSD !== null && productPriceUSD !== null
      ? Math.max(productPriceUSD - tradeInValueUSD, 0)
      : productPriceUSD

  const canEstimate = tradeInOptions.length > 0

  if (!canEstimate) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="flex items-center gap-3 p-6 text-sm text-gray-600">
          <AlertCircle className="h-5 w-5 text-gray-500" />
          <span>Pronto compartiremos los valores de canje para este modelo.</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-blue-200 shadow-md">
      <CardContent className="space-y-5 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <ArrowLeftRight className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-blue-500">Plan canje</p>
            <h2 className="text-lg font-semibold text-gray-900">
              Calcula cuanto pagas por {productName} entregando tu usado
            </h2>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Modelo a entregar</label>
            <Select value={selectedModelKey} onValueChange={setSelectedModelKey}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Elegi tu modelo" />
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
                <SelectValue placeholder="Selecciona la capacidad" />
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
            <label className="text-sm font-medium text-gray-700">Condicion de bateria</label>
            <Select
              value={selectedCondition}
              onValueChange={(value) => setSelectedCondition(value as TradeInConditionId)}
              disabled={!selectedStorageId}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecciona la condicion" />
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

        <div className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-widest text-blue-500">Valor estimado de tu usado</p>
              <p className="text-xl font-semibold text-blue-700">
                {tradeInValueUSD !== null ? `USD ${tradeInValueUSD.toLocaleString("es-AR")}` : "Sin estimacion"}
              </p>
              {tradeInValueARS !== null && (
                <p className="text-sm text-blue-600">
                  Aproximadamente ${tradeInValueARS.toLocaleString("es-AR")} ARS
                </p>
              )}
            </div>
            <div>
              <p className="text-right text-xs uppercase tracking-widest text-blue-500">Pagas por el iPhone</p>
              <p className="text-right text-xl font-semibold text-blue-700">
                {finalPriceUSD !== null ? `USD ${finalPriceUSD.toLocaleString("es-AR")}` : "Consulta"}
              </p>
              {finalPriceARS !== null && (
                <p className="text-right text-sm text-blue-600">
                  ${finalPriceARS.toLocaleString("es-AR")} ARS
                </p>
              )}
            </div>
          </div>
          <p className="text-xs leading-relaxed text-blue-600">
            Los montos son estimativos y pueden ajustarse luego de revisar el equipo. Cotizamos unicamente modelos Apple
            con condiciones similares a las aqui listadas.
          </p>
        </div>

        <Button
          className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-3 font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-purple-700 sm:w-auto"
          asChild
        >
          <a
            href={homeConfig.whatsappNumber ? `https://wa.me/${homeConfig.whatsappNumber}` : "https://wa.me/5491112345678"}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Quiero entregar mi usado
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
