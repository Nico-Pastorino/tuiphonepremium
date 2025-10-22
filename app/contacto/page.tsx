"use client"

import { useMemo } from "react"
import { MinimalNavbar } from "@/components/MinimalNavbar"
import { AnimatedSection } from "@/components/AnimatedSection"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Mail, Phone, MapPin, Clock, Instagram, Music4 } from "lucide-react"
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
  const contactEmail = "tuiphonepremium@gmail.com"
  const contactMailto = `mailto:${contactEmail}`

  const instagramUrl = "https://www.instagram.com/tuiphonepremium"
  const tiktokUrl = "https://www.tiktok.com/@tu.iphone.premium?_t=ZS-90ljWaLjkxh&_r=1"

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavbar />

      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeUp">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
              <h1 className="text-4xl font-bold text-gray-900">Contactanos</h1>
              <p className="text-lg text-gray-600">
                Tenes alguna pregunta? Estamos para ayudarte. Elegi el canal que prefieras y resolvemos tu consulta en minutos.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fadeUp" delay={100}>
            <Card className="mb-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl">
              <CardContent className="p-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">Atencion personalizada</h2>
                  <p className="text-blue-100 max-w-2xl">
                    Un asesor del equipo responde rapido sobre disponibilidad, entregas y opciones de pago. Escribinos y coordinamos tu compra ideal.
                  </p>
                </div>
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50" asChild>
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Hablar por WhatsApp
                  </a>
                </Button>
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection animation="fadeUp" delay={150}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-6">
              <div>
                <h2 className="text-3xl font-semibold text-gray-900">Canales de contacto</h2>
                <p className="text-gray-600">
                  Elegi el medio que mas te guste y nos ponemos en contacto enseguida.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
              <Card className="border border-green-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">WhatsApp</h3>
                      <p className="text-sm text-gray-600">Respuesta inmediata</p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-lg font-semibold">{formattedWhatsappNumber}</p>
                  <Button className="w-full bg-green-500 hover:bg-green-600" asChild>
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                      Escribir por WhatsApp
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Email</h3>
                      <p className="text-sm text-gray-600">Respondemos dentro del dia</p>
                    </div>
                  </div>
                  <a
                    href={contactMailto}
                    className="text-gray-700 text-lg font-semibold break-all hover:text-blue-600 transition-colors"
                  >
                    {contactEmail}
                  </a>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Telefono</h3>
                      <p className="text-sm text-gray-600">Lunes a viernes 9-18 hs</p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-lg font-semibold">+54 11 1234-5678</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm transition-shadow hover:shadow-md md:col-span-2 xl:col-span-2">
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Ubicacion</h3>
                      <p className="text-sm text-gray-600">Buenos Aires, Argentina</p>
                    </div>
                  </div>
                  <div className="text-gray-700">
                    <p className="font-semibold">Palermo, CABA</p>
                    <p>Coordinamos retiros en showroom con cita previa.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Horarios</h3>
                      <p className="text-sm text-gray-600">Atencion al cliente</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-gray-700">
                    <p>Lunes a viernes: 9:00 - 18:00</p>
                    <p>Sabados: 10:00 - 16:00</p>
                    <p>Domingos: Cerrado</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fadeUp">
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white mb-16">
              <CardContent className="p-8 text-center space-y-6">
                <h2 className="text-2xl font-bold">Seguinos en redes sociales</h2>
                <p className="text-blue-100">Descubri lanzamientos, ofertas y contenido exclusivo de la comunidad.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button variant="secondary" size="lg" className="bg-white/20 hover:bg-white/30 text-white" asChild>
                    <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
                      <Instagram className="w-5 h-5 mr-2" />
                      Instagram
                    </a>
                  </Button>
                  <Button variant="secondary" size="lg" className="bg-white/20 hover:bg-white/30 text-white" asChild>
                    <a href={tiktokUrl} target="_blank" rel="noopener noreferrer">
                      <Music4 className="w-5 h-5 mr-2" />
                      TikTok
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection animation="fadeUp" delay={200}>
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Preguntas frecuentes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">Los productos tienen garantia?</h3>
                    <p className="text-gray-600">
                      Si, todos los productos incluyen 12 meses de garantia y soporte tecnico especializado.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">Hacen envios a todo el pais?</h3>
                    <p className="text-gray-600">
                      Enviamos sin costo en CABA y GBA. Para el interior coordinamos logistica y tarifas preferenciales.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">Aceptan productos en parte de pago?</h3>
                    <p className="text-gray-600">
                      Si, evaluamos tu equipo actual y lo tomamos como parte de pago para que actualices al mejor precio.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">Que formas de pago aceptan?</h3>
                    <p className="text-gray-600">
                      Trabajamos con efectivo, transferencia, tarjetas de credito y debito, y financiacion hasta 12 cuotas.
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
