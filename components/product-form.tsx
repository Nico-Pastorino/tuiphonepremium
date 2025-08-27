"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import type { ProductFormData } from "@/types/product"

interface ProductFormProps {
  onSubmit: (product: ProductFormData) => Promise<boolean>
  initialData?: Partial<ProductFormData>
  isLoading?: boolean
}

export function ProductForm({ onSubmit, initialData, isLoading = false }: ProductFormProps) {
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
    stock: 1, // Always available - no stock management needed
    featured: initialData?.featured || false,
  })

  const [newImage, setNewImage] = useState("")
  const [newSpecKey, setNewSpecKey] = useState("")
  const [newSpecValue, setNewSpecValue] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await onSubmit(formData)
    if (success && !initialData) {
      // Reset form only for new products
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
        stock: 1,
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
      return { ...prev, specifications: newSpecs }
    })
  }

  return (
    <Card className="w-full max-w-4xl mx-auto border-0 shadow-none">
      <CardHeader className="px-0 pb-6">
        <CardTitle className="text-2xl font-bold">
          {initialData ? "Editar Producto" : "Agregar Nuevo Producto"}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información básica */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Información Básica</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nombre del producto *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="iPhone 15 Pro Max 256GB"
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                  Categoría *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="h-11">
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
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Descripción
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción detallada del producto, características principales, estado, etc."
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition" className="text-sm font-medium text-gray-700">
                Condición *
              </Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, condition: value as any }))}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Seleccionar condición" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nuevo">Nuevo</SelectItem>
                  <SelectItem value="seminuevo">Seminuevo</SelectItem>
                  <SelectItem value="usado">Usado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Precios */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Precios</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                  Precio en Pesos *
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) || 0 }))}
                  placeholder="999999"
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceUSD" className="text-sm font-medium text-gray-700">
                  Precio en USD
                </Label>
                <Input
                  id="priceUSD"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.priceUSD || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      priceUSD: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                    }))
                  }
                  placeholder="999.99"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="originalPrice" className="text-sm font-medium text-gray-700">
                  Precio Original
                </Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.originalPrice || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      originalPrice: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                    }))
                  }
                  placeholder="1199999"
                  className="h-11"
                />
                <p className="text-xs text-gray-500">Para mostrar descuentos</p>
              </div>
            </div>
          </div>

          {/* Imágenes */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Imágenes</h3>

            <div className="space-y-4">
              <div className="flex gap-3">
                <Input
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="flex-1 h-11"
                />
                <Button
                  type="button"
                  onClick={addImage}
                  variant="outline"
                  className="h-11 px-4 bg-transparent"
                  disabled={!newImage.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {formData.images.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Imágenes agregadas:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.images.map((image, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-2 py-2 px-3 max-w-xs">
                        <span className="truncate text-xs">
                          {image.length > 30 ? `${image.substring(0, 30)}...` : image}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImage(index)}
                          className="h-auto p-0 hover:bg-transparent text-gray-500 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Especificaciones */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Especificaciones Técnicas</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  value={newSpecKey}
                  onChange={(e) => setNewSpecKey(e.target.value)}
                  placeholder="Ej: Almacenamiento"
                  className="h-11"
                />
                <div className="flex gap-3">
                  <Input
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    placeholder="Ej: 256GB"
                    className="flex-1 h-11"
                  />
                  <Button
                    type="button"
                    onClick={addSpecification}
                    variant="outline"
                    className="h-11 px-4 bg-transparent"
                    disabled={!newSpecKey.trim() || !newSpecValue.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {Object.keys(formData.specifications).length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Especificaciones agregadas:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(formData.specifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <span className="text-sm">
                          <span className="font-medium text-gray-900">{key}:</span>{" "}
                          <span className="text-gray-700">{value}</span>
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSpecification(key)}
                          className="h-auto p-1 text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Configuración adicional */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Configuración</h3>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
              <div className="space-y-1">
                <Label htmlFor="featured" className="text-sm font-medium text-gray-900">
                  Producto Destacado
                </Label>
                <p className="text-xs text-gray-600">
                  Los productos destacados aparecen primero en la página principal
                </p>
              </div>
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, featured: checked }))}
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 h-11"
            >
              {isLoading ? "Guardando..." : initialData ? "Actualizar Producto" : "Agregar Producto"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
