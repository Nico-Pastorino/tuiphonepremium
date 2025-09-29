import { type NextRequest, NextResponse } from "next/server"

import { SiteConfigService, SITE_CONFIG_TABLE_NOT_FOUND } from "@/lib/supabase-admin"
import { DEFAULT_TRADE_IN_CONFIG, mergeTradeInConfig } from "@/lib/trade-in-config"
import type { TradeInConfig } from "@/types/trade-in"
import type { Json } from "@/types/database"

const TRADE_IN_CONFIG_KEY = "trade-in"

const isRemoteConfigUnavailable = (error: Error) =>
  error.message === "Admin client not configured" || error.message === SITE_CONFIG_TABLE_NOT_FOUND

const buildErrorResponse = (message: string, status = 500) =>
  NextResponse.json({ error: message }, { status })

const normalizeTradeInConfigValue = (value: unknown): TradeInConfig => {
  if (!value || typeof value !== "object") {
    return DEFAULT_TRADE_IN_CONFIG
  }
  return mergeTradeInConfig(DEFAULT_TRADE_IN_CONFIG, value as Partial<TradeInConfig>)
}

const handleAdminClientError = (error: Error, operation: "get" | "update") => {
  if (isRemoteConfigUnavailable(error)) {
    if (operation === "get") {
      return NextResponse.json({ data: DEFAULT_TRADE_IN_CONFIG, fallback: true }, { status: 200 })
    }
    return buildErrorResponse("La configuracion remota no esta disponible", 503)
  }
  return buildErrorResponse(error.message)
}

export async function GET() {
  try {
    const { data, error } = await SiteConfigService.getConfigByKey(TRADE_IN_CONFIG_KEY)

    if (error) {
      if (error instanceof Error) {
        return handleAdminClientError(error, "get")
      }
      return buildErrorResponse("Error al obtener la configuracion de canje")
    }

    const config = data?.value ? normalizeTradeInConfigValue(data.value) : DEFAULT_TRADE_IN_CONFIG
    return NextResponse.json({ data: config })
  } catch (error) {
    console.error("Trade-in config GET error:", error)
    return buildErrorResponse("Error interno del servidor")
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updates = (await request.json()) as Partial<TradeInConfig>

    const currentResult = await SiteConfigService.getConfigByKey(TRADE_IN_CONFIG_KEY)
    if (currentResult.error) {
      if (currentResult.error instanceof Error) {
        return handleAdminClientError(currentResult.error, "get")
      }
      return buildErrorResponse("Error al leer la configuracion actual de canje")
    }

    const currentConfig = currentResult.data?.value
      ? normalizeTradeInConfigValue(currentResult.data.value)
      : DEFAULT_TRADE_IN_CONFIG

    const mergedConfig = mergeTradeInConfig(currentConfig, updates)

    const upsertResult = await SiteConfigService.upsertConfig(TRADE_IN_CONFIG_KEY, mergedConfig as Json)
    if (upsertResult.error) {
      if (upsertResult.error instanceof Error) {
        return handleAdminClientError(upsertResult.error, "update")
      }
      return buildErrorResponse("No se pudo guardar la configuracion de canje")
    }

    return NextResponse.json({ data: mergedConfig })
  } catch (error) {
    console.error("Trade-in config PUT error:", error)
    return buildErrorResponse("Error interno del servidor")
  }
}
