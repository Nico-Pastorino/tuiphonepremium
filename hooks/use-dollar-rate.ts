"use client"

import { useCallback } from "react"
import useSWR from "swr"

interface DollarRate {
  blue: number
  official: number
  lastUpdate: string
  source: string
}

const REFRESH_INTERVAL_MS = 10 * 60 * 1000

const fetchDollarRate = async (): Promise<DollarRate> => {
  const response = await fetch("/api/dollar", { cache: "force-cache" })
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Dollar API responded with status ${response.status}`)
  }

  const rate = (await response.json()) as DollarRate
  if (rate.blue <= 0 || rate.official <= 0) {
    throw new Error("Datos del dolar incompletos")
  }

  return rate
}

export function useDollarRate() {
  const { data, error, isLoading, mutate } = useSWR<DollarRate>("/api/dollar", fetchDollarRate, {
    dedupingInterval: 60_000,
    focusThrottleInterval: 60_000,
    refreshInterval: REFRESH_INTERVAL_MS,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    keepPreviousData: true,
  })

  const refresh = useCallback(() => {
    return mutate()
  }, [mutate])

  return {
    dollarRate: data ?? null,
    loading: isLoading,
    error: error instanceof Error ? error : error ? new Error(String(error)) : null,
    refresh,
  }
}
