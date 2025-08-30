"use client"

import { Suspense } from "react"
import { MinimalNavbar } from "@/components/MinimalNavbar"
import { ProductGrid } from "@/components/ProductGrid"
import { ProductsLoading } from "@/components/ProductsLoading"
import { AnimatedSection } from "@/components/AnimatedSection"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Smartphone,
  Tablet,
  Monitor,
  Cable,
  Star,
  Shield,
  Truck,
  CreditCard,
  DollarSign,
  Zap,
  CheckCircle,
  ArrowRight,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <MinimalNavbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/portada.jpg"
            alt="Productos Apple Premium"
            fill
            className="object-contain object-center"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 mt-20 sm:mt-24 md:mt-28 pt-8 sm:pt-12 md:pt-16">
          <AnimatedSection>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Tu iPhone
              </span>
              <br />
              <span className="text-gray-800">Premium</span>
            </h1>
            <p className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-700 mb-6 sm:mb-8 md:mb-10 max-w-4xl mx-auto leading-relaxed">
              Los mejores productos Apple con <span className="font-semibold text-blue-600">garantía oficial</span> y{" "}
              <span className="font-semibold text-purple-600">financiación flexible</span>
            </p>
            <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 sm:gap-6 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="w-full xs:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-sm xs:text-base sm:text-lg px-6 xs:px-8 sm:px-12 py-3 xs:py-4 sm:py-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/productos">
                  Ver Productos
                  <ArrowRight className="ml-2 w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full xs:w-auto border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold text-sm xs:text-base sm:text-lg px-6 xs:px-8 sm:px-12 py-3 xs:py-4 sm:py-6 rounded-xl sm:rounded-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
              >
                <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
                  Consultar
                </a>
              </Button>
            </div>
          </AnimatedSection>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="animate-bounce">
            <div className="w-5 h-8 xs:w-6 xs:h-10 sm:w-8 sm:h-12 border-2 border-gray-400 rounded-full flex justify-center">
              <div className="w-1 h-2 xs:w-1.5 xs:h-3 sm:w-2 sm:h-4 bg-gray-400 rounded-full mt-2 xs:mt-2.5 sm:mt-3 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">
                Nuestras Categorías
              </h2>
              <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                Encuentra el producto Apple perfecto para ti
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-6 md:gap-8">
            {[
              {
                name: "iPhone",
                icon: Smartphone,
                gradient: "from-gray-800 to-black",
                href: "/productos?category=iphone",
                description: "Los últimos modelos",
              },
              {
                name: "iPad",
                icon: Tablet,
                gradient: "from-blue-500 to-blue-700",
                href: "/productos?category=ipad",
                description: "Potencia y versatilidad",
              },
              {
                name: "Mac",
                icon: Monitor,
                gradient: "from-gray-500 to-gray-700",
                href: "/productos?category=mac",
                description: "Rendimiento profesional",
              },
              {
                name: "Accesorios",
                icon: Cable,
                gradient: "from-yellow-500 to-orange-600",
                href: "/productos?category=accesorios",
                description: "Complementa tu experiencia",
              },
            ].map((category) => (
              <Link key={category.name} href={category.href}>
                <Card className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-0 shadow-lg bg-white rounded-2xl sm:rounded-3xl overflow-hidden h-full">
                  <CardContent className="p-4 xs:p-6 sm:p-8 text-center">
                    <div
                      className={`w-12 h-12 xs:w-16 xs:h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-3 xs:mb-4 sm:mb-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${category.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <category.icon
                        className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white"
                        strokeWidth={1.5}
                      />
                    </div>
                    <h3 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 xs:mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs xs:text-sm sm:text-base text-gray-600 leading-relaxed">
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4 md:mb-6">
                <Star className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 text-yellow-500 fill-current" />
                <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
                  Productos Destacados
                </h2>
                <Star className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 text-yellow-500 fill-current" />
              </div>
              <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                Los productos más populares con las mejores ofertas
              </p>
            </div>
          </AnimatedSection>

          <Suspense fallback={<ProductsLoading />}>
            <ProductGrid featured={true} limit={8} />
          </Suspense>

          <AnimatedSection>
            <div className="text-center mt-8 sm:mt-12 md:mt-16">
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600 font-semibold text-sm xs:text-base sm:text-lg px-6 xs:px-8 sm:px-12 py-3 xs:py-4 sm:py-6 rounded-xl sm:rounded-2xl transition-all duration-300 bg-transparent"
              >
                <Link href="/productos">
                  Ver Todos los Productos
                  <ArrowRight className="ml-2 w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
                </Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Financing Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">
                Opciones de Financiación
              </h2>
              <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                Elige la forma de pago que mejor se adapte a ti
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xs:gap-6 sm:gap-8">
            {/* Visa/Mastercard */}
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg bg-white rounded-2xl sm:rounded-3xl overflow-hidden">
              <CardContent className="p-4 xs:p-6 sm:p-8">
                <div className="text-center mb-4 xs:mb-6 sm:mb-8">
                  <div className="w-12 h-12 xs:w-16 xs:h-16 sm:w-20 sm:h-20 mx-auto mb-3 xs:mb-4 sm:mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
                    <CreditCard className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 mb-2 xs:mb-3">
                    Visa / Mastercard
                  </h3>
                  <p className="text-xs xs:text-sm sm:text-base text-gray-600">Las mejores cuotas del mercado</p>
                </div>
                <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center p-2 xs:p-3 bg-blue-50 rounded-lg">
                    <span className="text-xs xs:text-sm sm:text-base font-medium text-blue-900">1 cuota</span>
                    <Badge className="bg-green-100 text-green-800 text-xs xs:text-sm">Sin interés</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 xs:p-3 bg-blue-50 rounded-lg">
                    <span className="text-xs xs:text-sm sm:text-base font-medium text-blue-900">3 cuotas</span>
                    <Badge className="bg-green-100 text-green-800 text-xs xs:text-sm">Sin interés</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 xs:p-3 bg-blue-50 rounded-lg">
                    <span className="text-xs xs:text-sm sm:text-base font-medium text-blue-900">6 cuotas</span>
                    <span className="text-xs xs:text-sm sm:text-base text-blue-700 font-semibold">15% TEA</span>
                  </div>
                  <div className="flex justify-between items-center p-2 xs:p-3 bg-blue-50 rounded-lg">
                    <span className="text-xs xs:text-sm sm:text-base font-medium text-blue-900">12 cuotas</span>
                    <span className="text-xs xs:text-sm sm:text-base text-blue-700 font-semibold">25% TEA</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Naranja */}
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg bg-white rounded-2xl sm:rounded-3xl overflow-hidden">
              <CardContent className="p-4 xs:p-6 sm:p-8">
                <div className="text-center mb-4 xs:mb-6 sm:mb-8">
                  <div className="w-12 h-12 xs:w-16 xs:h-16 sm:w-20 sm:h-20 mx-auto mb-3 xs:mb-4 sm:mb-6 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-lg">
                    <Smartphone className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 mb-2 xs:mb-3">Naranja</h3>
                  <p className="text-xs xs:text-sm sm:text-base text-gray-600">Cuotas especiales Naranja</p>
                </div>
                <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center p-2 xs:p-3 bg-orange-50 rounded-lg">
                    <span className="text-xs xs:text-sm sm:text-base font-medium text-orange-900">1 cuota</span>
                    <Badge className="bg-green-100 text-green-800 text-xs xs:text-sm">Sin interés</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 xs:p-3 bg-orange-50 rounded-lg">
                    <span className="text-xs xs:text-sm sm:text-base font-medium text-orange-900">3 cuotas</span>
                    <span className="text-xs xs:text-sm sm:text-base text-orange-700 font-semibold">10% TEA</span>
                  </div>
                  <div className="flex justify-between items-center p-2 xs:p-3 bg-orange-50 rounded-lg">
                    <span className="text-xs xs:text-sm sm:text-base font-medium text-orange-900">6 cuotas</span>
                    <span className="text-xs xs:text-sm sm:text-base text-orange-700 font-semibold">18% TEA</span>
                  </div>
                  <div className="flex justify-between items-center p-2 xs:p-3 bg-orange-50 rounded-lg">
                    <span className="text-xs xs:text-sm sm:text-base font-medium text-orange-900">12 cuotas</span>
                    <span className="text-xs xs:text-sm sm:text-base text-orange-700 font-semibold">30% TEA</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transferencia */}
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg bg-white rounded-2xl sm:rounded-3xl overflow-hidden">
              <CardContent className="p-4 xs:p-6 sm:p-8">
                <div className="text-center mb-4 xs:mb-6 sm:mb-8">
                  <div className="w-12 h-12 xs:w-16 xs:h-16 sm:w-20 sm:h-20 mx-auto mb-3 xs:mb-4 sm:mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg">
                    <DollarSign className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 mb-2 xs:mb-3">Transferencia</h3>
                  <p className="text-xs xs:text-sm sm:text-base text-gray-600">El mejor precio al contado</p>
                </div>
                <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center p-2 xs:p-3 bg-green-50 rounded-lg">
                    <span className="text-xs xs:text-sm sm:text-base font-medium text-green-900">Descuento</span>
                    <Badge className="bg-green-500 text-white text-xs xs:text-sm font-bold">10% OFF</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 xs:p-3 bg-green-50 rounded-lg">
                    <span className="text-xs xs:text-sm sm:text-base font-medium text-green-900">Pago inmediato</span>
                    <CheckCircle className="w-4 h-4 xs:w-5 xs:h-5 text-green-600" />
                  </div>
                  <div className="flex justify-between items-center p-2 xs:p-3 bg-green-50 rounded-lg">
                    <span className="text-xs xs:text-sm sm:text-base font-medium text-green-900">Sin comisiones</span>
                    <CheckCircle className="w-4 h-4 xs:w-5 xs:h-5 text-green-600" />
                  </div>
                  <div className="flex justify-between items-center p-2 xs:p-3 bg-green-50 rounded-lg">
                    <span className="text-xs xs:text-sm sm:text-base font-medium text-green-900">Mejor precio</span>
                    <CheckCircle className="w-4 h-4 xs:w-5 xs:h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">
                ¿Por qué elegirnos?
              </h2>
              <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                Tu tranquilidad es nuestra prioridad
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 sm:gap-8">
            {[
              {
                icon: Shield,
                title: "Garantía Oficial",
                description: "Todos nuestros productos cuentan con garantía oficial Apple",
                gradient: "from-green-500 to-emerald-600",
              },
              {
                icon: Truck,
                title: "Envío Gratis",
                description: "Envío gratuito a todo el país en compras superiores a $50.000",
                gradient: "from-blue-500 to-cyan-600",
              },
              {
                icon: Zap,
                title: "Entrega Rápida",
                description: "Recibí tu producto en 24-48hs en CABA y GBA",
                gradient: "from-yellow-500 to-orange-600",
              },
              {
                icon: CreditCard,
                title: "Financiación Flexible",
                description: "Múltiples opciones de pago y financiación sin interés",
                gradient: "from-purple-500 to-pink-600",
              },
              {
                icon: CheckCircle,
                title: "Productos Originales",
                description: "100% originales importados directamente de Apple",
                gradient: "from-indigo-500 to-blue-600",
              },
              {
                icon: MessageCircle,
                title: "Atención Personalizada",
                description: "Soporte técnico y asesoramiento personalizado",
                gradient: "from-teal-500 to-green-600",
              },
            ].map((benefit, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg bg-white rounded-2xl sm:rounded-3xl overflow-hidden hover:-translate-y-1"
              >
                <CardContent className="p-4 xs:p-6 sm:p-8 text-center">
                  <div
                    className={`w-12 h-12 xs:w-16 xs:h-16 sm:w-20 sm:h-20 mx-auto mb-3 xs:mb-4 sm:mb-6 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <benefit.icon className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 mb-2 xs:mb-3 sm:mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-xs xs:text-sm sm:text-base text-gray-600 leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 md:mb-6">
              ¿Listo para tu nuevo Apple?
            </h2>
            <p className="text-sm xs:text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-8 md:mb-10 leading-relaxed">
              Consultanos por WhatsApp y te ayudamos a encontrar el producto perfecto para ti
            </p>
            <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 sm:gap-6 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="w-full xs:w-auto bg-white text-blue-600 hover:bg-gray-100 font-bold text-sm xs:text-base sm:text-lg px-6 xs:px-8 sm:px-12 py-3 xs:py-4 sm:py-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
                  Consultar por WhatsApp
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full xs:w-auto border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold text-sm xs:text-base sm:text-lg px-6 xs:px-8 sm:px-12 py-3 xs:py-4 sm:py-6 rounded-xl sm:rounded-2xl transition-all duration-300 bg-transparent"
              >
                <Link href="/productos">
                  Ver Catálogo
                  <ArrowRight className="ml-2 w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
                </Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8 md:mb-12">
            {/* Logo y descripción */}
            <div className="lg:col-span-2">
              <h3 className="text-xl xs:text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Tu iPhone Premium
                </span>
              </h3>
              <p className="text-xs xs:text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                Tu tienda de confianza para productos Apple. Garantía oficial, mejores precios y atención personalizada.
              </p>
              <div className="flex space-x-3 sm:space-x-4">
                <Button asChild size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-lg">
                  <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4 xs:w-5 xs:h-5" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Enlaces rápidos */}
            <div>
              <h4 className="text-base xs:text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Enlaces</h4>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <Link
                    href="/productos"
                    className="text-xs xs:text-sm sm:text-base text-gray-300 hover:text-white transition-colors"
                  >
                    Productos
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cuotas"
                    className="text-xs xs:text-sm sm:text-base text-gray-300 hover:text-white transition-colors"
                  >
                    Financiación
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contacto"
                    className="text-xs xs:text-sm sm:text-base text-gray-300 hover:text-white transition-colors"
                  >
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <h4 className="text-base xs:text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Contacto</h4>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-center text-xs xs:text-sm sm:text-base text-gray-300">
                  <Phone className="w-3 h-3 xs:w-4 xs:h-4 mr-2 flex-shrink-0" />
                  +54 9 11 1234-5678
                </li>
                <li className="flex items-center text-xs xs:text-sm sm:text-base text-gray-300">
                  <Mail className="w-3 h-3 xs:w-4 xs:h-4 mr-2 flex-shrink-0" />
                  info@tuiphonepremium.com
                </li>
                <li className="flex items-start text-xs xs:text-sm sm:text-base text-gray-300">
                  <MapPin className="w-3 h-3 xs:w-4 xs:h-4 mr-2 mt-0.5 flex-shrink-0" />
                  Buenos Aires, Argentina
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 sm:pt-8">
            <div className="flex flex-col xs:flex-row justify-between items-center gap-3 xs:gap-4">
              <p className="text-xs xs:text-sm text-gray-400 text-center xs:text-left">
                © 2024 Tu iPhone Premium. Todos los derechos reservados.
              </p>
              <p className="text-xs xs:text-sm text-gray-400 text-center xs:text-right">Hecho con ❤️ en Argentina</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
