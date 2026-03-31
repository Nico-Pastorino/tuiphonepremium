import { NextResponse } from "next/server"

import { getDollarConfigCached, getHomeConfigCached, getInstallmentConfigCached, getTradeInConfigCached } from "@/lib/site-config-cache"
import { getImageLibrary } from "@/lib/image-library"

export const revalidate = 3600

const DEBUG_EGRESS_LOGS = process.env.DEBUG_EGRESS_LOGS === "true"

export async function GET() {
  const startedAt = Date.now()

  try {
    const [homeConfig, tradeInConfig, installmentConfig, dollarConfig, imageLibrary] = await Promise.all([
      getHomeConfigCached(),
      getTradeInConfigCached(),
      getInstallmentConfigCached(),
      getDollarConfigCached(),
      getImageLibrary(),
    ])

    if (DEBUG_EGRESS_LOGS) {
      console.info("[admin/bootstrap]", {
        durationMs: Date.now() - startedAt,
        imageLibraryCount: imageLibrary.length,
      })
    }

    const response = NextResponse.json({
      data: {
        homeConfig,
        tradeInConfig,
        installmentConfig,
        dollarConfig,
        imageLibrary,
      },
    })
    response.headers.set("Cache-Control", "private, max-age=3600, stale-while-revalidate=86400")
    return response
  } catch (error) {
    console.error("Admin bootstrap GET error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
