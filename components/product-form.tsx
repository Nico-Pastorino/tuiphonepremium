"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, X, DollarSign, Tag, Package, ImageIcon } from "lucide-react"
import type { ProductFormData } from "@/types/product"

interface ProductFormProps {
  onSubmit: (product: ProductFormData) => Promise<boolean>
  initialData?: Partial<ProductFormData>
  isEditing?: boolean
}

const categorySpecs = {
  iphone: ["Almacenamiento", "Color", "Pantalla", "Cámara", "Batería"],
  ipad: ["Almacenamiento", "Color", "Pantalla", "Procesador", "Conectividad"],
  mac: ["Procesador", "RAM", "Almacenamiento", "Pantalla", "Puertos"],
  watch: ["Tamaño", "Color", "Conectividad", "Batería", "Sensores"],
  airpods: ["Conectividad", "Batería", "Características", "Estuche"],
  accesorios: ["Compatibilidad", "Material", "Características", "Dimensiones"],
}

export function ProductForm({ onSubmit, initialData, isEditing = false }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    originalPrice: initialData?.originalPrice || undefined,
    priceUSD: initialData?.priceUSD || undefined,
    category: initialData?.category || "",
    condition: initialData?.condition || "nuevo",
    images: initialData?.images || [],
    specifications: initialData?.specifications || {},
    featured: initialData?.featured || false,
  })

  const [newImage, setNewImage] = useState("")
  const [newSpecKey, setNewSpecKey] = useState("")
  const [newSpecValue, setNewSpecValue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const success = await onSubmit(formData)
      if (success) {
        // Reset form if not editing
        if (!isEditing) {
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
            featured: false,
          })
        }
      }
    } finally {
      setIsSubmitting(false)
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
      return { ...prev, specifications: newSpecs }
    })
  }

  const addCommonSpec = (spec: string) => {
    setNewSpecKey(spec)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Básica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Información Básica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del producto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="iPhone 15 Pro Max 256GB"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
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
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción detallada del producto..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="condition">Estado *</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, condition: value as any }))}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nuevo">Nuevo</SelectItem>
                  <SelectItem value="seminuevo">Seminuevo</SelectItem>
                  <SelectItem value="usado">Usado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="featured">Producto destacado</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Precios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Precios
          </CardTitle>
          <CardDescription>
            Ingresa solo el precio en USD. El precio en pesos se calculará automáticamente con la cotización actual del
            dólar blue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priceUSD">Precio en USD *</Label>
              <Input
                id="priceUSD"
                type="number"
                step="0.01"
                min="0"
                value={formData.priceUSD || ""}
                onChange={(e) => {
                  const usdPrice = e.target.value ? Number(e.target.value) : undefined
                  setFormData((prev) => ({
                    ...prev,
                    priceUSD: usdPrice,
                    // Auto-calculate ARS price (this will be done on the backend)
                    price: usdPrice ? Math.round(usdPrice * 1200) : 0, // Placeholder calculation
                  }))
                }}
                placeholder="299.99"
                required
              />
              <p className="text-xs text-gray-500">Este será el precio base para todos los cálculos</p>
            </div>

            <div className="space-y-2">
              <Label>Precio calculado en ARS</Label>
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="text-lg font-semibold">${formData.price.toLocaleString()} ARS</div>
                <p className="text-xs text-gray-500">Se calcula automáticamente: USD × (Dólar Blue + Markup)</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="originalPrice">Precio original USD (opcional)</Label>
            <Input
              id="originalPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.originalPrice || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  originalPrice: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              placeholder="399.99"
            />
            <p className="text-xs text-gray-500">Para mostrar descuentos (precio tachado)</p>
          </div>
        </CardContent>
      </Card>

      {/* Imágenes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Imágenes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newImage}
              onChange={(e) => setNewImage(e.target.value)}
              placeholder="URL de la imagen"
              className="flex-1"
            />
            <Button type="button" onClick={addImage} disabled={!newImage.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {formData.images.length > 0 && (
            <div className="space-y-2">
              <Label>Imágenes agregadas:</Label>
              <div className="space-y-2">
                {formData.images.map((image, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="flex-1 text-sm truncate">{image}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeImage(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Especificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Especificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.category && categorySpecs[formData.category as keyof typeof categorySpecs] && (
            <div className="space-y-2">
              <Label>Especificaciones comunes para {formData.category}:</Label>
              <div className="flex flex-wrap gap-2">
                {categorySpecs[formData.category as keyof typeof categorySpecs].map((spec) => (
                  <Badge
                    key={spec}
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50"
                    onClick={() => addCommonSpec(spec)}
                  >
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input
              value={newSpecKey}
              onChange={(e) => setNewSpecKey(e.target.value)}
              placeholder="Nombre de la especificación"
            />
            <div className="flex gap-2">
              <Input
                value={newSpecValue}
                onChange={(e) => setNewSpecValue(e.target.value)}
                placeholder="Valor"
                className="flex-1"
              />
              <Button type="button" onClick={addSpecification} disabled={!newSpecKey.trim() || !newSpecValue.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {Object.keys(formData.specifications).length > 0 && (
            <div className="space-y-2">
              <Label>Especificaciones agregadas:</Label>
              <div className="space-y-2">
                {Object.entries(formData.specifications).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="font-medium text-sm">{key}:</span>
                    <span className="flex-1 text-sm">{value}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeSpecification(key)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botón de envío */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || !formData.name || !formData.category} className="min-w-[120px]">
          {isSubmitting ? "Guardando..." : isEditing ? "Actualizar" : "Crear Producto"}
        </Button>
      </div>
    </form>
  )
}
