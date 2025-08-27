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
import { Separator } from "@/components/ui/separator"
import { X, Plus, Trash2 } from "lucide-react"
import type { Product } from "@/types/product"

interface ProductFormProps {
  initialData?: Product
  onSubmit: (data: Omit<Product, "id">) => Promise<boolean>
}

interface FormData {
  name: string
  description: string
  price: number
  priceUsd: number
  originalPrice: number
  category: string
  condition: "nuevo" | "usado" | "reacondicionado"
  images: string[]
  specifications: Record<string, string>
  featured: boolean
}

const categories = [
  { value: "iphone", label: "iPhone" },
  { value: "ipad", label: "iPad" },
  { value: "mac", label: "Mac" },
  { value: "watch", label: "Apple Watch" },
  { value: "airpods", label: "AirPods" },
  { value: "accesorios", label: "Accesorios" },
]

const commonSpecs = {
  iphone: ["Almacenamiento", "Color", "Estado de batería", "Modelo", "Año"],
  ipad: ["Almacenamiento", "Color", "Conectividad", "Modelo", "Año"],
  mac: ["Procesador", "RAM", "Almacenamiento", "Pantalla", "Año"],
  watch: ["Tamaño", "Color", "Conectividad", "Modelo", "Año"],
  airpods: ["Modelo", "Color", "Estado de batería", "Accesorios incluidos"],
  accesorios: ["Compatibilidad", "Color", "Material", "Marca", "Estado"],
}

export function ProductForm({ initialData, onSubmit }: ProductFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    priceUsd: initialData?.priceUsd || 0,
    originalPrice: initialData?.originalPrice || 0,
    category: initialData?.category || "",
    condition: initialData?.condition || "nuevo",
    images: initialData?.images || [],
    specifications: initialData?.specifications || {},
    featured: initialData?.featured || false,
  })

  const [newImageUrl, setNewImageUrl] = useState("")
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
        // Reset form if it's a new product
        if (!initialData) {
          setFormData({
            name: "",
            description: "",
            price: 0,
            priceUsd: 0,
            originalPrice: 0,
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
    if (newImageUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()],
      }))
      setNewImageUrl("")
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
    setFormData((prev) => ({
      ...prev,
      specifications: Object.fromEntries(Object.entries(prev.specifications).filter(([k]) => k !== key)),
    }))
  }

  const addCommonSpec = (spec: string) => {
    setNewSpecKey(spec)
  }

  const isFormValid = formData.name.trim() && formData.price > 0 && formData.category && formData.images.length > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Básica */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Producto *</Label>
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
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
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
              placeholder="Describe las características principales del producto..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="condition">Estado</Label>
              <Select
                value={formData.condition}
                onValueChange={(value: "nuevo" | "usado" | "reacondicionado") =>
                  setFormData((prev) => ({ ...prev, condition: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nuevo">Nuevo</SelectItem>
                  <SelectItem value="usado">Usado</SelectItem>
                  <SelectItem value="reacondicionado">Reacondicionado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, featured: checked }))}
              />
              <Label htmlFor="featured">Producto destacado</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Precios */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Precios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio en Pesos *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                placeholder="0"
                min="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceUsd">Precio en USD</Label>
              <Input
                id="priceUsd"
                type="number"
                value={formData.priceUsd}
                onChange={(e) => setFormData((prev) => ({ ...prev, priceUsd: Number(e.target.value) }))}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="originalPrice">Precio Original</Label>
              <Input
                id="originalPrice"
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData((prev) => ({ ...prev, originalPrice: Number(e.target.value) }))}
                placeholder="0"
                min="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Imágenes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Imágenes *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="URL de la imagen"
              className="flex-1"
            />
            <Button type="button" onClick={addImage} disabled={!newImageUrl.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url || "/placeholder.svg"}
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                  {index === 0 && <Badge className="absolute bottom-1 left-1 text-xs">Principal</Badge>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Especificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Especificaciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Especificaciones comunes */}
          {formData.category && commonSpecs[formData.category as keyof typeof commonSpecs] && (
            <div>
              <Label className="text-sm text-gray-600 mb-2 block">Especificaciones comunes:</Label>
              <div className="flex flex-wrap gap-2">
                {commonSpecs[formData.category as keyof typeof commonSpecs].map((spec) => (
                  <Button
                    key={spec}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addCommonSpec(spec)}
                    disabled={spec in formData.specifications}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {spec}
                  </Button>
                ))}
              </div>
              <Separator className="my-4" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input value={newSpecKey} onChange={(e) => setNewSpecKey(e.target.value)} placeholder="Especificación" />
            <Input value={newSpecValue} onChange={(e) => setNewSpecValue(e.target.value)} placeholder="Valor" />
            <Button type="button" onClick={addSpecification} disabled={!newSpecKey.trim() || !newSpecValue.trim()}>
              <Plus className="w-4 h-4 mr-1" />
              Agregar
            </Button>
          </div>

          {Object.entries(formData.specifications).length > 0 && (
            <div className="space-y-2">
              {Object.entries(formData.specifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{key}:</span> {value}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSpecification(key)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
        >
          {isSubmitting ? "Guardando..." : initialData ? "Actualizar Producto" : "Crear Producto"}
        </Button>
      </div>
    </form>
  )
}
