import { type NextRequest, NextResponse } from "next/server"

import { SiteConfigService, SITE_CONFIG_TABLE_NOT_FOUND } from "@/lib/supabase-admin"
import { DEFAULT_DOLLAR_CONFIG, mergeDollarConfig } from "@/lib/finance-config"
import type { DollarConfig } from "@/types/finance"
import type { Json } from "@/types/database"

const DOLLAR_CONFIG_KEY = "dollar"

const isRemoteConfigUnavailable = (error: Error) =>
  error.message === "Admin client not configured" || error.message === SITE_CONFIG_TABLE_NOT_FOUND

const buildErrorResponse = (message: string, status = 500) => NextResponse.json({ error: message }, { status })

const normalizeDollarValue = (value: unknown): DollarConfig => {
  if (!value || typeof value !== "object") {
    return DEFAULT_DOLLAR_CONFIG
  }
  return mergeDollarConfig(DEFAULT_DOLLAR_CONFIG, value as Partial<DollarConfig>)
}

const handleAdminClientError = (error: Error, operation: "get" | "update") => {
  if (isRemoteConfigUnavailable(error)) {
    if (operation === "get") {
      return NextResponse.json({ data: DEFAULT_DOLLAR_CONFIG, fallback: true }, { status: 200 })
    }
    return buildErrorResponse("La configuracion remota no esta disponible", 503)
  }
  return buildErrorResponse(error.message)
}

export async function GET() {
  try {
    const { data, error } = await SiteConfigService.getConfigByKey(DOLLAR_CONFIG_KEY)

    if (error) {
      if (error instanceof Error) {
        return handleAdminClientError(error, "get")
      }
      return buildErrorResponse("Error al obtener la configuracion del dolar")
    }

    const config = data?.value ? normalizeDollarValue(data.value) : DEFAULT_DOLLAR_CONFIG
    return NextResponse.json({ data: config })
  } catch (error) {
    console.error("Dollar config GET error:", error)
    return buildErrorResponse("Error interno del servidor")
  }
}

export async function POST(request: NextRequest) {
  try {
    const updates = (await request.json()) as Partial<DollarConfig>

    const currentResult = await SiteConfigService.getConfigByKey(DOLLAR_CONFIG_KEY)
    if (currentResult.error) {
      if (currentResult.error instanceof Error) {
        return handleAdminClientError(currentResult.error, "get")
      }
      return buildErrorResponse("Error al leer la configuracion actual del dolar")
    }

    const currentConfig = currentResult.data?.value
      ? normalizeDollarValue(currentResult.data.value)
      : DEFAULT_DOLLAR_CONFIG

    const mergedConfig = mergeDollarConfig(currentConfig, updates)
    const upsertResult = await SiteConfigService.upsertConfig(DOLLAR_CONFIG_KEY, mergedConfig as unknown as Json)
    if (upsertResult.error) {
      if (upsertResult.error instanceof Error) {
        return handleAdminClientError(upsertResult.error, "update")
      }
      return buildErrorResponse("No se pudo guardar la configuracion del dolar")
    }

    return NextResponse.json({ data: mergedConfig })
  } catch (error) {
    console.error("Dollar config POST error:", error)
    return buildErrorResponse("Error interno del servidor")
  }
}
