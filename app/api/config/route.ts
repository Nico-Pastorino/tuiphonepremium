import { NextResponse } from "next/server"

import { getDollarConfigCached, getHomeConfigCached, getTradeInConfigCached } from "@/lib/site-config-cache"

export const revalidate = 60

const PUBLIC_CACHE_CONTROL = "public, max-age=60, stale-while-revalidate=300"

export async function GET() {
  try {
    const [homeConfig, tradeInConfig, dollarConfig] = await Promise.all([
      getHomeConfigCached(),
      getTradeInConfigCached(),
      getDollarConfigCached(),
    ])

    const response = NextResponse.json({
      data: {
        homeConfig,
        tradeInConfig,
        dollarConfig,
      },
    })
    response.headers.set("Cache-Control", PUBLIC_CACHE_CONTROL)
    return response
  } catch (error) {
    console.error("Public config API error:", error)
    return NextResponse.json({ error: "No se pudo cargar la configuracion" }, { status: 500 })
  }
}
