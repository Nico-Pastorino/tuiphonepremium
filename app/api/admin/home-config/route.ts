import { type NextRequest, NextResponse } from "next/server"

import { SiteConfigService } from "@/lib/supabase-admin"
import { DEFAULT_HOME_CONFIG, mergeHomeConfig } from "@/lib/home-config"
import type { HomeConfig } from "@/types/home"
import type { Json } from "@/types/database"

const HOME_CONFIG_KEY = "home"

const buildErrorResponse = (message: string, status = 500) =>
  NextResponse.json({ error: message }, { status })

const normalizeHomeConfigValue = (value: unknown): HomeConfig => {
  if (!value || typeof value !== "object") {
    return DEFAULT_HOME_CONFIG
  }
  return mergeHomeConfig(DEFAULT_HOME_CONFIG, value as Partial<HomeConfig>)
}

const handleAdminClientError = (error: Error) => {
  if (error.message === "Admin client not configured") {
    return NextResponse.json({ data: DEFAULT_HOME_CONFIG, error: error.message }, { status: 503 })
  }
  return buildErrorResponse(error.message)
}

export async function GET() {
  try {
    const { data, error } = await SiteConfigService.getConfigByKey(HOME_CONFIG_KEY)

    if (error) {
      if (error instanceof Error) {
        return handleAdminClientError(error)
      }
      return buildErrorResponse("Error al obtener la configuracion de la portada")
    }

    const config = data?.value ? normalizeHomeConfigValue(data.value) : DEFAULT_HOME_CONFIG
    return NextResponse.json({ data: config })
  } catch (error) {
    console.error("Home config GET error:", error)
    return buildErrorResponse("Error interno del servidor")
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updates = (await request.json()) as Partial<HomeConfig>

    const currentResult = await SiteConfigService.getConfigByKey(HOME_CONFIG_KEY)
    if (currentResult.error) {
      if (currentResult.error instanceof Error) {
        return handleAdminClientError(currentResult.error)
      }
      return buildErrorResponse("Error al leer la configuracion actual")
    }

    const currentConfig = currentResult.data?.value
      ? normalizeHomeConfigValue(currentResult.data.value)
      : DEFAULT_HOME_CONFIG

    const mergedConfig = mergeHomeConfig(currentConfig, updates)

    const upsertResult = await SiteConfigService.upsertConfig(HOME_CONFIG_KEY, mergedConfig as Json)
    if (upsertResult.error) {
      if (upsertResult.error instanceof Error) {
        return handleAdminClientError(upsertResult.error)
      }
      return buildErrorResponse("No se pudo guardar la configuracion de la portada")
    }

    return NextResponse.json({ data: mergedConfig })
  } catch (error) {
    console.error("Home config PUT error:", error)
    return buildErrorResponse("Error interno del servidor")
  }
}
