"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RefreshCw, TrendingUp, DollarSign, Clock } from "lucide-react"
import { useAdmin } from "@/contexts/AdminContext"
import { toast } from "sonner"

interface DollarRates {
  oficial: { compra: number; venta: number }
  blue: { compra: number; venta: number }
  mep: { compra: number; venta: number }
  ccl: { compra: number; venta: number }
}

export default function DolarPage() {
  const { dollarRate, updateDollarRate } = useAdmin()
  const [customRate, setCustomRate] = useState(dollarRate?.toString() || "")
  const [apiRates, setApiRates] = useState<DollarRates | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [apiStatus, setApiStatus] = useState<"connected" | "error" | "loading">("loading")

  const fetchDollarRates = async () => {
    setIsLoading(true)
    setApiStatus("loading")

    try {
      const response = await fetch("https://dolarapi.com/v1/dolares")

      if (!response.ok) {
        throw new Error("Error al obtener cotizaciones")
      }

      const data = await response.json()

      // Transformar los datos de la API
      const rates: DollarRates = {
        oficial: { compra: 0, venta: 0 },
        blue: { compra: 0, venta: 0 },
        mep: { compra: 0, venta: 0 },
        ccl: { compra: 0, venta: 0 },
      }

      data.forEach((rate: any) => {
        switch (rate.casa) {
          case "oficial":
            rates.oficial = { compra: rate.compra, venta: rate.venta }
            break
          case "blue":
            rates.blue = { compra: rate.compra, venta: rate.venta }
            break
          case "bolsa":
            rates.mep = { compra: rate.compra, venta: rate.venta }
            break
          case "contadoconliqui":
            rates.ccl = { compra: rate.compra, venta: rate.venta }
            break
        }
      })

      setApiRates(rates)
      setLastUpdate(new Date())
      setApiStatus("connected")

      // Auto-actualizar con el dólar blue como base
      if (rates.blue.venta > 0) {
        setCustomRate(rates.blue.venta.toString())
        await updateDollarRate(rates.blue.venta)
        toast.success("Cotización actualizada automáticamente con dólar blue")
      }
    } catch (error) {
      console.error("Error fetching dollar rates:", error)
      setApiStatus("error")
      toast.error("Error al obtener cotizaciones de la API")
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-fetch al cargar la página
  useEffect(() => {
    fetchDollarRates()
  }, [])

  // Auto-refresh cada 2 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDollarRates()
    }, 120000) // 2 minutos

    return () => clearInterval(interval)
  }, [])

  const handleUpdateRate = async () => {
    const rate = Number.parseFloat(customRate)
    if (isNaN(rate) || rate <= 0) {
      toast.error("Por favor ingresa una cotización válida")
      return
    }

    try {
      await updateDollarRate(rate)
      toast.success("Cotización actualizada correctamente")
    } catch (error) {
      toast.error("Error al actualizar la cotización")
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión del Dólar</h1>
          <p className="text-muted-foreground">Administra la cotización del dólar para el cálculo de precios</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={apiStatus === "connected" ? "default" : apiStatus === "error" ? "destructive" : "secondary"}>
            {apiStatus === "connected" ? "API Conectada" : apiStatus === "error" ? "API Error" : "Cargando..."}
          </Badge>
          {lastUpdate && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(lastUpdate)}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Cotización Actual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cotización Actual
            </CardTitle>
            <CardDescription>Cotización utilizada para convertir precios USD a ARS</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-bold text-green-600">
              ${dollarRate?.toLocaleString("es-AR") || "No configurado"}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customRate">Nueva Cotización</Label>
              <div className="flex gap-2">
                <Input
                  id="customRate"
                  type="number"
                  placeholder="Ej: 1200"
                  value={customRate}
                  onChange={(e) => setCustomRate(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleUpdateRate} disabled={isLoading}>
                  Actualizar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cotizaciones de la API */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Cotizaciones en Vivo
              <Button variant="ghost" size="sm" onClick={fetchDollarRates} disabled={isLoading} className="ml-auto">
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </CardTitle>
            <CardDescription>Datos actualizados desde DolarAPI.com</CardDescription>
          </CardHeader>
          <CardContent>
            {apiRates ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Dólar Oficial</span>
                      <Badge variant="secondary">Oficial</Badge>
                    </div>
                    <div className="text-lg font-semibold">${apiRates.oficial.venta.toLocaleString("es-AR")}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Dólar Blue</span>
                      <Badge variant="default">Recomendado</Badge>
                    </div>
                    <div className="text-lg font-semibold text-blue-600">
                      ${apiRates.blue.venta.toLocaleString("es-AR")}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Dólar MEP</span>
                      <Badge variant="outline">MEP</Badge>
                    </div>
                    <div className="text-lg font-semibold">${apiRates.mep.venta.toLocaleString("es-AR")}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Dólar CCL</span>
                      <Badge variant="outline">CCL</Badge>
                    </div>
                    <div className="text-lg font-semibold">${apiRates.ccl.venta.toLocaleString("es-AR")}</div>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCustomRate(apiRates.blue.venta.toString())
                      updateDollarRate(apiRates.blue.venta)
                      toast.success("Aplicado dólar blue")
                    }}
                    className="flex-1"
                  >
                    Usar Blue
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCustomRate(apiRates.oficial.venta.toString())
                      updateDollarRate(apiRates.oficial.venta)
                      toast.success("Aplicado dólar oficial")
                    }}
                    className="flex-1"
                  >
                    Usar Oficial
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {isLoading ? "Cargando cotizaciones..." : "No se pudieron cargar las cotizaciones"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Información</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• La cotización se actualiza automáticamente cada 2 minutos</p>
          <p>• Al abrir la página, se carga automáticamente el dólar blue como base</p>
          <p>• Los precios en USD se convierten usando la cotización configurada</p>
          <p>• Los datos provienen de DolarAPI.com en tiempo real</p>
        </CardContent>
      </Card>
    </div>
  )
}
