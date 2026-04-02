import { NextResponse } from "next/server"

import { getDollarConfigCached, getHomeConfigCached, getInstallmentConfigCached, getTradeInConfigCached } from "@/lib/site-config-cache"
export const revalidate = 3600

const DEBUG_EGRESS_LOGS = process.env.DEBUG_EGRESS_LOGS === "true"

export async function GET() {
  const startedAt = Date.now()

  try {
    const [homeConfig, tradeInConfig, installmentConfig, dollarConfig] = await Promise.all([
      getHomeConfigCached(),
      getTradeInConfigCached(),
      getInstallmentConfigCached(),
      getDollarConfigCached(),
    ])

    if (DEBUG_EGRESS_LOGS) {
      console.info("[admin/bootstrap]", {
        durationMs: Date.now() - startedAt,
      })
    }

    const response = NextResponse.json({
      data: {
        homeConfig,
        tradeInConfig,
        installmentConfig,
        dollarConfig,
      },
    })
    response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate")
    return response
  } catch (error) {
    console.error("Admin bootstrap GET error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
