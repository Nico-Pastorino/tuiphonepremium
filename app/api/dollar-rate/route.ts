import { NextResponse } from "next/server"

export async function GET() {
  try {
    // En producción, aquí conectarías con una API real como dolarapi.com
    // Por ahora simulamos los datos
    const mockData = {
      blue: 1250,
      official: 950,
      lastUpdate: new Date().toISOString(),
    }

    return NextResponse.json(mockData)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching dollar rate" }, { status: 500 })
  }
}
