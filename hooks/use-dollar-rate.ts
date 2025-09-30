"use client"

import { useState, useEffect, useCallback } from "react"

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

interface DolarSiItem {
  casa: {
    nombre: string
    venta: string
    compra: string
  }
}

type DolarSiResponse = DolarSiItem[]

type FetchDollarFn = (signal: AbortSignal) => Promise<DollarRate>

const JSON_HEADERS: Record<string, string> = { Accept: "application/json" }

const withJsonHeaders = (init: RequestInit = {}): RequestInit => ({
  ...init,
  headers: {
    ...JSON_HEADERS,
    ...(init.headers ?? {}),
  },
})

const parseNumber = (value: string): number => {
  return Number.parseFloat(value.replace(",", "."))
}

const normalizeRate = (rate: DollarRate): DollarRate => ({
  ...rate,
  blue: Number(rate.blue),
  official: Number(rate.official),
})

export function useDollarRate() {
  const [dollarRate, setDollarRate] = useState<DollarRate | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchFromDolarAPI: FetchDollarFn = async (signal) => {
    const blueResponse = await fetch(
      "https://dolarapi.com/v1/dolares/blue",
      withJsonHeaders({ method: "GET", signal }),
    )

    if (!blueResponse.ok) {
      throw new Error(`DolarAPI error: ${blueResponse.status}`)
    }

    const blueData = (await blueResponse.json()) as DollarAPIResponse

    const officialResponse = await fetch(
      "https://dolarapi.com/v1/dolares/oficial",
      withJsonHeaders({ method: "GET", signal }),
    )

    if (!officialResponse.ok) {
      throw new Error(`DolarAPI (oficial) error: ${officialResponse.status}`)
    }

    const officialData = (await officialResponse.json()) as DollarAPIResponse

    return normalizeRate({
      blue: blueData.venta,
      official: officialData.venta,
      lastUpdate: blueData.fecha,
      source: "DolarAPI",
    })
  }

  const fetchFromBluelytics: FetchDollarFn = async (signal) => {
    const response = await fetch(
      "https://api.bluelytics.com.ar/v2/latest",
      withJsonHeaders({ method: "GET", signal }),
    )

    if (!response.ok) {
      throw new Error(`Bluelytics error: ${response.status}`)
    }

    const data = (await response.json()) as BluelyticsResponse

    return normalizeRate({
      blue: data.blue.value_sell,
      official: data.oficial.value_sell,
      lastUpdate: data.last_update,
      source: "Bluelytics",
    })
  }

  const fetchFromDolarSi: FetchDollarFn = async (signal) => {
    const response = await fetch(
      "https://dolarsi.com/api/api.php?type=valoresprincipales",
      withJsonHeaders({ method: "GET", signal }),
    )

    if (!response.ok) {
      throw new Error(`DolarSi error: ${response.status}`)
    }

    const data = (await response.json()) as DolarSiResponse

    const blueData = data.find((item) => item.casa.nombre === "Dolar Blue")
    const officialData = data.find((item) => item.casa.nombre === "Dolar Oficial")

    if (!blueData || !officialData) {
      throw new Error("DolarSi: No se encontraron datos del dolar")
    }

    return normalizeRate({
      blue: parseNumber(blueData.casa.venta),
      official: parseNumber(officialData.casa.venta),
      lastUpdate: new Date().toISOString(),
      source: "DolarSi",
    })
  }

  const fetchDollarRate = useCallback(async () => {
    setLoading(true)
    setError(null)

    const providers: Array<{ name: string; fetcher: FetchDollarFn }> = [
      { name: "DolarAPI", fetcher: fetchFromDolarAPI },
      { name: "Bluelytics", fetcher: fetchFromBluelytics },
      { name: "DolarSi", fetcher: fetchFromDolarSi },
    ]

    for (const { name, fetcher } of providers) {
      const controller = new AbortController()
      const timeoutId = window.setTimeout(() => controller.abort(), 10_000)

      try {
        const rate = await fetcher(controller.signal)

        if (rate.blue > 0 && rate.official > 0) {
          setDollarRate(rate)
          setLoading(false)
          return
        }
      } catch (err) {
        const errorInstance = err instanceof Error ? err : new Error(String(err))
        if (errorInstance.name === "AbortError") {
          console.warn(`${name} request aborted by timeout`)
        } else {
          console.warn(`Error fetching from ${name}:`, errorInstance)
        }
      } finally {
        window.clearTimeout(timeoutId)
      }
    }

    const fallbackError = new Error("No se pudo obtener la cotizacion del dolar de ninguna fuente")
    setError(fallbackError)
    setLoading(false)
  }, [])

  const refresh = useCallback(() => {
    return fetchDollarRate()
  }, [fetchDollarRate])

  useEffect(() => {
    fetchDollarRate()
    const interval = window.setInterval(fetchDollarRate, 60 * 1000)

    return () => window.clearInterval(interval)
  }, [fetchDollarRate])

  return {
    dollarRate,
    loading,
    error,
    refresh,
  }
}
