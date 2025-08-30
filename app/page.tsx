"use client"

import { useState, useEffect } from "react"
import { MinimalNavbar } from "@/components/MinimalNavbar"
import { ProductGrid } from "@/components/ProductGrid"
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
  Zap,
  Award,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import type { Product } from "@/types/product"

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("featured", true)
          .eq("active", true)
          .limit(8)

        if (error) {
          console.error("Error fetching featured products:", error)
          setFeaturedProducts([])
        } else {
          setFeaturedProducts(data || [])
        }
      } catch (error) {
        console.error("Error:", error)
        setFeaturedProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  const categories = [
    {
      name: "iPhone",
      icon: Smartphone,
      href: "/productos?category=iphone",
      gradient: "from-gray-900 to-gray-700",
    },
    {
      name: "iPad",
      icon: Tablet,
      href: "/productos?category=ipad",
      gradient: "from-blue-600 to-blue-800",
    },
    {
      name: "Mac",
      icon: Monitor,
      href: "/productos?category=mac",
      gradient: "from-gray-600 to-gray-800",
    },
    {
      name: "Accesorios",
      icon: Cable,
      href: "/productos?category=accesorios",
      gradient: "from-yellow-500 to-orange-600",
    },
  ]

  const benefits = [
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
      icon: CreditCard,
      title: "Financiación",
      description: "Hasta 12 cuotas sin interés con tarjetas de crédito",
      gradient: "from-purple-500 to-violet-600",
    },
    {
      icon: Zap,
      title: "Entrega Rápida",
      description: "Recibí tu producto en 24-48hs en CABA y GBA",
      gradient: "from-yellow-500 to-orange-600",
    },
  ]

  const stats = [
    { icon: Award, value: "5000+", label: "Productos Vendidos" },
    { icon: Users, value: "2500+", label: "Clientes Satisfechos" },
    { icon: Clock, value: "24/7", label: "Atención al Cliente" },
    { icon: CheckCircle, value: "99%", label: "Satisfacción" },
  ]

  return (
    <div className="min-h-screen bg-white">
      <MinimalNavbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/portada.jpg')",
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />

        <div className="relative z-10 text-center px-4 mt-20 sm:mt-24 md:mt-28 pt-8 sm:pt-12 md:pt-16">
          <AnimatedSection animation="fadeUp">
            <Badge
              variant="outline"
              className="mb-6 text-sm font-medium text-blue-600 border-blue-200 bg-white/80 backdrop-blur-sm px-4 py-2"
            >
              <Star className="w-4 h-4 mr-2 fill-current" />
              Productos Apple Premium
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Tu iPhone Premium
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Te Está Esperando
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Descubrí la mejor selección de productos Apple con garantía oficial, financiación flexible y envío gratis
              a todo el país.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg"
                asChild
              >
                <Link href="/productos">
                  Ver Productos
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-semibold px-8 py-4 rounded-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm text-lg"
                asChild
              >
                <Link href="/contacto">
                  <MessageCircle className="mr-2 w-5 h-5" />
                  Contactanos
                </Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeUp" className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">Explorá por Categoría</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Encontrá exactamente lo que buscás en nuestra amplia selección de productos Apple
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {categories.map((category, index) => (
              <AnimatedSection key={category.name} animation="fadeUp" delay={index * 100}>
                <Link href={category.href}>
                  <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0 bg-white overflow-hidden">
                    <CardContent className="p-6 sm:p-8 text-center">
                      <div
                        className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${category.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                      >
                        <category.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                        {category.name}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeUp" className="text-center mb-16">
            <Badge
              variant="outline"
              className="mb-4 text-sm font-medium text-purple-600 border-purple-200 bg-purple-50 px-4 py-2"
            >
              <Star className="w-4 h-4 mr-2 fill-current" />
              Destacados
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">Productos Destacados</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Los productos más populares y mejor valorados por nuestros clientes
            </p>
          </AnimatedSection>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-2xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <ProductGrid products={featuredProducts} showViewAll={true} />
          )}
        </div>
      </section>

      {/* Financing Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeUp" className="text-center mb-16">
            <Badge
              variant="outline"
              className="mb-4 text-sm font-medium text-blue-600 border-blue-200 bg-white px-4 py-2"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Financiación
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">Comprá Como Quieras</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Múltiples opciones de pago para que puedas acceder a tu producto Apple ideal
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Visa/Mastercard */}
            <AnimatedSection animation="fadeUp" delay={0}>
              <Card className="h-full hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0 bg-white overflow-hidden">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                    <CreditCard className="w-8 h-8 text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Visa / Mastercard</h3>
                  <div className="space-y-3 text-left">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">1 cuota</span>
                      <span className="font-semibold text-green-600">Sin interés</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">3 cuotas</span>
                      <span className="font-semibold text-green-600">Sin interés</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">6 cuotas</span>
                      <span className="font-semibold text-blue-600">15% anual</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">9 cuotas</span>
                      <span className="font-semibold text-blue-600">20% anual</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">12 cuotas</span>
                      <span className="font-semibold text-blue-600">25% anual</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Naranja */}
            <AnimatedSection animation="fadeUp" delay={100}>
              <Card className="h-full hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0 bg-white overflow-hidden">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
                    <CreditCard className="w-8 h-8 text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Naranja</h3>
                  <div className="space-y-3 text-left">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">1 cuota</span>
                      <span className="font-semibold text-green-600">Sin interés</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">3 cuotas</span>
                      <span className="font-semibold text-orange-600">10% anual</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">6 cuotas</span>
                      <span className="font-semibold text-orange-600">18% anual</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">9 cuotas</span>
                      <span className="font-semibold text-orange-600">22% anual</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">12 cuotas</span>
                      <span className="font-semibold text-orange-600">28% anual</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Transferencia */}
            <AnimatedSection animation="fadeUp" delay={200}>
              <Card className="h-full hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0 bg-white overflow-hidden relative">
                <div className="absolute top-4 right-4">
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold">
                    Recomendado
                  </Badge>
                </div>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Transferencia</h3>
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-green-600 mb-2">10% OFF</div>
                    <p className="text-gray-600">Descuento por pago en efectivo o transferencia bancaria</p>
                  </div>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center py-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-600">Pago inmediato</span>
                    </div>
                    <div className="flex items-center py-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-600">Sin comisiones</span>
                    </div>
                    <div className="flex items-center py-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-600">Mejor precio</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeUp" className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">¿Por Qué Elegirnos?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Más de 5 años brindando la mejor experiencia en productos Apple
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <AnimatedSection key={benefit.title} animation="fadeUp" delay={index * 100}>
                <Card className="h-full text-center hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0 bg-white">
                  <CardContent className="p-8">
                    <div
                      className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center`}
                    >
                      <benefit.icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeUp" className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">Números que Nos Respaldan</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              La confianza de miles de clientes nos motiva a seguir mejorando cada día
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <AnimatedSection key={stat.label} animation="fadeUp" delay={index * 100}>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <stat.icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-gray-300">{stat.label}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <AnimatedSection animation="fadeUp">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">¿Listo para tu Nuevo Apple?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Descubrí nuestra colección completa y encontrá el producto perfecto para vos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg"
                asChild
              >
                <Link href="/productos">
                  Ver Todos los Productos
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 rounded-2xl transition-all duration-300 text-lg bg-transparent"
                asChild
              >
                <Link href="/contacto">
                  <MessageCircle className="mr-2 w-5 h-5" />
                  Contactanos
                </Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">TuiPhonePremium</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Tu tienda de confianza para productos Apple. Más de 5 años brindando la mejor experiencia en tecnología
                premium.
              </p>
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-400 hover:text-white hover:border-white bg-transparent"
                >
                  Instagram
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-400 hover:text-white hover:border-white bg-transparent"
                >
                  WhatsApp
                </Button>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Productos</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/productos?category=iphone" className="hover:text-white transition-colors">
                    iPhone
                  </Link>
                </li>
                <li>
                  <Link href="/productos?category=ipad" className="hover:text-white transition-colors">
                    iPad
                  </Link>
                </li>
                <li>
                  <Link href="/productos?category=mac" className="hover:text-white transition-colors">
                    Mac
                  </Link>
                </li>
                <li>
                  <Link href="/productos?category=accesorios" className="hover:text-white transition-colors">
                    Accesorios
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Información</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/cuotas" className="hover:text-white transition-colors">
                    Financiación
                  </Link>
                </li>
                <li>
                  <Link href="/contacto" className="hover:text-white transition-colors">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Garantía
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Envíos
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TuiPhonePremium. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
