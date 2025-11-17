"use client"

import { useState, useEffect, useCallback } from "react"

interface DollarRate {
  blue: number
  official: number
  lastUpdate: string
  source: string
}

const REFRESH_INTERVAL_MS = 10 * 60 * 1000

export function useDollarRate() {
  const [dollarRate, setDollarRate] = useState<DollarRate | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchDollarRate = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/dollar-rate")
      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || `Dollar API responded with status ${response.status}`)
      }

      const rate = (await response.json()) as DollarRate
      if (rate.blue <= 0 || rate.official <= 0) {
        throw new Error("Datos del dolar incompletos")
      }
      setDollarRate(rate)
    } catch (err) {
      const errorInstance = err instanceof Error ? err : new Error(String(err))
      setError(errorInstance)
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(() => {
    return fetchDollarRate()
  }, [fetchDollarRate])

  useEffect(() => {
    fetchDollarRate()
    const interval = window.setInterval(fetchDollarRate, REFRESH_INTERVAL_MS)

    return () => window.clearInterval(interval)
  }, [fetchDollarRate])

  return {
    dollarRate,
    loading,
    error,
    refresh,
  }
}
