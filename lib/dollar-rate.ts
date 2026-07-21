export interface LiveDollarRate {
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

interface DolarSiItem {
  casa: {
    nombre: string
    venta: string
    compra: string
  }
}

type DolarSiResponse = DolarSiItem[]

const SOURCE_TIMEOUT_MS = 10000

async function fetchFromDolarAPI(): Promise<LiveDollarRate> {
  const [blueResponse, officialResponse] = await Promise.all([
    fetch("https://dolarapi.com/v1/dolares/blue", {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    }),
    fetch("https://dolarapi.com/v1/dolares/oficial", {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    }),
  ])

  if (!blueResponse.ok || !officialResponse.ok) {
    throw new Error("DolarAPI request failed")
  }

  const blueData = (await blueResponse.json()) as DollarAPIResponse
  const officialData = (await officialResponse.json()) as DollarAPIResponse

  return {
    blue: blueData.venta,
    official: officialData.venta,
    lastUpdate: blueData.fecha,
    source: "DolarAPI",
  }
}

async function fetchFromBluelytics(): Promise<LiveDollarRate> {
  const response = await fetch("https://api.bluelytics.com.ar/v2/latest", {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    throw new Error("Bluelytics request failed")
  }

  const data = (await response.json()) as BluelyticsResponse

  return {
    blue: data.blue.value_sell,
    official: data.oficial.value_sell,
    lastUpdate: data.last_update,
    source: "Bluelytics",
  }
}

async function fetchFromDolarSi(): Promise<LiveDollarRate> {
  const response = await fetch("https://dolarsi.com/api/api.php?type=valoresprincipales", {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    throw new Error("DolarSi request failed")
  }

  const data = (await response.json()) as DolarSiResponse

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

const DOLLAR_SOURCES = [fetchFromDolarAPI, fetchFromBluelytics, fetchFromDolarSi]

/**
 * Consulta las fuentes de cotizacion en orden y devuelve la primera que
 * responda con valores validos. Devuelve null si ninguna fuente responde.
 */
export async function fetchLiveDollarRate(): Promise<LiveDollarRate | null> {
  for (const fetchSource of DOLLAR_SOURCES) {
    try {
      const rate = await Promise.race([
        fetchSource(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), SOURCE_TIMEOUT_MS)),
      ])

      if (rate.blue > 0 && rate.official > 0) {
        return rate
      }
    } catch (error) {
      console.warn(`Error with ${fetchSource.name}:`, error)
    }
  }

  return null
}
