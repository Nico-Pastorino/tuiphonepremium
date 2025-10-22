"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { MinimalNavbar } from "@/components/MinimalNavbar"
import { AnimatedSection } from "@/components/AnimatedSection"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageCircle, Mail, Phone, MapPin, Clock, Send, Instagram, Facebook, Twitter } from "lucide-react"
import { useAdmin } from "@/contexts/AdminContext"

const formatWhatsappNumber = (value: string) => {
  const digits = value.replace(/\D/g, "")

  if (digits.startsWith("549") && digits.length >= 11) {
    const area = digits.slice(3, 5)
    const firstPart = digits.slice(5, 9)
    const secondPart = digits.slice(9)

    if (firstPart && secondPart) {
      return `+54 9 ${area} ${firstPart}-${secondPart}`
    }
  }

  if (digits.length > 0) {
    return `+${digits}`
  }

  return "+54 9 11 1234-5678"
}

export default function ContactPage() {
  const { homeConfig } = useAdmin()
  const whatsappNumber = useMemo(() => {
    const rawNumber = homeConfig.whatsappNumber?.trim()
    return rawNumber && rawNumber.length > 0 ? rawNumber : "5491112345678"
  }, [homeConfig.whatsappNumber])
  const whatsappLink = useMemo(() => `https://wa.me/${whatsappNumber}`, [whatsappNumber])
  const formattedWhatsappNumber = useMemo(() => formatWhatsappNumber(whatsappNumber), [whatsappNumber])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    productInterest: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí se manejaría el envío del formulario
    console.log("Form submitted:", formData)
    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      productInterest: "",
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavbar />

      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <AnimatedSection animation="fadeUp">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Contactanos</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                ¿Tenés alguna pregunta? Estamos aquí para ayudarte. Contactanos por cualquiera de estos medios.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <AnimatedSection animation="fadeLeft">
                <div className="space-y-6">
                  {/* WhatsApp */}
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                          <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">WhatsApp</h3>
                          <p className="text-sm text-gray-600">Respuesta inmediata</p>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4">{formattedWhatsappNumber}</p>
                      <Button className="w-full bg-green-500 hover:bg-green-600" asChild>
                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                          Escribir por WhatsApp
                        </a>
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Email */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Mail className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Email</h3>
                          <p className="text-sm text-gray-600">Respuesta en 24hs</p>
                        </div>
                      </div>
                      <p className="text-gray-700">info@tuiphonepremium.com.ar</p>
                    </CardContent>
                  </Card>

                  {/* Phone */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                          <Phone className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Teléfono</h3>
                          <p className="text-sm text-gray-600">Lun a Vie 9-18hs</p>
                        </div>
                      </div>
                      <p className="text-gray-700">+54 11 1234-5678</p>
                    </CardContent>
                  </Card>

                  {/* Location */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Ubicación</h3>
                          <p className="text-sm text-gray-600">Buenos Aires, Argentina</p>
                        </div>
                      </div>
                      <p className="text-gray-700">
                        Palermo, CABA
                        <br />
                        Retiro por showroom con cita previa
                      </p>
                    </CardContent>
                  </Card>

                  {/* Hours */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                          <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Horarios</h3>
                          <p className="text-sm text-gray-600">Atención al cliente</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-gray-700">
                        <p>Lunes a Viernes: 9:00 - 18:00</p>
                        <p>Sábados: 10:00 - 16:00</p>
                        <p>Domingos: Cerrado</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </AnimatedSection>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <AnimatedSection animation="fadeRight">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Envianos un mensaje</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nombre completo *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            required
                            placeholder="Tu nombre"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            required
                            placeholder="tu@email.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Teléfono</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            placeholder="+54 9 11 1234-5678"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="productInterest">Producto de interés</Label>
                          <Select
                            value={formData.productInterest}
                            onValueChange={(value) => handleInputChange("productInterest", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar producto" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="iphone">iPhone</SelectItem>
                              <SelectItem value="ipad">iPad</SelectItem>
                              <SelectItem value="mac">Mac</SelectItem>
                              <SelectItem value="watch">Apple Watch</SelectItem>
                              <SelectItem value="airpods">AirPods</SelectItem>
                              <SelectItem value="otros">Otros</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Asunto *</Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => handleInputChange("subject", e.target.value)}
                          required
                          placeholder="¿En qué podemos ayudarte?"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Mensaje *</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => handleInputChange("message", e.target.value)}
                          required
                          rows={5}
                          placeholder="Contanos más detalles sobre tu consulta..."
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 text-lg"
                      >
                        <Send className="w-5 h-5 mr-2" />
                        Enviar mensaje
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </div>

          {/* Social Media */}
          <AnimatedSection animation="fadeUp">
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Seguinos en redes sociales</h2>
                <p className="text-blue-100 mb-6">Mantente al día con las últimas novedades y ofertas especiales</p>
                <div className="flex justify-center gap-4">
                  <Button variant="secondary" size="lg" className="bg-white/20 hover:bg-white/30 text-white">
                    <Instagram className="w-5 h-5 mr-2" />
                    Instagram
                  </Button>
                  <Button variant="secondary" size="lg" className="bg-white/20 hover:bg-white/30 text-white">
                    <Facebook className="w-5 h-5 mr-2" />
                    Facebook
                  </Button>
                  <Button variant="secondary" size="lg" className="bg-white/20 hover:bg-white/30 text-white">
                    <Twitter className="w-5 h-5 mr-2" />
                    Twitter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* FAQ Section */}
          <AnimatedSection animation="fadeUp" delay={200}>
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Preguntas frecuentes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">¿Los productos tienen garantía?</h3>
                    <p className="text-gray-600">
                      Sí, todos nuestros productos incluyen garantía de 12 meses y soporte técnico especializado.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">¿Hacen envíos a todo el país?</h3>
                    <p className="text-gray-600">
                      Realizamos envíos gratuitos en CABA y GBA. Para el interior consultá costos de envío.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">¿Aceptan productos en parte de pago?</h3>
                    <p className="text-gray-600">
                      Sí, evaluamos tu equipo actual y te ofrecemos el mejor precio como parte de pago.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">¿Qué formas de pago aceptan?</h3>
                    <p className="text-gray-600">
                      Efectivo, transferencia bancaria, tarjetas de crédito y débito. Financiación hasta 12 cuotas.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  )
}
