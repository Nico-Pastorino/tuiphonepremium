"use client"

import { useState } from "react"
import { MinimalNavbar } from "@/components/MinimalNavbar"
import { ProductCard } from "@/components/ProductCard"
import { ProductFilters } from "@/components/ProductFilters"
import { ProductsLoading } from "@/components/ProductsLoading"
import { AnimatedSection } from "@/components/AnimatedSection"
import { useProducts } from "@/contexts/ProductContext"
import { useAdmin } from "@/contexts/AdminContext"
import { useDollarRate } from "@/hooks/use-dollar-rate"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Smartphone,
  Tablet,
  Monitor,
  Watch,
  Headphones,
  Cable,
  ArrowDown,
  Star,
  Zap,
  Shield,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const categories = [
  {
    id: "iphone",
    name: "iPhone",
    icon: Smartphone,
    gradient: "from-gray-900 to-gray-700",
    description: "Lo último en tecnología móvil",
  },
  {
    id: "ipad",
    name: "iPad",
    icon: Tablet,
    gradient: "from-blue-600 to-blue-800",
    description: "Creatividad sin límites",
  },
  {
    id: "mac",
    name: "Mac",
    icon: Monitor,
    gradient: "from-gray-600 to-gray-800",
    description: "Potencia profesional",
  },
  {
    id: "watch",
    name: "Apple Watch",
    icon: Watch,
    gradient: "from-red-500 to-pink-600",
    description: "Tu salud en tu muñeca",
  },
  {
    id: "airpods",
    name: "AirPods",
    icon: Headphones,
    gradient: "from-purple-600 to-purple-800",
    description: "Audio excepcional",
  },
  {
    id: "accesorios",
    name: "Accesorios",
    icon: Cable,
    gradient: "from-yellow-500 to-orange-600",
    description: "Complementa tu experiencia",
  },
]

const features = [
  {
    icon: Star,
    title: "Productos Originales",
    description: "Garantía Apple oficial",
  },
  {
    icon: Zap,
    title: "Entrega Rápida",
    description: "Envío en 24-48 horas",
  },
  {
    icon: Shield,
    title: "Garantía Extendida",
    description: "Protección total",
  },
]

export default function HomePage() {
  const { products, loading } = useProducts()
  const { getEffectiveDollarRate } = useAdmin()
  const { dollarRate } = useDollarRate()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000])

  // Filtrar productos
  const filteredProducts = products.filter((product) => {
    if (selectedCategory && product.category !== selectedCategory) return false
    if (selectedCondition && product.condition !== selectedCondition) return false
    if (product.price < priceRange[0] || product.price > priceRange[1]) return false
    return true
  })

  // Productos destacados
  const featuredProducts = products.filter((product) => product.featured).slice(0, 6)

  const scrollToProducts = () => {
    document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-white">
      <MinimalNavbar />

      {/* Hero Section - Mobile Optimized */}
      <section className="relative hero-height flex items-center justify-center overflow-hidden">
        {/* Background Image - Mobile Optimized */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/portada.jpg"
            alt="Apple Products Collection"
            fill
            className="hero-image"
            priority
            sizes="100vw"
          />
          {/* Mobile-Optimized Overlay */}
          <div className="absolute inset-0 hero-mobile-overlay backdrop-blur-[0.5px]" />
        </div>

        {/* Content - Mobile Optimized */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 safe-area-inset-top">
          <AnimatedSection>
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-900 mb-3 xs:mb-4 sm:mb-6 md:mb-8 leading-tight">
                Tu iPhone
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Premium
                </span>
              </h1>
              <p className="text-base xs:text-lg sm:text-xl md:text-2xl text-gray-700 mb-6 xs:mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed px-2">
                Los mejores productos Apple con garantía oficial y financiación flexible
              </p>
              <div className="flex flex-col sm:flex-row gap-3 xs:gap-4 sm:gap-6 justify-center items-center px-4">
                <Button
                  onClick={scrollToProducts}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 xs:px-8 py-3 xs:py-4 text-base xs:text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full xs:w-auto touch-target"
                >
                  Ver Productos
                </Button>
                <Link href="/cuotas" className="w-full xs:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 xs:px-8 py-3 xs:py-4 text-base xs:text-lg font-semibold rounded-full transition-all duration-300 bg-white/80 backdrop-blur-sm w-full touch-target"
                  >
                    Ver Cuotas
                  </Button>
                </Link>
              </div>
            </div>
          </AnimatedSection>

          {/* Scroll Indicator - Mobile Optimized */}
          <div className="absolute scroll-indicator left-1/2 transform -translate-x-1/2 animate-bounce">
            <Button
              variant="ghost"
              size="sm"
              onClick={scrollToProducts}
              className="text-gray-600 hover:text-gray-900 p-2 xs:p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 touch-target"
            >
              <ArrowDown className="w-5 h-5 xs:w-6 xs:h-6" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 xs:py-16 sm:py-20 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-8 xs:mb-12 sm:mb-16">
              <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 xs:mb-4">
                ¿Por qué elegirnos?
              </h2>
              <p className="text-base xs:text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                Más de 5 años brindando la mejor experiencia Apple en Argentina
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 xs:gap-8 sm:gap-12">
              {features.map((feature, index) => (
                <div key={index} className="text-center px-4">
                  <div className="inline-flex items-center justify-center w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4 xs:mb-6">
                    <feature.icon className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-white stroke-[1.5]" />
                  </div>
                  <h3 className="text-lg xs:text-xl sm:text-2xl font-semibold text-gray-900 mb-2 xs:mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm xs:text-base sm:text-lg">{feature.description}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 xs:py-16 sm:py-20 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-8 xs:mb-12 sm:mb-16">
              <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 xs:mb-4">
                Explora nuestras categorías
              </h2>
              <p className="text-base xs:text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                Encuentra el producto Apple perfecto para ti
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 xs:gap-4 sm:gap-6 lg:gap-8">
              {categories.map((category) => (
                <Link key={category.id} href={`/productos?category=${category.id}`}>
                  <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 shadow-md touch-target">
                    <CardContent className="p-3 xs:p-4 sm:p-6 text-center">
                      <div
                        className={`inline-flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r ${category.gradient} rounded-xl xs:rounded-2xl sm:rounded-3xl mb-2 xs:mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <category.icon className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white stroke-[1.5]" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-xs xs:text-sm sm:text-base md:text-lg mb-1 sm:mb-2">
                        {category.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">{category.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="py-12 xs:py-16 sm:py-20 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="text-center mb-8 xs:mb-12 sm:mb-16">
                <div className="flex items-center justify-center gap-2 mb-3 xs:mb-4">
                  <Star className="w-5 h-5 xs:w-6 xs:h-6 text-yellow-500 fill-current" />
                  <Badge variant="outline" className="text-yellow-700 border-yellow-300 bg-yellow-50">
                    Destacados
                  </Badge>
                </div>
                <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 xs:mb-4">
                  Productos destacados
                </h2>
                <p className="text-base xs:text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                  Los productos más populares y mejor valorados
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="text-center mt-8 xs:mt-12">
                <Link href="/productos">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 xs:px-8 py-3 xs:py-4 text-base xs:text-lg font-semibold rounded-full transition-all duration-300 bg-transparent touch-target"
                  >
                    Ver todos los productos
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* All Products Section */}
      <section id="productos" className="py-12 xs:py-16 sm:py-20 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-8 xs:mb-12 sm:mb-16">
              <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 xs:mb-4">
                Todos nuestros productos
              </h2>
              <p className="text-base xs:text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                {dollarRate && <>Precios actualizados al dólar blue: ${dollarRate.blue.toLocaleString("es-AR")}</>}
              </p>
            </div>

            {/* Filters */}
            <div className="mb-6 xs:mb-8 sm:mb-12">
              <ProductFilters
                selectedCategory={selectedCategory}
                selectedCondition={selectedCondition}
                priceRange={priceRange}
                onCategoryChange={setSelectedCategory}
                onConditionChange={setSelectedCondition}
                onPriceRangeChange={setPriceRange}
              />
            </div>

            {/* Products Grid */}
            {loading ? (
              <ProductsLoading />
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 xs:py-12 sm:py-16">
                <div className="text-4xl xs:text-6xl sm:text-8xl mb-3 xs:mb-4">📱</div>
                <h3 className="text-lg xs:text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-gray-600 mb-4 xs:mb-6 px-4">
                  Intenta ajustar los filtros o explora otras categorías
                </p>
                <Button
                  onClick={() => {
                    setSelectedCategory(null)
                    setSelectedCondition(null)
                    setPriceRange([0, 5000000])
                  }}
                  variant="outline"
                  className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 touch-target"
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
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
                <Button
                  asChild
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white rounded-lg touch-target"
                >
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
                    className="text-xs xs:text-sm sm:text-base text-gray-300 hover:text-white transition-colors touch-target"
                  >
                    Productos
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cuotas"
                    className="text-xs xs:text-sm sm:text-base text-gray-300 hover:text-white transition-colors touch-target"
                  >
                    Financiación
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contacto"
                    className="text-xs xs:text-sm sm:text-base text-gray-300 hover:text-white transition-colors touch-target"
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
