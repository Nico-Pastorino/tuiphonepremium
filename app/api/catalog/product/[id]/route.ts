import { NextResponse } from "next/server"

import { ProductAdminService } from "@/lib/supabase-admin"

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await ProductAdminService.getProductById(params.id)

    if (error) {
      throw error
    }

    if (!data) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      data,
      supabaseConnected: true,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("Catalog product lookup failed:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo obtener el producto" },
      { status: 500 },
    )
  }
}
