import { NextResponse } from "next/server"

import { fetchLiveDollarRate } from "@/lib/dollar-rate"

export const revalidate = 60
const PUBLIC_CACHE_CONTROL = "public, max-age=60, stale-while-revalidate=300"

export async function GET() {
  try {
    const rate = await fetchLiveDollarRate()

    if (rate) {
      const response = NextResponse.json(rate)
      response.headers.set("Cache-Control", PUBLIC_CACHE_CONTROL)
      return response
    }

    return NextResponse.json({ error: "No se pudo obtener la cotizacion de ninguna fuente" }, { status: 503 })
  } catch (error) {
    console.error("Dollar rate API error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
