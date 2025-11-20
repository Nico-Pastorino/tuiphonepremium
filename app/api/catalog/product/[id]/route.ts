import { NextResponse } from "next/server"

import { getProductsSnapshot } from "@/lib/product-cache"

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const snapshot = await getProductsSnapshot()
    const target = snapshot.data.find((row) => row.id === params.id)

    if (!target) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      data: target,
      supabaseConnected: snapshot.connected,
      timestamp: snapshot.fetchedAt,
    })
  } catch (error) {
    console.error("Catalog product lookup failed:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo obtener el producto" },
      { status: 500 },
    )
  }
}
