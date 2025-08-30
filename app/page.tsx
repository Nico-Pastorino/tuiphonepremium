"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Smartphone, Tablet, Monitor, Cable, Star, ArrowDown } from "lucide-react"
import { EnhancedNavbar } from "@/components/EnhancedNavbar"
import { AnimatedSection } from "@/components/AnimatedSection"
import { useAdmin } from "@/contexts/AdminContext"

const categories = [
  {
    id: "iphone",
    name: "iPhone",
    icon: Smartphone,
    gradient: "from-gray-900 to-black",
    description: "La última tecnología en smartphones",
    href: "/productos?category=iphone",
  },
  {
    id: "ipad",
    name: "iPad",
    icon: Tablet,
    gradient: "from-blue-600 to-blue-800",
    description: "Potencia y versatilidad en tus manos",
    href: "/productos?category=ipad",
  },
  {
    id: "mac",
    name: "Mac",
    icon: Monitor,
    gradient: "from-gray-600 to-gray-800",
    description: "Rendimiento profesional sin límites",
    href: "/productos?category=mac",
  },
  {
    id: "accesorios",
    name: "Accesorios",
    icon: Cable,
    gradient: "from-yellow-500 to-orange-600",
    description: "Complementa tu experiencia Apple",
    href: "/productos?category=accesorios",
  },
]

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const { getEffectiveDollarRate } = useAdmin()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <EnhancedNavbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/portada.jpg"
            alt="Productos Apple Premium"
            fill
            className="object-contain object-center"
            sizes="100vw"
            priority
            quality={95}
          />
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 mt-20 sm:mt-24 md:mt-28 pt-8 sm:pt-12 md:pt-16">
          <AnimatedSection>
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 leading-tight">
                Tu iPhone
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Premium
                </span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-700 mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed">
                Los mejores productos Apple con financiación flexible y entrega inmediata
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-black hover:bg-gray-800 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 min-h-[48px] sm:min-h-[56px]"
                >
                  <Link href="/productos">Ver Productos</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-8 py-4 text-lg font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 min-h-[48px] sm:min-h-[56px] bg-transparent"
                >
                  <Link href="/cuotas">Ver Cuotas</Link>
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="animate-bounce">
            <ArrowDown className="w-6 h-6 text-gray-600" strokeWidth={1.5} />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-12 sm:mb-16 md:mb-20">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
                Explora Nuestras
                <span className="block text-blue-600">Categorías</span>
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Encuentra el producto Apple perfecto para ti
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10">
            {categories.map((category, index) => {
              const Icon = category.icon
              return (
                <AnimatedSection key={category.id} delay={index * 0.1}>
                  <Link href={category.href}>
                    <Card className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl overflow-hidden h-full">
                      <CardContent className="p-6 sm:p-8 md:p-10 text-center h-full flex flex-col justify-between">
                        <div>
                          <div
                            className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 mx-auto mb-4 sm:mb-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${category.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg`}
                          >
                            <Icon
                              className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white"
                              strokeWidth={1.5}
                            />
                          </div>
                          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors duration-300">
                            {category.name}
                          </h3>
                          <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                            {category.description}
                          </p>
                        </div>
                        <div className="mt-6 sm:mt-8">
                          <Badge
                            variant="outline"
                            className="text-xs sm:text-sm font-medium text-blue-600 border-blue-200 bg-blue-50 px-3 py-1 rounded-full"
                          >
                            Ver productos
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-12 sm:mb-16 md:mb-20">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
                ¿Por qué elegir
                <span className="block text-blue-600">Tu iPhone Premium?</span>
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
            <AnimatedSection delay={0.1}>
              <div className="text-center group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 sm:mb-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg">
                  <Star className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Productos Originales
                </h3>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                  Garantía oficial Apple con todos los accesorios incluidos
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="text-center group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 sm:mb-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg">
                  <Cable className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Financiación Flexible
                </h3>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                  Hasta 12 cuotas sin interés con todas las tarjetas
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <div className="text-center group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 sm:mb-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg">
                  <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Entrega Inmediata
                </h3>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                  Stock disponible para entrega el mismo día
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  )
}
