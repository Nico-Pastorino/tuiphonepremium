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
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { useAdmin, type ProductImageItem } from "@/contexts/AdminContext"
import type { ProductFormData } from "@/types/product"

interface ProductFormProps {
  onSubmit: (product: ProductFormData) => Promise<boolean>
  initialData?: Partial<ProductFormData>
  isLoading?: boolean
}

export function ProductForm({ onSubmit, initialData, isLoading = false }: ProductFormProps) {
  const { getEffectiveDollarRate, imageLibrary } = useAdmin()
  const effectiveDollarRate = getEffectiveDollarRate()

  const derivePriceFromUSD = (usd?: number) => {
    if (usd === undefined || Number.isNaN(usd)) {
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
  })

  const [libraryCategoryFilter, setLibraryCategoryFilter] = useState<string>("todos")

  useEffect(() => {
    if (formData.category && formData.category !== libraryCategoryFilter) {
      setLibraryCategoryFilter(formData.category)
    }
  }, [formData.category, libraryCategoryFilter])
 
  const libraryCategories = useMemo(() => {
    const categories = new Set(imageLibrary.map((item) => item.category || "general"))
    return Array.from(categories).sort((a, b) => a.localeCompare(b))
  }, [imageLibrary])
 
  const filteredLibraryImages = useMemo(() => {
    if (libraryCategoryFilter === "todos") {
      return imageLibrary
    }
    return imageLibrary.filter((item) => item.category === libraryCategoryFilter)
  }, [imageLibrary, libraryCategoryFilter])
 
  const [newImage, setNewImage] = useState("")
  const [newSpecKey, setNewSpecKey] = useState("")
  const [newSpecValue, setNewSpecValue] = useState("")

  const handleAddImageFromLibrary = (image: ProductImageItem) => {
    setFormData((prev) => {
      if (prev.images.includes(image.url)) {
        return prev
      }
      return {
        ...prev,
        images: [...prev.images, image.url],
      }
    })
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
      })
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
                value={formData.condition}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, condition: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar condicion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nuevo">Nuevo</SelectItem>
                  <SelectItem value="seminuevo">Seminuevo</SelectItem>
                  <SelectItem value="usado">Usado</SelectItem>
                </SelectContent>
              </Select>
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

          {/* Imagenes */}
          <div className="space-y-4">
            <Label>Imagenes del producto</Label>
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
            <div className="flex flex-wrap gap-2">
              {formData.images.map((image, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  <span className="truncate max-w-[200px]">{image}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeImage(index)}
                    className="h-auto p-0 hover:bg-transparent"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Biblioteca de imagenes</Label>
              {imageLibrary.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Gestiona la biblioteca desde la seccion de configuracion para tener imagenes listas para tus productos.
                </p>
              ) : (
                <>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <div className="flex items-center gap-2">
                      <Select
                        value={libraryCategoryFilter}
                        onValueChange={(value) => setLibraryCategoryFilter(value)}
                      >
                        <SelectTrigger className="w-[220px]">
                          <SelectValue placeholder="Filtrar por categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todas las categorias</SelectItem>
                          {libraryCategories.map((category) => (
                            <SelectItem key={category} value={category} className="capitalize">
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setLibraryCategoryFilter("todos")}
                      >
                        Ver todas
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Haz clic en una imagen para agregarla al producto.</p>
                  </div>
                  {filteredLibraryImages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay imagenes para esta categoria.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                      {filteredLibraryImages.map((image) => (
                        <button
                          key={image.id}
                          type="button"
                          onClick={() => handleAddImageFromLibrary(image)}
                          className="group overflow-hidden rounded-lg border border-gray-200 bg-white text-left shadow-sm transition hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <div className="relative h-24 w-full bg-gray-100">
                            <Image
                              src={image.url}
                              alt={image.label}
                              fill
                              className="object-cover" unoptimized
                              sizes="200px"
                            />
                          </div>
                          <div className="p-2 space-y-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{image.label}</p>
                            <p className="text-xs text-gray-500 capitalize">{image.category}</p>
                            <p className="text-xs text-blue-600/80 group-hover:text-blue-600">Agregar al producto</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
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


