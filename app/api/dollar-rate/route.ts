import { NextResponse } from "next/server"

interface DollarRate {
  blue: number
  official: number
  lastUpdate: string
  source: string
}

interface DollarAPIResponse {
  venta: number
  compra: number
  fecha: string
}

interface BluelyticsResponse {
  blue: {
    value_sell: number
    value_buy: number
  }
  oficial: {
    value_sell: number
    value_buy: number
  }
  last_update: string
}

interface DolarSiResponse {
  casa: {
    nombre: string
    venta: string
    compra: string
  }
}
;[]

async function fetchFromDolarAPI(): Promise<DollarRate> {
  const [blueResponse, officialResponse] = await Promise.all([
    fetch("https://dolarapi.com/v1/dolares/blue", {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 }, // Cache por 5 minutos
    }),
    fetch("https://dolarapi.com/v1/dolares/oficial", {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    }),
  ])

  if (!blueResponse.ok || !officialResponse.ok) {
    throw new Error("DolarAPI request failed")
  }

  const blueData: DollarAPIResponse = await blueResponse.json()
  const officialData: DollarAPIResponse = await officialResponse.json()

  return {
    blue: blueData.venta,
    official: officialData.venta,
    lastUpdate: blueData.fecha,
    source: "DolarAPI",
  }
}

async function fetchFromBluelytics(): Promise<DollarRate> {
  const response = await fetch("https://api.bluelytics.com.ar/v2/latest", {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    throw new Error("Bluelytics request failed")
  }

  const data: BluelyticsResponse = await response.json()

  return {
    blue: data.blue.value_sell,
    official: data.oficial.value_sell,
    lastUpdate: data.last_update,
    source: "Bluelytics",
  }
}

async function fetchFromDolarSi(): Promise<DollarRate> {
  const response = await fetch("https://dolarsi.com/api/api.php?type=valoresprincipales", {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    throw new Error("DolarSi request failed")
  }

  const data: DolarSiResponse = await response.json()

  const blueData = data.find((item) => item.casa.nombre === "Dolar Blue")
  const officialData = data.find((item) => item.casa.nombre === "Dolar Oficial")

  if (!blueData || !officialData) {
    throw new Error("DolarSi: Required data not found")
  }

  return {
    blue: Number.parseFloat(blueData.casa.venta.replace(",", ".")),
    official: Number.parseFloat(officialData.casa.venta.replace(",", ".")),
    lastUpdate: new Date().toISOString(),
    source: "DolarSi",
  }
}

export async function GET() {
  try {
    const apis = [fetchFromDolarAPI, fetchFromBluelytics, fetchFromDolarSi]

    for (const fetchAPI of apis) {
      try {
        const rate = await Promise.race([
          fetchAPI(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000)),
        ])

        // Validar datos
        if (rate.blue > 0 && rate.official > 0) {
          return NextResponse.json(rate)
        }
      } catch (error) {
        console.warn(`Error with ${fetchAPI.name}:`, error)
        continue
      }
    }

    return NextResponse.json({ error: "No se pudo obtener la cotización de ninguna fuente" }, { status: 503 })
  } catch (error) {
    console.error("Dollar rate API error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
