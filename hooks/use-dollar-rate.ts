"use client"

import { useEffect, useState } from "react"

interface DollarRate {
  blue: number
  lastUpdate: string
}

export function useDollarRate() {
  const [dollarRate, setDollarRate] = useState<DollarRate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  async function fetchRate() {
    try {
      setLoading(true)
      const res = await fetch("/api/dollar-rate")
      if (!res.ok) throw new Error(`Status ${res.status}`)
      const data = (await res.json()) as DollarRate
      setDollarRate(data)
    } catch (err) {
      console.error("Error fetching dólar blue:", err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRate()
    // Actualiza cada 5 min
    const id = setInterval(fetchRate, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  return { dollarRate, loading, error, refresh: fetchRate }
}
