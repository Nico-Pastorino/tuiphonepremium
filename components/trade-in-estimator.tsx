"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeftRight, AlertCircle, MessageCircle } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAdmin } from "@/contexts/AdminContext"
import type { TradeInConditionId, TradeInStorageId, TradeInRow } from "@/types/trade-in"

interface TradeInEstimatorProps {
  productName: string
  productPriceARS: number
  productPriceUSD: number | null
}

type DisplayColumn = {
  id: string
  label: string
  conditions: Array<{ id: TradeInConditionId; label: string }>
}

type DisplayRow = {
  optionValue: string
  data: TradeInRow
}

type DisplaySection = {
  id: string
  title: string
  description?: string
  storageColumns: DisplayColumn[]
  rows: DisplayRow[]
}

const STORAGE_LABELS: Record<TradeInStorageId, string> = {
  "64gb": "64GB",
  "128gb": "128GB",
  "256gb": "256GB",
  "512gb": "512GB",
}

const CONDITION_ORDER: TradeInConditionId[] = ["under90", "over90"]

const CONDITION_LABELS: Record<TradeInConditionId, string> = {
  under90: "-90%",
  over90: "90+",
}

const hasAnyTradeInValue = (values: Record<TradeInConditionId, number | null>): boolean =>
  Object.values(values).some((value) => value !== null)

export function TradeInEstimator({ productName, productPriceARS, productPriceUSD }: TradeInEstimatorProps) {
  const { tradeInConfig, getEffectiveDollarRate, homeConfig } = useAdmin()
  const effectiveDollarRate = getEffectiveDollarRate()

  const sectionsForDisplay = useMemo<DisplaySection[]>(() => {
    return tradeInConfig.sections
      .map<DisplaySection | null>((section) => {
        const rowsWithValues = section.rows.filter((row) =>
          Object.values(row.values).some((storageValues) => hasAnyTradeInValue(storageValues)),
        )

        if (rowsWithValues.length === 0) {
          return null
        }

        const baseColumns: DisplayColumn[] = section.storageColumns.map((column) => ({
          id: column.id,
          label: column.label,
          conditions: column.conditions.map((condition) => ({
            id: condition.id as TradeInConditionId,
            label: CONDITION_LABELS[condition.id as TradeInConditionId] ?? condition.label,
          })),
        }))

        const definedIds = new Set(baseColumns.map((column) => column.id))

        const extraIds = Array.from(
          new Set(
            rowsWithValues.flatMap((row) =>
              Object.entries(row.values)
                .filter(([storageId, values]) => hasAnyTradeInValue(values) && !definedIds.has(storageId))
                .map(([storageId]) => storageId),
            ),
          ),
        )

        const extraColumns: DisplayColumn[] = extraIds.map((storageId) => ({
          id: storageId,
          label: STORAGE_LABELS[storageId as TradeInStorageId] ?? storageId.toUpperCase(),
          conditions: CONDITION_ORDER.map((conditionId) => ({
            id: conditionId,
            label: CONDITION_LABELS[conditionId],
          })),
        }))

        return {
          id: section.id,
          title: section.title,
          description: section.description,
          storageColumns: [...baseColumns, ...extraColumns],
          rows: rowsWithValues.map((row) => ({
            optionValue: `${section.id}::${row.id}`,
            data: row,
          })),
        }
      })
      .filter((section): section is DisplaySection => section !== null)
  }, [tradeInConfig.sections])

  const tradeInOptions = useMemo(
    () =>
      sectionsForDisplay.flatMap((section) =>
        section.rows.map((row) => ({
          value: row.optionValue,
          label: `${section.title} - ${row.data.label}`,
          sectionId: section.id,
          rowId: row.data.id,
        })),
      ),
    [sectionsForDisplay],
  )

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

  const selectedSection = useMemo(() => {
    return (
      sectionsForDisplay.find((section) => section.rows.some((row) => row.optionValue === selectedModelKey)) ?? null
    )
  }, [sectionsForDisplay, selectedModelKey])

  const selectedRow = useMemo(() => {
    if (!selectedSection) {
      return null
    }
    return selectedSection.rows.find((row) => row.optionValue === selectedModelKey) ?? null
  }, [selectedSection, selectedModelKey])

  const availableStorageOptions = useMemo(() => {
    if (!selectedRow) {
      return [] as Array<{ id: string; label: string }>
    }

    const options: Array<{ id: string; label: string }> = []
    const taken = new Set<string>()

    if (selectedSection) {
      for (const column of selectedSection.storageColumns) {
        const valueSet = selectedRow.data.values[column.id as TradeInStorageId]
        if (valueSet && hasAnyTradeInValue(valueSet)) {
          options.push({ id: column.id, label: column.label })
          taken.add(column.id)
        }
      }
    }

    for (const [storageId, values] of Object.entries(selectedRow.data.values) as [
      string,
      Record<TradeInConditionId, number | null>,
    ][]) {
      if (!taken.has(storageId) && hasAnyTradeInValue(values)) {
        options.push({
          id: storageId,
          label: STORAGE_LABELS[storageId as TradeInStorageId] ?? storageId.toUpperCase(),
        })
      }
    }

    return options
  }, [selectedRow, selectedSection])

  const [selectedStorageId, setSelectedStorageId] = useState<string | null>(
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
    selectedRow && selectedStorageId
      ? selectedRow.data.values[selectedStorageId as TradeInStorageId]?.[selectedCondition] ?? null
      : null

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
      <CardContent className="space-y-6 p-6">
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
                {sectionsForDisplay.map((section) => (
                  <SelectGroup key={section.id}>
                    <SelectLabel className="text-xs uppercase tracking-wide text-gray-500">{section.title}</SelectLabel>
                    {section.rows.map((row) => (
                      <SelectItem key={row.optionValue} value={row.optionValue}>
                        {row.data.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Capacidad</label>
            <Select
              value={selectedStorageId ?? ""}
              onValueChange={(value) => setSelectedStorageId(value)}
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
                {CONDITION_ORDER.map((conditionId) => (
                  <SelectItem key={conditionId} value={conditionId}>
                    {CONDITION_LABELS[conditionId]}
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

        <div className="space-y-4 rounded-2xl border border-blue-100 bg-white/80 p-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Modelos disponibles para canje</h3>
            <p className="text-xs text-gray-600">
              Consulta la tabla completa de valores estimados por capacidad y estado.
            </p>
          </div>

          <div className="space-y-6">
            {sectionsForDisplay.map((section) => (
              <div key={section.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-4 py-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{section.title}</h4>
                    {section.description && <p className="text-xs text-gray-500">{section.description}</p>}
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wide text-blue-600">
                    Valores referenciales en USD
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs text-gray-700">
                    <thead>
                      <tr className="bg-blue-100/60 text-blue-900">
                        <th rowSpan={2} className="border border-blue-100 px-3 py-2 text-left font-semibold">
                          Modelo
                        </th>
                        {section.storageColumns.map((column) => (
                          <th key={column.id} colSpan={column.conditions.length} className="border border-blue-100 px-3 py-2">
                            {column.label}
                          </th>
                        ))}
                      </tr>
                      <tr className="bg-blue-50 text-blue-800">
                        {section.storageColumns.flatMap((column) =>
                          column.conditions.map((condition) => (
                            <th key={`${column.id}-${condition.id}`} className="border border-blue-100 px-2 py-2 font-medium">
                              {condition.label}
                            </th>
                          )),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {section.rows.map((row) => (
                        <tr key={row.data.id} className="odd:bg-white even:bg-blue-50/30">
                          <td className="border border-blue-100 px-3 py-2 font-medium text-gray-900">{row.data.label}</td>
                          {section.storageColumns.flatMap((column) => {
                            const storageValues =
                              row.data.values[column.id as TradeInStorageId] as
                                | Record<TradeInConditionId, number | null>
                                | undefined
                            return column.conditions.map((condition) => {
                              const value = storageValues?.[condition.id] ?? null
                              const valueARS =
                                value !== null && effectiveDollarRate ? Math.round(value * effectiveDollarRate) : null
                              const userPaysUSD =
                                value !== null && productPriceUSD !== null ? Math.max(productPriceUSD - value, 0) : null
                              const userPaysARS =
                                value !== null ? Math.max(productPriceARS - (valueARS ?? 0), 0) : productPriceARS

                              return (
                                <td key={`${row.data.id}-${column.id}-${condition.id}`} className="border border-blue-100 px-2 py-2">
                                  {value !== null ? (
                                    <div className="space-y-1 text-xs">
                                      <p className="font-semibold text-gray-900">
                                        USD {value.toLocaleString("es-AR")}
                                      </p>
                                      {valueARS !== null && (
                                        <p className="text-[11px] text-blue-600">
                                          ~ ${valueARS.toLocaleString("es-AR")} ARS
                                        </p>
                                      )}
                                      <p className="text-[11px] text-gray-600">
                                        Pagas:{" "}
                                        {userPaysUSD !== null
                                          ? `USD ${userPaysUSD.toLocaleString("es-AR")}`
                                          : `$${userPaysARS.toLocaleString("es-AR")} ARS`}
                                      </p>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              )
                            })
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
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
