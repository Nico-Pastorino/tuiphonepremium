import { NextResponse, type NextRequest } from "next/server"

import { fetchLiveDollarRate } from "@/lib/dollar-rate"
import { SiteConfigService, SITE_CONFIG_TABLE_NOT_FOUND } from "@/lib/supabase-admin"
import { DEFAULT_DOLLAR_CONFIG, mergeDollarConfig } from "@/lib/finance-config"
import { invalidatePricingConfigCaches } from "@/lib/site-config-cache"
import type { DollarConfig } from "@/types/finance"
import type { Json } from "@/types/database"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const maxDuration = 30

const DOLLAR_CONFIG_KEY = "dollar"

const normalizeDollarValue = (value: unknown): DollarConfig => {
  if (!value || typeof value !== "object") {
    return DEFAULT_DOLLAR_CONFIG
  }
  return mergeDollarConfig(DEFAULT_DOLLAR_CONFIG, value as Partial<DollarConfig>)
}

const isRemoteConfigUnavailable = (message: string) =>
  message === "Admin client not configured" || message === SITE_CONFIG_TABLE_NOT_FOUND

// Vercel Cron agrega el header "Authorization: Bearer <CRON_SECRET>" si la env var existe.
// Si no hay secreto configurado, se permite (para no romper el primer deploy).
const isAuthorized = (request: NextRequest): boolean => {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return true
  }
  return request.headers.get("authorization") === `Bearer ${secret}`
}

async function updateDollarFromLiveRate() {
  const liveRate = await fetchLiveDollarRate()
  if (!liveRate) {
    return NextResponse.json(
      { ok: false, error: "No se pudo obtener la cotizacion en vivo de ninguna fuente" },
      { status: 503 },
    )
  }

  const currentResult = await SiteConfigService.getConfigByKey(DOLLAR_CONFIG_KEY)
  if (currentResult.error) {
    const message = currentResult.error instanceof Error ? currentResult.error.message : "Error al leer la configuracion"
    const status = isRemoteConfigUnavailable(message) ? 503 : 500
    return NextResponse.json({ ok: false, error: message }, { status })
  }

  const currentConfig = currentResult.data?.value
    ? normalizeDollarValue(currentResult.data.value)
    : DEFAULT_DOLLAR_CONFIG

  // Respeta el switch del admin: si apago la actualizacion automatica, no piso los valores.
  if (currentConfig.autoUpdate === false) {
    return NextResponse.json({ ok: true, skipped: true, reason: "autoUpdate desactivado" })
  }

  const mergedConfig = mergeDollarConfig(currentConfig, {
    blueRate: liveRate.blue,
    officialRate: liveRate.official,
    lastUpdated: new Date().toISOString(),
  })

  const upsertResult = await SiteConfigService.upsertConfig(DOLLAR_CONFIG_KEY, mergedConfig as unknown as Json)
  if (upsertResult.error) {
    const message = upsertResult.error instanceof Error ? upsertResult.error.message : "No se pudo guardar la configuracion"
    const status = isRemoteConfigUnavailable(message) ? 503 : 500
    return NextResponse.json({ ok: false, error: message }, { status })
  }

  await invalidatePricingConfigCaches()

  return NextResponse.json({
    ok: true,
    source: liveRate.source,
    updated: {
      blueRate: mergedConfig.blueRate,
      officialRate: mergedConfig.officialRate,
      markup: mergedConfig.markup,
      effectiveRate: Number((mergedConfig.blueRate + mergedConfig.markup).toFixed(2)),
      lastUpdated: mergedConfig.lastUpdated,
    },
  })
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 })
  }

  try {
    return await updateDollarFromLiveRate()
  } catch (error) {
    console.error("Cron update-dollar error:", error)
    return NextResponse.json({ ok: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
