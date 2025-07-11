import { NextResponse } from "next/server"

export const revalidate = 3600 // caché de 1 h en ISR

export async function GET() {
  try {
    // Ejemplo de API pública – puedes cambiarla por otra fuente de confianza
    const res = await fetch("https://dolarapi.com/v1/dolarblue", { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error(`Status ${res.status}`)
    const apiData = await res.json() // { compra: number, venta: number, fechaActualizacion: string }

    return NextResponse.json({
      blue: apiData.venta,
      lastUpdate: apiData.fechaActualizacion,
    })
  } catch (e) {
    // Fallback en caso de error
    return NextResponse.json(
      {
        blue: 0,
        lastUpdate: new Date().toISOString(),
        error: "No se pudo obtener la cotización en este momento.",
      },
      { status: 200 },
    )
  }
}
