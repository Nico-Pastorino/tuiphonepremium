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
import { Smartphone, Tablet, Monitor, Watch, Headphones, Cable, ArrowDown, Star, Zap, Shield } from "lucide-react"
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

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/portada.jpg"
            alt="Apple Products Collection"
            fill
            className="object-contain object-center"
            priority
            sizes="100vw"
          />
          {/* Overlay */}
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
              <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed">
                Los mejores productos Apple con garantía oficial y financiación flexible
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
                <Button
                  onClick={scrollToProducts}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Ver Productos
                </Button>
                <Link href="/cuotas">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 bg-transparent"
                  >
                    Ver Cuotas
                  </Button>
                </Link>
              </div>
            </div>
          </AnimatedSection>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <Button
              variant="ghost"
              size="sm"
              onClick={scrollToProducts}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-full"
            >
              <ArrowDown className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">¿Por qué elegirnos?</h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Más de 5 años brindando la mejor experiencia Apple en Argentina
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
                    <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[1.5]" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-base sm:text-lg">{feature.description}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 sm:py-20 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Explora nuestras categorías
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Encuentra el producto Apple perfecto para ti
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
              {categories.map((category) => (
                <Link key={category.id} href={`/productos?category=${category.id}`}>
                  <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 shadow-md">
                    <CardContent className="p-4 sm:p-6 text-center">
                      <div
                        className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r ${category.gradient} rounded-2xl sm:rounded-3xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <category.icon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white stroke-[1.5]" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base md:text-lg mb-1 sm:mb-2">
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
        <section className="py-16 sm:py-20 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="text-center mb-12 sm:mb-16">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Star className="w-6 h-6 text-yellow-500 fill-current" />
                  <Badge variant="outline" className="text-yellow-700 border-yellow-300 bg-yellow-50">
                    Destacados
                  </Badge>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">Productos destacados</h2>
                <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                  Los productos más populares y mejor valorados
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="text-center mt-12">
                <Link href="/productos">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 bg-transparent"
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
      <section id="productos" className="py-16 sm:py-20 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Todos nuestros productos
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                {dollarRate && <>Precios actualizados al dólar blue: ${dollarRate.blue.toLocaleString("es-AR")}</>}
              </p>
            </div>

            {/* Filters */}
            <div className="mb-8 sm:mb-12">
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
              <div className="text-center py-12 sm:py-16">
                <div className="text-6xl sm:text-8xl mb-4">📱</div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">No se encontraron productos</h3>
                <p className="text-gray-600 mb-6">Intenta ajustar los filtros o explora otras categorías</p>
                <Button
                  onClick={() => {
                    setSelectedCategory(null)
                    setSelectedCondition(null)
                    setPriceRange([0, 5000000])
                  }}
                  variant="outline"
                  className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
