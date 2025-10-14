import { type NextRequest, NextResponse } from "next/server"

import { SiteConfigService, SITE_CONFIG_TABLE_NOT_FOUND } from "@/lib/supabase-admin"
import { DEFAULT_INSTALLMENT_CONFIG, mergeInstallmentConfig } from "@/lib/finance-config"
import type { InstallmentConfig } from "@/types/finance"
import type { Json } from "@/types/database"

const INSTALLMENTS_CONFIG_KEY = "installments"

const isRemoteConfigUnavailable = (error: Error) =>
  error.message === "Admin client not configured" || error.message === SITE_CONFIG_TABLE_NOT_FOUND

const buildErrorResponse = (message: string, status = 500) => NextResponse.json({ error: message }, { status })

const normalizeInstallmentValue = (value: unknown): InstallmentConfig => {
  if (!value || typeof value !== "object") {
    return DEFAULT_INSTALLMENT_CONFIG
  }
  return mergeInstallmentConfig(DEFAULT_INSTALLMENT_CONFIG, value as Partial<InstallmentConfig>)
}

const handleAdminClientError = (error: Error, operation: "get" | "update") => {
  if (isRemoteConfigUnavailable(error)) {
    if (operation === "get") {
      return NextResponse.json({ data: DEFAULT_INSTALLMENT_CONFIG, fallback: true }, { status: 200 })
    }
    return buildErrorResponse("La configuracion remota no esta disponible", 503)
  }
  return buildErrorResponse(error.message)
}

export async function GET() {
  try {
    const { data, error } = await SiteConfigService.getConfigByKey(INSTALLMENTS_CONFIG_KEY)

    if (error) {
      if (error instanceof Error) {
        return handleAdminClientError(error, "get")
      }
      return buildErrorResponse("Error al obtener la configuracion de cuotas")
    }

    const config = data?.value ? normalizeInstallmentValue(data.value) : DEFAULT_INSTALLMENT_CONFIG
    return NextResponse.json({ data: config })
  } catch (error) {
    console.error("Installments config GET error:", error)
    return buildErrorResponse("Error interno del servidor")
  }
}

export async function POST(request: NextRequest) {
  try {
    const updates = (await request.json()) as Partial<InstallmentConfig>

    const currentResult = await SiteConfigService.getConfigByKey(INSTALLMENTS_CONFIG_KEY)
    if (currentResult.error) {
      if (currentResult.error instanceof Error) {
        return handleAdminClientError(currentResult.error, "get")
      }
      return buildErrorResponse("Error al leer la configuracion actual de cuotas")
    }

    const currentConfig = currentResult.data?.value
      ? normalizeInstallmentValue(currentResult.data.value)
      : DEFAULT_INSTALLMENT_CONFIG

    const mergedConfig = mergeInstallmentConfig(currentConfig, updates)

    const upsertResult = await SiteConfigService.upsertConfig(
      INSTALLMENTS_CONFIG_KEY,
      mergedConfig as unknown as Json,
    )
    if (upsertResult.error) {
      if (upsertResult.error instanceof Error) {
        return handleAdminClientError(upsertResult.error, "update")
      }
      return buildErrorResponse("No se pudo guardar la configuracion de cuotas")
    }

    return NextResponse.json({ data: mergedConfig })
  } catch (error) {
    console.error("Installments config POST error:", error)
    return buildErrorResponse("Error interno del servidor")
  }
}
