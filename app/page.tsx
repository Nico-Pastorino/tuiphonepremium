"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  AlertCircle,
  ArrowDown,
  ArrowLeftRight,
  ArrowRight,
  Award,
  Cable,
  CreditCard,
  Headphones,
  Laptop,
  Mail,
  MapPin,
  MessageCircle,
  RefreshCw,
  Shield,
  Smartphone,
  Tablet,
  Truck,
  Watch,
} from "lucide-react"

import { MinimalNavbar } from "@/components/MinimalNavbar"
import { ProductCard } from "@/components/ProductCard"
import { ProductsLoading } from "@/components/ProductsLoading"
import { AnimatedSection } from "@/components/AnimatedSection"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProducts } from "@/contexts/ProductContext"
import { useAdmin } from "@/contexts/AdminContext"
import type { TradeInConditionId, TradeInStorageId } from "@/types/trade-in"
import type { HomeSectionId } from "@/types/home"
import { DEFAULT_HOME_CONFIG } from "@/lib/home-config"

const DEFAULT_SECTION_LABELS: Record<HomeSectionId, string> = DEFAULT_HOME_CONFIG.sections.reduce(
  (acc, section) => {
    acc[section.id] = section.label
    return acc
  },
  {} as Record<HomeSectionId, string>,
)

export default function HomePage() {
  const { products, loading, error, supabaseConnected, refreshProducts } = useProducts()
  const { homeConfig, tradeInConfig } = useAdmin()
  const sectionLabels = useMemo(() => {
    const labels: Record<HomeSectionId, string> = { ...DEFAULT_SECTION_LABELS }
    homeConfig.sections.forEach((section) => {
      labels[section.id] = section.label
    })
    return labels
  }, [homeConfig.sections])

  const tradeInConditionLabels: Record<TradeInConditionId, string> = {
    under90: "-90%",
    over90: "90+",
  }

  const tradeInOptions = useMemo(
    () =>
      tradeInConfig.sections.flatMap((section) =>
        section.rows.map((row) => ({
          value: `${section.id}::${row.id}`,
          label: `${section.title} · ${row.label}`,
          sectionId: section.id,
          rowId: row.id,
        })),
      ),
    [tradeInConfig.sections],
  )

  const [selectedModelKey, setSelectedModelKey] = useState(() => tradeInOptions[0]?.value ?? "")
  useEffect(() => {
    if (tradeInOptions.length === 0) {
      setSelectedModelKey("")
      return
    }
    setSelectedModelKey((previous) =>
      tradeInOptions.some((option) => option.value === previous) ? previous : tradeInOptions[0].value,
    )
  }, [tradeInOptions])

  const selectedOption = useMemo(
    () => tradeInOptions.find((option) => option.value === selectedModelKey) ?? null,
    [tradeInOptions, selectedModelKey],
  )

  const selectedSection = useMemo(
    () => tradeInConfig.sections.find((section) => section.id === selectedOption?.sectionId) ?? null,
    [tradeInConfig.sections, selectedOption],
  )

  const selectedRow = useMemo(
    () => selectedSection?.rows.find((row) => row.id === selectedOption?.rowId) ?? null,
    [selectedSection, selectedOption],
  )

  const availableStorageOptions = useMemo(
    () => {
      if (!selectedSection || !selectedRow) {
        return [] as { id: TradeInStorageId; label: string }[]
      }
      return selectedSection.storageColumns
        .filter((column) => {
          const values = selectedRow.values[column.id]
          return values.under90 !== null || values.over90 !== null
        })
        .map((column) => ({ id: column.id, label: column.label }))
    },
    [selectedSection, selectedRow],
  )

  const [selectedStorageId, setSelectedStorageId] = useState<TradeInStorageId | null>(
    () => availableStorageOptions[0]?.id ?? null,
  )
  useEffect(() => {
    if (availableStorageOptions.length === 0) {
      setSelectedStorageId(null)
      return
    }
    setSelectedStorageId((previous) =>
      previous && availableStorageOptions.some((option) => option.id === previous)
        ? previous
        : availableStorageOptions[0].id,
    )
  }, [availableStorageOptions])

  const [selectedCondition, setSelectedCondition] = useState<TradeInConditionId>("over90")

  const usdFormatter = useMemo(
    () =>
      new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }),
    [],
  )

  const selectedValue =
    selectedRow && selectedStorageId ? selectedRow.values[selectedStorageId][selectedCondition] : null
  const formattedTradeInValue = selectedValue !== null ? usdFormatter.format(selectedValue) : null
  const whatsappLink = `https://wa.me/${homeConfig.whatsappNumber}`

  const tradeInWhatsappLines: string[] = ["Quiero realizar el plan canje"]

  const modelParts: string[] = []
  if (selectedSection?.title) {
    modelParts.push(selectedSection.title)
  }
  if (selectedRow?.label) {
    modelParts.push(selectedRow.label)
  }
  if (modelParts.length > 0) {
    tradeInWhatsappLines.push(`Modelo: ${modelParts.join(" - ")}`)
  }

  const storageLabel = availableStorageOptions.find((option) => option.id === selectedStorageId)?.label ?? null
  if (storageLabel) {
    tradeInWhatsappLines.push(`Capacidad: ${storageLabel}`)
  }

  const conditionLabel = tradeInConditionLabels[selectedCondition]
  if (conditionLabel) {
    tradeInWhatsappLines.push(`Condicion de bateria: ${conditionLabel}`)
  }

  if (formattedTradeInValue) {
    tradeInWhatsappLines.push(`Valor estimado: ${formattedTradeInValue}`)
  }

  const tradeInWhatsappMessage = tradeInWhatsappLines.join("\n")
  const tradeInWhatsappLink = `${whatsappLink}?text=${encodeURIComponent(tradeInWhatsappMessage)}`

  const featuredProducts = useMemo(() => products.filter((product) => product.featured).slice(0, 8), [products])
  const enabledSections = homeConfig.sections.filter((section) => section.enabled)
  const firstSectionId = enabledSections[0]?.id

  const heroImage = homeConfig.heroImage || "/portada.jpg"

  const categoriesSection = (
    <AnimatedSection animation="fadeUp">
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50" id="productos">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fadeUp" className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">
              {sectionLabels.categories}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Encontrá el dispositivo ideal dentro de nuestra selección premium de productos Apple
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {[
              {
                icon: Smartphone,
                name: "iPhone",
                count: `${products.filter((p) => p.category === "iphone").length}+ modelos`,
                href: "/productos?category=iphone",
                description: "Los últimos lanzamientos",
              },
              {
                icon: Tablet,
                name: "iPad",
                count: `${products.filter((p) => p.category === "ipad").length}+ modelos`,
                href: "/productos?category=ipad",
                description: "Herramientas versátiles para trabajar y crear",
              },
              {
                icon: Laptop,
                name: "Mac",
                count: `${products.filter((p) => p.category === "mac").length}+ modelos`,
                href: "/productos?category=mac",
                description: "Potencia profesional para cualquier desafío",
              },
              {
                icon: Watch,
                name: "Apple Watch",
                count: `${products.filter((p) => p.category === "watch").length}+ modelos`,
                href: "/productos?category=watch",
                description: "Tu bienestar siempre a mano",
              },
              {
                icon: Headphones,
                name: "AirPods",
                count: `${products.filter((p) => p.category === "airpods").length}+ modelos`,
                href: "/productos?category=airpods",
                description: "Sonido envolvente para cada momento",
              },
              {
                icon: Cable,
                name: "Accesorios",
                count: `${products.filter((p) => p.category === "accesorios").length}+ productos`,
                href: "/productos?category=accesorios",
                description: "Accesorios imprescindibles para tu ecosistema",
              },
            ].map((category, index) => (
              <AnimatedSection key={category.name} animation="scale" delay={index * 100}>
                <Link href={category.href}>
                  <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm overflow-hidden rounded-xl sm:rounded-2xl h-full bg-white">
                    <CardContent className="p-3 sm:p-4 md:p-6 text-center h-full flex flex-col justify-between">
                      <div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-2 sm:mb-3 md:mb-4 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                          <category.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                        </div>
                        <h3 className="font-bold text-sm sm:text-base md:text-lg lg:text-xl text-gray-900 group-hover:text-blue-600 transition-colors mb-1 sm:mb-2">
                          {category.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2 hidden sm:block">
                          {category.description}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">{category.count}</p>
                    </CardContent>
                  </Card>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </AnimatedSection>
  )

  const featuredSection = (
    <AnimatedSection animation="fadeUp">
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fadeUp" className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">
              {sectionLabels.featured}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Los favoritos de nuestra comunidad, con la mejor valoración
            </p>
          </AnimatedSection>

          {loading ? (
            <ProductsLoading />
          ) : error && !supabaseConnected ? (
            <div className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Usando datos de ejemplo</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 px-4">Para ver datos reales, configura Supabase</p>
              <Button onClick={refreshProducts} variant="outline" className="border-gray-300 bg-transparent">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar conexión
              </Button>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {featuredProducts.map((product, index) => (
                <AnimatedSection key={product.id} animation="fadeUp" delay={index * 100}>
                  <ProductCard product={product} variant="default" />
                </AnimatedSection>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Smartphone className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No hay productos destacados</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 px-4">
                Los productos aparecerán aquí en cuanto los agreguemos
              </p>
            </div>
          )}

          {featuredProducts.length > 0 && (
            <AnimatedSection animation="fadeUp" delay={400} className="text-center mt-12 sm:mt-16">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-300 shadow-lg text-base sm:text-lg"
              >
                <Link href="/productos">
                  Ver todos los productos
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </Button>
            </AnimatedSection>
          )}
        </div>
      </section>
    </AnimatedSection>
  )

  const benefitsSection = (
    <AnimatedSection animation="fadeUp">
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fadeUp" className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">
              {sectionLabels.benefits}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Beneficios que nos convierten en tu mejor opcion Apple
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Shield,
                title: "Garantia extendida",
                description: "12 meses de garantia total y soporte tecnico especializado",
                features: ["Soporte 24/7", "Reparacion gratuita", "Reemplazo inmediato"],
              },
              {
                icon: Truck,
                title: "Envio express",
                description: "Envio gratuito en CABA y GBA en menos de 24 horas",
                features: ["Envio gratis", "Tracking en tiempo real", "Seguro incluido"],
              },
              {
                icon: Award,
                title: "Calidad premium",
                description: "Productos verificados y certificados con garantia de autenticidad",
                features: ["100% originales", "Certificacion Apple", "Prueba de calidad"],
              },
            ].map((benefit, index) => (
              <AnimatedSection key={benefit.title} animation="fadeUp" delay={index * 200}>
                <Card className="text-center border-0 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl sm:rounded-2xl h-full bg-white">
                  <CardContent className="p-6 sm:p-8 h-full flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <benefit.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">{benefit.title}</h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{benefit.description}</p>
                    </div>
                    <div className="space-y-2">
                      {benefit.features.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-600"
                        >
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </AnimatedSection>
  )

  const tradeInSection = (
    <AnimatedSection animation="fadeUp">
      <section className="py-12 sm:py-16 md:py-20 bg-blue-50" data-anchor="trade-in">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr,1fr]">
            <div className="space-y-4 sm:space-y-5">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                <ArrowLeftRight className="w-4 h-4" />
                Plan canje
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                {homeConfig.tradeInTitle || "Plan canje"}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-xl">
                {homeConfig.tradeInSubtitle || "Tomamos tu Apple usado y te ayudamos a renovar tu equipo."}
              </p>
              <div className="rounded-2xl border border-blue-100 bg-white p-4 sm:p-5 shadow-sm">
                <p className="text-sm font-semibold text-blue-700">Cómo funciona</p>
                <p className="mt-1 text-sm text-blue-600 leading-relaxed">
                  Elegí el modelo, capacidad y estado de batería para conocer el valor estimado que podemos ofrecerte por tu equipo usado.
                </p>
              </div>
            </div>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 sm:p-8 space-y-5">
                {tradeInOptions.length === 0 ? (
                  <div className="flex flex-col items-center text-center gap-3 text-gray-500">
                    <AlertCircle className="w-10 h-10 text-gray-400" />
                    <p className="text-base font-semibold text-gray-700">Valores próximamente</p>
                    <p className="text-sm">
                      Estamos preparando la información de canje para tus equipos. Vuelve a intentarlo en unas horas.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Modelo</label>
                      <Select value={selectedModelKey} onValueChange={setSelectedModelKey}>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Elegí un modelo" />
                        </SelectTrigger>
                        <SelectContent>
                          {tradeInOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Capacidad</label>
                        <Select
                          value={selectedStorageId ?? ""}
                          onValueChange={(value) => setSelectedStorageId(value as TradeInStorageId)}
                          disabled={availableStorageOptions.length === 0}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Seleccioná la capacidad" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableStorageOptions.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Condición de batería</label>
                        <Select
                          value={selectedCondition}
                          onValueChange={(value) => setSelectedCondition(value as TradeInConditionId)}
                          disabled={!selectedStorageId}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Condición" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(tradeInConditionLabels).map(([conditionId, label]) => (
                              <SelectItem key={conditionId} value={conditionId}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-gray-900 text-white p-6 space-y-2">
                      <p className="text-xs uppercase tracking-widest text-white/60">Valor estimado</p>
                      <p className="text-3xl sm:text-4xl font-semibold">
                        {formattedTradeInValue ?? "No disponible"}
                      </p>
                      <p className="text-xs text-white/60 leading-relaxed">
                        Los montos son referenciales y pueden ajustarse luego de revisar físicamente tu equipo.
                      </p>
                    </div>
                    <Button
                      asChild
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-300"
                    >
                      <a href={tradeInWhatsappLink} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Coordinar evaluación
                      </a>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </AnimatedSection>
  )

const ctaSection = (
    <AnimatedSection animation="scale">
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto text-white">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                ¡Encontra tu Apple acá!
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-8 px-4">
                Hablá con nuestro equipo por WhatsApp, recibí cotizaciones y financiacion a medida en minutos.
              </p>
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-50 font-semibold px-8 sm:px-10 py-3 sm:py-4 rounded-xl text-base sm:text-lg transition-all duration-300 shadow-lg"
            >
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                Escribinos por WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
    </AnimatedSection>
  )

  const sectionMap = {
    categories: categoriesSection,
    featured: featuredSection,
    benefits: benefitsSection,
    "trade-in": tradeInSection,
    cta: ctaSection,
  }

  return (
    <div className="min-h-screen bg-white">
      <MinimalNavbar />

      <section className="relative w-full overflow-hidden">
        <div className="relative w-full h-screen min-h-[600px] max-h-[900px] sm:min-h-[700px] md:min-h-[800px]">
          <div className="absolute inset-0">
            <Image
              src={heroImage || "/placeholder.svg"}
              alt="Lineup de iPhone sobre fondo espacial oscuro"
              fill
              className="object-cover hero-image"
              priority
              quality={90}
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10 sm:bg-gradient-to-t sm:from-black/60 sm:via-black/20 sm:to-transparent md:bg-gradient-to-r md:from-black/60 md:via-black/30 md:to-transparent"></div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
            <div className="w-full max-w-4xl mx-auto text-center">
              <AnimatedSection animation="fadeUp">
                <div className="space-y-4 sm:space-y-6 md:space-y-8">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] sm:leading-tight">
                    {homeConfig.heroHeadline}
                  </h1>
                  <div className="max-w-2xl mx-auto">
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 leading-relaxed">
                      {homeConfig.heroSubheadline}
                      <span className="text-blue-300 font-medium block sm:inline mt-1 sm:mt-0">
                        {homeConfig.promoMessage}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 sm:pt-4">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-white text-gray-900 hover:bg-gray-50 font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-300 shadow-lg text-base sm:text-lg min-h-[48px]"
                      asChild
                    >
                      <Link href="/productos">
                        Explorar productos
                        <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-300 text-base sm:text-lg bg-white/20 backdrop-blur-sm min-h-[48px]"
                      asChild
                    >
                      <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                        Consultar por WhatsApp
                      </a>
                    </Button>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>

      </section>

      {enabledSections.map((section) => (
        <div key={section.id} data-home-section={section.id}>
          {sectionMap[section.id]}
        </div>
      ))}

      <AnimatedSection animation="fadeUp">
        <footer className="bg-gray-900 text-white py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-10 sm:gap-12 md:grid-cols-2 lg:grid-cols-[1.8fr_1fr_1fr] items-start mb-10 sm:mb-14">
              <AnimatedSection animation="fadeLeft">
                <div className="space-y-6">
                  <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left mb-4 sm:mb-6">
                    <div className="relative h-12 w-12 flex-shrink-0 sm:h-14 sm:w-14">
                      <Image src="/logo-final.png" alt="TuIphonepremium Logo" fill className="object-contain" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-2xl font-bold">TuIphonepremium</h3>
                      <p className="text-sm text-gray-400 sm:text-base">Tu socio Apple de confianza</p>
                    </div> 
                  </div>
                  <p className="max-w-xl text-center text-sm text-gray-400 leading-relaxed sm:text-left sm:text-base">
                    Elegimos los mejores iPhone, iPad, Mac y accesorios para que disfrutes tecnologia premium con garantia
                    oficial, financiacion flexible y asesoramiento cercano de expertos Apple.
                  </p>
                  <div className="grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-gray-200 sm:grid-cols-2 lg:grid-cols-3 sm:text-sm">
                    <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5">
                      <Truck className="h-4 w-4 text-blue-200" />
                      Envio en 24-48 hs
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5">
                      <Shield className="h-4 w-4 text-blue-200" />
                      Garantia oficial
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5">
                      <CreditCard className="h-4 w-4 text-blue-200" />
                      Financiacion flexible
                    </span>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection animation="fadeUp" delay={200}>
                <div className="space-y-4 sm:space-y-5 lg:pl-4">
                  <h4 className="font-bold text-base sm:text-lg">Productos</h4>
                  <ul className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-gray-400 sm:text-base lg:grid-cols-1">
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
                      <Link href="/productos?category=watch" className="hover:text-white transition-colors">
                        Apple Watch
                      </Link>
                    </li>
                    <li>
                      <Link href="/productos?category=airpods" className="hover:text-white transition-colors">
                        AirPods
                      </Link>
                    </li>
                    <li>
                      <Link href="/productos?category=accesorios" className="hover:text-white transition-colors">
                        Accesorios
                      </Link>
                    </li>
                  </ul>
                </div>
              </AnimatedSection>

              <AnimatedSection animation="fadeRight" delay={350}>
                <div className="space-y-6 lg:pl-4">
                  <h4 className="font-bold text-base sm:text-lg">Contacto</h4>
                  <div className="space-y-3 text-sm text-gray-300 sm:text-base">
                    <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                      <span className="rounded-lg bg-white/10 p-2">
                        <Smartphone className="h-4 w-4 text-blue-200" />
                      </span>
                      <div>
                        <p className="font-medium text-white">WhatsApp</p>
                        <p className="text-xs sm:text-sm">+{homeConfig.whatsappNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                      <span className="rounded-lg bg-white/10 p-2">
                        <Mail className="h-4 w-4 text-blue-200" />
                      </span>
                      <div>
                        <p className="font-medium text-white">Email</p>
                        <p className="text-xs sm:text-sm break-all">info@tuiphonepremium.com.ar</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                      <span className="rounded-lg bg-white/10 p-2">
                        <MapPin className="h-4 w-4 text-blue-200" />
                      </span>
                      <div>
                        <p className="font-medium text-white">Ubicacion</p>
                        <p className="text-xs sm:text-sm">Buenos Aires, Argentina</p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-1">
                    <Button
                      asChild
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-300 text-sm sm:text-base shadow-md"
                    >
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Escribir por WhatsApp
                      </a>
                    </Button>
                  </div>
                </div>
              </AnimatedSection>
            </div>

            <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-center text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:text-left sm:text-sm">
              <p>&copy; {new Date().getFullYear()} TuIphonepremium. Todos los derechos reservados.</p>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <Link href="/privacidad" className="hover:text-white transition-colors">
                  Politica de privacidad
                </Link>
                <span className="hidden sm:inline text-white/30">-</span>
                <Link href="/legales" className="hover:text-white transition-colors">
                  Terminos y condiciones
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </AnimatedSection>
    </div>
  )
}
