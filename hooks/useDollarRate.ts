"use client"

import { useState, useEffect } from "react"
import type { DollarRate } from "@/types/product"

export function useDollarRate() {
  const [dollarRate, setDollarRate] = useState<DollarRate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDollarRate = async () => {
      try {
        // Simulamos la API del dólar blue - en producción conectarías con una API real
        const response = await fetch("/api/dollar-rate")
        if (!response.ok) throw new Error("Error fetching dollar rate")
        const data = await response.json()
        setDollarRate(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchDollarRate()
    // Actualizar cada 5 minutos
    const interval = setInterval(fetchDollarRate, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return { dollarRate, loading, error }
}
