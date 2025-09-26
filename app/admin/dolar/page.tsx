"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useDollarRate } from "@/hooks/use-dollar-rate"

export default function DollarPage() {
  const { dollarRate, loading, error, refresh } = useDollarRate()
  const [dollarBlue, setDollarBlue] = useState("")
  const [dollarOfficial, setDollarOfficial] = useState("")
  const [lastUpdate, setLastUpdate] = useState<string>("")

  // Auto-update dollar rates when component mounts and every 2 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        refresh()
      },
      2 * 60 * 1000,
    ) // Update every 2 minutes

    return () => clearInterval(interval)
  }, [refresh])

  // Update form fields when API data changes
  useEffect(() => {
    if (dollarRate) {
      setDollarBlue(dollarRate.blue.toString())
      setDollarOfficial(dollarRate.official.toString())
      setLastUpdate(new Date(dollarRate.lastUpdate).toLocaleString("es-AR"))
    }
  }, [dollarRate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically save the values to your database
    console.log("Updating dollar rates:", { dollarBlue, dollarOfficial })
  }

  const handleRefresh = () => {
    refresh()
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestión de Dólar</h1>

      {/* Current API Status */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-800">Estado de la API</h3>
            {loading && <p className="text-blue-600">Actualizando cotización...</p>}
            {error && <p className="text-red-600">Error: {error.message}</p>}
            {dollarRate && (
              <div className="text-sm text-blue-700 mt-2">
                <p>Fuente: {dollarRate.source}</p>
                <p>Última actualización: {lastUpdate}</p>
                <p>Dólar Blue: ${dollarRate.blue}</p>
                <p>Dólar Oficial: ${dollarRate.official}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {loading ? "Actualizando..." : "Actualizar Ahora"}
          </button>
        </div>
      </div>

      {/* Actualización del dólar */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3">Actualizar cotización del dólar</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="dollarBlue" className="block text-sm font-medium text-gray-700">
                Dólar Blue
              </label>
              <input
                type="number"
                id="dollarBlue"
                name="dollarBlue"
                value={dollarBlue}
                onChange={(e) => setDollarBlue(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Ingrese cotización"
              />
            </div>
            <div>
              <label htmlFor="dollarOfficial" className="block text-sm font-medium text-gray-700">
                Dólar Oficial
              </label>
              <input
                type="number"
                id="dollarOfficial"
                name="dollarOfficial"
                value={dollarOfficial}
                onChange={(e) => setDollarOfficial(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Ingrese cotización"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
          >
            Actualizar Manualmente
          </button>
        </form>
      </div>

      {/* Auto-update Info */}
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-700">
          ℹ️ La cotización se actualiza automáticamente cada 2 minutos desde la API. Los valores se cargan
          automáticamente en los campos de arriba.
        </p>
      </div>
    </div>
  )
}
