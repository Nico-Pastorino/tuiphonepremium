import { NextResponse } from "next/server"

import { ProductAdminService } from "@/lib/supabase-admin"

export const revalidate = 300
const DEBUG_EGRESS_LOGS = process.env.DEBUG_EGRESS_LOGS === "true"

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const startedAt = Date.now()
  try {
    const { data, error } = await ProductAdminService.getProductById(params.id)

    if (error) {
      throw error
    }

    if (!data) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    const response = NextResponse.json({
      data,
      supabaseConnected: true,
      timestamp: Date.now(),
    })
    response.headers.set("Cache-Control", "s-maxage=300, stale-while-revalidate=600")
    if (DEBUG_EGRESS_LOGS) {
      console.info("[catalog/product]", {
        durationMs: Date.now() - startedAt,
        id: params.id,
      })
    }
    return response
  } catch (error) {
    console.error("Catalog product lookup failed:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo obtener el producto" },
      { status: 500 },
    )
  }
}
