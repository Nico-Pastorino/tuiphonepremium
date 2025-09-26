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

export function useDollarRate() {
  const [dollarRate, setDollarRate] = useState<DollarRate | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchFromDolarAPI = async (): Promise<DollarRate> => {
    const response = await fetch("https://dolarapi.com/v1/dolares/blue", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`DolarAPI error: ${response.status}`)
    }

    const data = (await response.json()) as DollarAPIResponse
    const officialResponse = await fetch("https://dolarapi.com/v1/dolares/oficial")
    const officialData = (await officialResponse.json()) as DollarAPIResponse

    return {
      blue: data.venta,
      official: officialData.venta,
      lastUpdate: data.fecha,
      source: "DolarAPI",
    }
  }

  const fetchFromBluelytics = async (): Promise<DollarRate> => {
    const response = await fetch("https://api.bluelytics.com.ar/v2/latest", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Bluelytics error: ${response.status}`)
    }

    const data = (await response.json()) as BluelyticsResponse

    return {
      blue: data.blue.value_sell,
      official: data.oficial.value_sell,
      lastUpdate: data.last_update,
      source: "Bluelytics",
    }
  }

  const fetchFromDolarSi = async (): Promise<DollarRate> => {
    const response = await fetch("https://dolarsi.com/api/api.php?type=valoresprincipales", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`DolarSi error: ${response.status}`)
    }

    const data = (await response.json()) as DolarSiResponse

    const blueData = data.find((item) => item.casa.nombre === "Dolar Blue")
    const officialData = data.find((item) => item.casa.nombre === "Dolar Oficial")

    if (!blueData || !officialData) {
      throw new Error("DolarSi: No se encontraron datos del dolar")
    }

    return {
      blue: Number.parseFloat(blueData.casa.venta.replace(",", ".")),
      official: Number.parseFloat(officialData.casa.venta.replace(",", ".")),
      lastUpdate: new Date().toISOString(),
      source: "DolarSi",
    }
  }

  const fetchDollarRate = useCallback(async () => {
    setLoading(true)
    setError(null)

    const apis = [fetchFromDolarAPI, fetchFromBluelytics, fetchFromDolarSi]

    for (const fetchAPI of apis) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const rate = await Promise.race([
          fetchAPI(),
          new Promise<never>((_, reject) => {
            controller.signal.addEventListener("abort", () => {
              reject(new Error("Request timeout"))
            })
          }),
        ])

        clearTimeout(timeoutId)

        if (rate.blue > 0 && rate.official > 0) {
          setDollarRate(rate)
          setLoading(false)
          return
        }
      } catch (err) {
        console.warn(`Error fetching from ${fetchAPI.name}:`, err)
      }
    }

    setError(new Error("No se pudo obtener la cotizacion del dolar de ninguna fuente"))
    setLoading(false)
  }, [])

  const refresh = useCallback(() => {
    return fetchDollarRate()
  }, [fetchDollarRate])

  useEffect(() => {
    fetchDollarRate()
    const interval = setInterval(fetchDollarRate, 60 * 1000)

    return () => clearInterval(interval)
  }, [fetchDollarRate])

  return {
    dollarRate,
    loading,
    error,
    refresh,
  }
}
