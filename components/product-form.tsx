"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus } from "lucide-react"
import { useAdmin } from "@/contexts/AdminContext"
import type { ImageLibraryItem } from "@/types/image-library"
import type { ProductFormData } from "@/types/product"
import { getAdminLibraryImageUrls, getProductThumbnailImageUrls } from "@/lib/image-cdn"
import { StorageImage } from "@/components/StorageImage"

interface ProductFormProps {
  onSubmit: (product: ProductFormData) => Promise<boolean>
  initialData?: Partial<ProductFormData>
  isLoading?: boolean
}

export function ProductForm({ onSubmit, initialData, isLoading = false }: ProductFormProps) {
  const { getEffectiveDollarRate } = useAdmin()
  const effectiveDollarRate = getEffectiveDollarRate()
  const outletEnabled = process.env.NEXT_PUBLIC_OUTLET_ENABLED === "true"
  const IMAGE_SELECTOR_PAGE_SIZE = 12

  const OUTLET_DEFECT_OPTIONS = [
    "No marca % de bateria",
    "Marca en pantalla",
    "Rayones",
    "Golpes en carcasa",
    "Sin Face ID",
    "Sin True Tone",
    "Camara con detalles",
    "Altavoz con detalles",
  ]

  const derivePriceFromUSD = (usd?: number | null) => {
    if (usd === undefined || usd === null || Number.isNaN(usd)) {
      return 0
    }
    return Number((usd * effectiveDollarRate).toFixed(2))
  }

  const initialPriceUSD =
    initialData?.priceUSD !== undefined
      ? initialData.priceUSD
      : initialData?.price !== undefined
        ? Number((initialData.price / effectiveDollarRate).toFixed(2))
        : undefined

  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price ?? derivePriceFromUSD(initialPriceUSD),
    originalPrice: initialData?.originalPrice ?? undefined,
    priceUSD: initialPriceUSD,
    category: initialData?.category || "",
    condition: initialData?.condition || "nuevo",
    images: initialData?.images || [],
    specifications: initialData?.specifications || {},
    stock: initialData?.stock ?? 0,
    featured: initialData?.featured || false,
    isOutlet: initialData?.isOutlet ?? false,
    outletNotes: initialData?.outletNotes ?? "",
    outletDefects: initialData?.outletDefects ?? [],
    outletBatteryPercent: initialData?.outletBatteryPercent ?? null,
    outletGrade: initialData?.outletGrade ?? "",
    outletWarrantyDays: initialData?.outletWarrantyDays ?? null,
    outletAccessories: initialData?.outletAccessories ?? "",
    outletDisplayIssues: initialData?.outletDisplayIssues ?? null,
    outletCaseIssues: initialData?.outletCaseIssues ?? null,
  })

  const [libraryCategoryFilter, setLibraryCategoryFilter] = useState<string>("todos")
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)
  const [libraryImages, setLibraryImages] = useState<ImageLibraryItem[]>([])
  const [libraryTotal, setLibraryTotal] = useState(0)
  const [libraryPage, setLibraryPage] = useState(1)
  const [libraryLoading, setLibraryLoading] = useState(false)
  const [librarySearch, setLibrarySearch] = useState("")

  useEffect(() => {
    if (formData.category && formData.category !== libraryCategoryFilter) {
      setLibraryCategoryFilter(formData.category)
    }
  }, [formData.category]) // Remover libraryCategoryFilter de las dependencias

  const libraryCategories = useMemo(() => {
    const categories = new Set(libraryImages.map((item) => item.category || "general"))
    return Array.from(categories).sort((a, b) => a.localeCompare(b))
  }, [libraryImages])
  const selectorCategoryOptions = useMemo(() => {
    const categories = new Set<string>(["todos"])
    if (formData.category) {
      categories.add(formData.category)
    }
    for (const category of libraryCategories) {
      categories.add(category)
    }
    return Array.from(categories)
  }, [formData.category, libraryCategories])

  const filteredLibraryImages = useMemo(() => {
    return libraryImages
  }, [libraryImages])
  const totalLibraryPages = Math.max(1, Math.ceil(libraryTotal / IMAGE_SELECTOR_PAGE_SIZE))

  const [newImage, setNewImage] = useState("")
  const [newSpecKey, setNewSpecKey] = useState("")
  const [newSpecValue, setNewSpecValue] = useState("")
  const [newDefect, setNewDefect] = useState("")

  useEffect(() => {
    setLibraryPage(1)
  }, [libraryCategoryFilter, librarySearch])

  useEffect(() => {
    if (!isLibraryOpen) {
      return
    }

    let active = true

    const loadLibraryPage = async () => {
      try {
        setLibraryLoading(true)
        const params = new URLSearchParams()
        params.set("limit", String(IMAGE_SELECTOR_PAGE_SIZE))
        params.set("offset", String((libraryPage - 1) * IMAGE_SELECTOR_PAGE_SIZE))
        if (libraryCategoryFilter !== "todos") {
          params.set("category", libraryCategoryFilter)
        }
        if (librarySearch.trim().length > 0) {
          params.set("search", librarySearch.trim())
        }

        const response = await fetch(`/api/admin/image-library?${params.toString()}`, { cache: "force-cache" })
        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || "No se pudo cargar la biblioteca de imagenes")
        }

        const result = (await response.json()) as { data?: ImageLibraryItem[]; total?: number }
        if (!active) {
          return
        }

        setLibraryImages(Array.isArray(result.data) ? result.data : [])
        setLibraryTotal(result.total ?? 0)
      } catch (error) {
        if (!active) {
          return
        }
        console.error("No se pudo cargar la biblioteca del selector:", error)
        setLibraryImages([])
        setLibraryTotal(0)
      } finally {
        if (active) {
          setLibraryLoading(false)
        }
      }
    }

    void loadLibraryPage()

    return () => {
      active = false
    }
  }, [isLibraryOpen, libraryPage, libraryCategoryFilter, librarySearch])

  const toggleDefect = (defect: string) => {
    setFormData((prev) => {
      const exists = prev.outletDefects?.includes(defect)
      const nextDefects = exists
        ? (prev.outletDefects ?? []).filter((item) => item !== defect)
        : [...(prev.outletDefects ?? []), defect]
      return { ...prev, outletDefects: nextDefects }
    })
  }

  const handleAddImageFromLibrary = (image: ImageLibraryItem) => {
    if (formData.images.includes(image.url)) {
      // Mostrar mensaje si la imagen ya esta agregada
      alert("Esta imagen ya esta agregada al producto")
      return
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, image.url],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const submissionData: ProductFormData = {
      ...formData,
      price: derivePriceFromUSD(formData.priceUSD),
      originalPrice: formData.originalPrice ?? undefined,
      stock: formData.stock ?? 0,
    }

    const success = await onSubmit(submissionData)
    if (success && !initialData) {
      setFormData({
        name: "",
        description: "",
        price: 0,
        originalPrice: undefined,
        priceUSD: undefined,
        category: "",
        condition: "nuevo",
        images: [],
        specifications: {},
        stock: 0,
        featured: false,
        isOutlet: false,
        outletNotes: "",
        outletDefects: [],
        outletBatteryPercent: null,
        outletGrade: "",
        outletWarrantyDays: null,
        outletAccessories: "",
        outletDisplayIssues: null,
        outletCaseIssues: null,
      })
      setNewDefect("")
    }
  }

  const addImage = () => {
    if (newImage.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImage.trim()],
      }))
      setNewImage("")
    }
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const addSpecification = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setFormData((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [newSpecKey.trim()]: newSpecValue.trim(),
        },
      }))
      setNewSpecKey("")
      setNewSpecValue("")
    }
  }

  const removeSpecification = (key: string) => {
    setFormData((prev) => {
      const newSpecs = { ...prev.specifications }
      delete newSpecs[key]
      return {
        ...prev,
        specifications: newSpecs,
      }
    })
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? "Editar Producto" : "Agregar Nuevo Producto"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informacion basica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del producto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="iPhone 15 Pro Max"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iphone">iPhone</SelectItem>
                  <SelectItem value="ipad">iPad</SelectItem>
                  <SelectItem value="mac">Mac</SelectItem>
                  <SelectItem value="watch">Apple Watch</SelectItem>
                  <SelectItem value="airpods">AirPods</SelectItem>
                  <SelectItem value="accesorios">Accesorios</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Descripcion detallada del producto..."
              rows={3}
            />
          </div>

          {/* Precio y condicion */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priceUSD">Precio en USD *</Label>
              <Input
                id="priceUSD"
                type="number"
                step="0.01"
                min="0"
                value={formData.priceUSD ?? ""}
                onChange={(e) => {
                  const value = e.target.value ? Number.parseFloat(e.target.value) : undefined
                  setFormData((prev) => ({
                    ...prev,
                    priceUSD: value,
                    price: derivePriceFromUSD(value),
                  }))
                }}
                placeholder="999.99"
                required
              />
              <p className="text-sm text-muted-foreground">
                Precio estimado en pesos: ${formData.price.toLocaleString("es-AR")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condicion *</Label>
              <Select
                value={formData.isOutlet ? "outlet" : formData.condition}
                onValueChange={(value) => {
                  const isOutletSelected = value === "outlet"
                  setFormData((prev) => ({
                    ...prev,
                    condition: isOutletSelected ? "seminuevo" : (value as any),
                    isOutlet: isOutletSelected,
                  }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar condicion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nuevo">Nuevo</SelectItem>
                  <SelectItem value="seminuevo">Seminuevo</SelectItem>
                  {outletEnabled && <SelectItem value="outlet">Outlet</SelectItem>}
                </SelectContent>
              </Select>
              {outletEnabled && formData.isOutlet && (
                <p className="text-xs text-orange-700">
                  Outlet habilita los detalles especiales para equipos con defectos.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, featured: checked }))}
            />
            <Label htmlFor="featured">Producto destacado</Label>
          </div>

          {outletEnabled && (
            <div className="space-y-4 rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
              <div>
                <p className="text-sm font-semibold text-orange-900">Outlet</p>
                <p className="text-xs text-orange-700">
                  Completa los detalles para equipos con defectos o detalles especiales.
                </p>
              </div>

              {formData.isOutlet && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="outletGrade">Estado general</Label>
                      <Select
                        value={formData.outletGrade ?? ""}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, outletGrade: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excelente">Excelente</SelectItem>
                          <SelectItem value="bueno">Bueno</SelectItem>
                          <SelectItem value="regular">Regular</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="outletBatteryPercent">Bateria (%)</Label>
                      <Input
                        id="outletBatteryPercent"
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={formData.outletBatteryPercent ?? ""}
                        onChange={(e) => {
                          const value = e.target.value ? Number.parseInt(e.target.value, 10) : null
                          setFormData((prev) => ({ ...prev, outletBatteryPercent: value }))
                        }}
                        placeholder="Ej: 87"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="outletWarrantyDays">Garantia (dias)</Label>
                      <Input
                        id="outletWarrantyDays"
                        type="number"
                        min="0"
                        step="1"
                        value={formData.outletWarrantyDays ?? ""}
                        onChange={(e) => {
                          const value = e.target.value ? Number.parseInt(e.target.value, 10) : null
                          setFormData((prev) => ({ ...prev, outletWarrantyDays: value }))
                        }}
                        placeholder="Ej: 30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="outletAccessories">Accesorios</Label>
                      <Input
                        id="outletAccessories"
                        value={formData.outletAccessories ?? ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, outletAccessories: e.target.value }))}
                        placeholder="Ej: sin cargador, solo caja"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Defectos / detalles</Label>
                    <div className="flex flex-wrap gap-2">
                      {OUTLET_DEFECT_OPTIONS.map((defect) => {
                        const active = formData.outletDefects?.includes(defect)
                        return (
                          <Button
                            key={defect}
                            type="button"
                            variant={active ? "default" : "outline"}
                            onClick={() => toggleDefect(defect)}
                            className={active ? "bg-orange-600 hover:bg-orange-700 text-white" : "text-gray-700"}
                          >
                            {defect}
                          </Button>
                        )
                      })}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newDefect}
                        onChange={(e) => setNewDefect(e.target.value)}
                        placeholder="Agregar detalle personalizado"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const value = newDefect.trim()
                          if (!value) return
                          toggleDefect(value)
                          setNewDefect("")
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="outletDisplayIssues"
                        checked={Boolean(formData.outletDisplayIssues)}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, outletDisplayIssues: checked }))
                        }
                      />
                      <Label htmlFor="outletDisplayIssues">Detalles en pantalla</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="outletCaseIssues"
                        checked={Boolean(formData.outletCaseIssues)}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, outletCaseIssues: checked }))}
                      />
                      <Label htmlFor="outletCaseIssues">Detalles en carcasa</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="outletNotes">Observaciones</Label>
                    <Textarea
                      id="outletNotes"
                      value={formData.outletNotes ?? ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, outletNotes: e.target.value }))}
                      placeholder="Ej: leve marca en esquina, sin cambios de pantalla..."
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Imagenes */}
          <div className="space-y-4">
            <Label>Imagenes del producto</Label>
            {formData.images.length > 0 && (
              <div className="space-y-2">
                <Label>Imagenes del producto ({formData.images.length})</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="relative h-24 w-full bg-gray-100 rounded-lg overflow-hidden border">
                        <StorageImage
                          src={getProductThumbnailImageUrls(image).thumbnail || "/placeholder.svg"}
                          optimizedSrc={getProductThumbnailImageUrls(image).optimized || "/placeholder.svg"}
                          originalSrc={getProductThumbnailImageUrls(image).original || "/placeholder.svg"}
                          alt={`Imagen ${index + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                          sizes="150px"
                          loading="lazy"
                          debugLabel={`ProductForm:selected:${index}`}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                placeholder="URL de la imagen"
                className="flex-1"
              />
              <Button type="button" onClick={addImage} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Biblioteca de imagenes</Label>
              <div className="flex flex-col gap-3 rounded-xl border border-dashed border-gray-200 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Selector bajo demanda</p>
                    <p className="text-xs text-muted-foreground">
                      La biblioteca solo se consulta cuando abres este panel.
                    </p>
                  </div>
                  <Button type="button" variant="outline" onClick={() => setIsLibraryOpen((prev) => !prev)}>
                    {isLibraryOpen ? "Ocultar biblioteca" : "Abrir biblioteca"}
                  </Button>
                </div>

                {!isLibraryOpen ? (
                  <p className="text-sm text-muted-foreground">
                    Abre la biblioteca para buscar imagenes por categoria o texto sin cargar toda la coleccion.
                  </p>
                ) : (
                  <>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                      <Input
                        value={librarySearch}
                        onChange={(e) => setLibrarySearch(e.target.value)}
                        placeholder="Buscar imagenes..."
                        className="lg:max-w-sm"
                      />
                      <Select value={libraryCategoryFilter} onValueChange={(value) => setLibraryCategoryFilter(value)}>
                        <SelectTrigger className="w-full lg:w-[220px]">
                          <SelectValue placeholder="Filtrar por categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todas las categorias</SelectItem>
                          {selectorCategoryOptions
                            .filter((category) => category !== "todos")
                            .map((category) => (
                              <SelectItem key={category} value={category} className="capitalize">
                                {category}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-muted-foreground">Haz clic en una imagen para agregarla al producto.</p>
                    {libraryLoading ? (
                      <p className="text-sm text-muted-foreground">Cargando imagenes...</p>
                    ) : filteredLibraryImages.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No hay imagenes para los filtros seleccionados.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                        {filteredLibraryImages.map((image) => (
                          <button
                            key={image.id}
                            type="button"
                            onClick={() => handleAddImageFromLibrary(image)}
                            className="group relative overflow-hidden rounded-lg border-2 border-gray-200 bg-white text-left shadow-sm transition-all hover:border-blue-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <div className="relative h-32 w-full bg-gray-100">
                              <StorageImage
                                src={getAdminLibraryImageUrls(image.url).thumbnail || "/placeholder.svg"}
                                optimizedSrc={getAdminLibraryImageUrls(image.url).optimized || "/placeholder.svg"}
                                originalSrc={getAdminLibraryImageUrls(image.url).original || "/placeholder.svg"}
                                alt={image.label}
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
                                loading="lazy"
                                debugLabel={`ProductForm:library:${image.id}`}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-blue-600 text-white rounded-full p-1">
                                  <Plus className="w-4 h-4" />
                                </div>
                              </div>
                            </div>
                            <div className="p-3 space-y-1">
                              <p className="text-sm font-medium text-gray-900 truncate">{image.label}</p>
                              <p className="text-xs text-gray-500 capitalize">{image.category}</p>
                              <p className="text-xs text-blue-600 font-medium group-hover:text-blue-700">
                                Hacer clic para agregar
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {libraryTotal > IMAGE_SELECTOR_PAGE_SIZE && (
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs text-muted-foreground">
                          Mostrando {(libraryPage - 1) * IMAGE_SELECTOR_PAGE_SIZE + 1}-
                          {Math.min(libraryPage * IMAGE_SELECTOR_PAGE_SIZE, libraryTotal)} de {libraryTotal}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setLibraryPage((current) => Math.max(1, current - 1))}
                            disabled={libraryPage === 1 || libraryLoading}
                          >
                            Anterior
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            Pagina {libraryPage} de {totalLibraryPages}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setLibraryPage((current) => Math.min(totalLibraryPages, current + 1))}
                            disabled={libraryPage >= totalLibraryPages || libraryLoading}
                          >
                            Siguiente
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Especificaciones */}
          <div className="space-y-4">
            <Label>Especificaciones tecnicas</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input
                value={newSpecKey}
                onChange={(e) => setNewSpecKey(e.target.value)}
                placeholder="Nombre de la especificacion"
              />
              <div className="flex gap-2">
                <Input
                  value={newSpecValue}
                  onChange={(e) => setNewSpecValue(e.target.value)}
                  placeholder="Valor"
                  className="flex-1"
                />
                <Button type="button" onClick={addSpecification} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(formData.specifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">
                    <strong>{key}:</strong> {value}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSpecification(key)}
                    className="h-auto p-1"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : initialData ? "Actualizar" : "Agregar Producto"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
