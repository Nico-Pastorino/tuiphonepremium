"use client"

import { useState } from "react"
import { MinimalNavbar } from "@/components/MinimalNavbar"
import { AnimatedSection } from "@/components/AnimatedSection"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calculator, CreditCard, DollarSign, Percent, MessageCircle, CheckCircle, Info } from "lucide-react"
import { useAdmin } from "@/contexts/AdminContext"

export default function CuotasPage() {
  const { homeConfig } = useAdmin()
  const [amount, setAmount] = useState<number>(500000)
  const [installments, setInstallments] = useState<number>(12)
  const [paymentMethod, setPaymentMethod] = useState<string>("credit")

  const whatsappNumber = homeConfig.whatsappNumber?.trim() || "5491112345678"
  const whatsappLink = `https://wa.me/${whatsappNumber}`

  // Tasas de interés por método de pago
  const interestRates = {
    credit: {
      3: 0,
      6: 15,
      9: 25,
      12: 35,
    },
    debit: {
      3: 0,
      6: 0,
      9: 0,
      12: 0,
    },
  }

  const calculateInstallment = () => {
    const rate =
      interestRates[paymentMethod as keyof typeof interestRates][installments as keyof typeof interestRates.credit] || 0
    const totalWithInterest = amount * (1 + rate / 100)
    return totalWithInterest / installments
  }

  const getTotalAmount = () => {
    const rate =
      interestRates[paymentMethod as keyof typeof interestRates][installments as keyof typeof interestRates.credit] || 0
    return amount * (1 + rate / 100)
  }

  const getInterestAmount = () => {
    return getTotalAmount() - amount
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavbar />

      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <AnimatedSection animation="fadeUp">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Financiación y Cuotas</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Comprá tu producto Apple favorito en cómodas cuotas. Calculá tu financiación y elegí la opción que mejor
                se adapte a vos.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Calculator */}
            <AnimatedSection animation="fadeLeft">
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-6 h-6 text-blue-600" />
                    Calculadora de Cuotas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Monto del producto</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="pl-10"
                        placeholder="500000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Método de pago</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit">Tarjeta de Crédito</SelectItem>
                        <SelectItem value="debit">Tarjeta de Débito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="installments">Cantidad de cuotas</Label>
                    <Select value={installments.toString()} onValueChange={(value) => setInstallments(Number(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 cuotas</SelectItem>
                        <SelectItem value="6">6 cuotas</SelectItem>
                        <SelectItem value="9">9 cuotas</SelectItem>
                        <SelectItem value="12">12 cuotas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Results */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Cuota mensual:</span>
                      <span className="text-2xl font-bold text-gray-900">
                        ${calculateInstallment().toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Total a pagar:</span>
                      <span className="text-lg font-semibold text-gray-900">
                        ${getTotalAmount().toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Interés total:</span>
                      <span
                        className={`text-lg font-semibold ${getInterestAmount() > 0 ? "text-red-600" : "text-green-600"}`}
                      >
                        ${getInterestAmount().toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                      </span>
                    </div>

                    {paymentMethod === "debit" && (
                      <div className="flex items-center gap-2 text-green-700 bg-green-100 p-3 rounded-lg">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">¡Sin interés con tarjeta de débito!</span>
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
                    asChild
                  >
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Consultar financiación
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Payment Methods */}
            <AnimatedSection animation="fadeRight">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-6 h-6 text-green-600" />
                      Métodos de Pago Disponibles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Efectivo</span>
                      </div>
                      <Badge className="bg-green-500">10% descuento</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Transferencia bancaria</span>
                      </div>
                      <Badge className="bg-blue-500">5% descuento</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-gray-600" />
                        <span className="font-medium">Tarjeta de débito</span>
                      </div>
                      <Badge variant="outline">Sin interés</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">Tarjeta de crédito</span>
                      </div>
                      <Badge className="bg-purple-500">Hasta 12 cuotas</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Percent className="w-6 h-6 text-orange-600" />
                      Tasas de Interés
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">0%</p>
                          <p className="text-sm text-gray-600">3 cuotas sin interés</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">15%</p>
                          <p className="text-sm text-gray-600">6 cuotas</p>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                          <p className="text-2xl font-bold text-yellow-600">25%</p>
                          <p className="text-sm text-gray-600">9 cuotas</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <p className="text-2xl font-bold text-red-600">35%</p>
                          <p className="text-sm text-gray-600">12 cuotas</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">Tarjeta de débito:</p>
                          <p>Todas las cuotas sin interés hasta 12 meses</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </AnimatedSection>
          </div>

          {/* Benefits */}
          <AnimatedSection animation="fadeUp">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Aprobación inmediata</h3>
                  <p className="text-gray-600">
                    Procesamos tu solicitud al instante y te confirmamos la aprobación en minutos.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Sin papeleos</h3>
                  <p className="text-gray-600">Proceso 100% digital. Solo necesitás tu DNI y tarjeta para comenzar.</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Mejores tasas</h3>
                  <p className="text-gray-600">
                    Ofrecemos las tasas más competitivas del mercado para productos Apple.
                  </p>
                </CardContent>
              </Card>
            </div>
          </AnimatedSection>

          {/* FAQ */}
          <AnimatedSection animation="fadeUp">
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-2xl">Preguntas Frecuentes sobre Financiación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">¿Qué documentación necesito?</h4>
                      <p className="text-gray-600 text-sm">
                        Solo necesitás tu DNI y la tarjeta con la que vas a pagar. No se requieren recibos de sueldo ni
                        garantías.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">¿Puedo cambiar la cantidad de cuotas?</h4>
                      <p className="text-gray-600 text-sm">
                        Sí, podés modificar la cantidad de cuotas antes de confirmar la compra según tu conveniencia.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">¿Hay límite de monto para financiar?</h4>
                      <p className="text-gray-600 text-sm">
                        El límite depende de tu tarjeta de crédito. Consultanos para montos superiores a $2.000.000.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">¿Puedo pagar antes de tiempo?</h4>
                      <p className="text-gray-600 text-sm">
                        Sí, podés cancelar anticipadamente sin penalidades. Los intereses se calculan solo por el tiempo
                        utilizado.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* CTA */}
          <AnimatedSection animation="fadeUp" delay={200}>
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4">¿Listo para financiar tu compra?</h2>
                <p className="text-blue-100 mb-6 text-lg">
                  Contactanos por WhatsApp y te ayudamos a encontrar la mejor opción de financiación
                </p>
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg"
                  asChild
                >
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-6 h-6 mr-3" />
                    Consultar financiación
                  </a>
                </Button>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </div>
  )
}
