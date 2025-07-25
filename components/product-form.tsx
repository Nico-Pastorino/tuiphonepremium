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
    stock: initialData?.stock || 0,
    featured: initialData?.featured || false,
  })

  const [newImage, setNewImage] = useState("")
  const [newSpecKey, setNewSpecKey] = useState("")
  const [newSpecValue, setNewSpecValue] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await onSubmit(formData)
    if (success) {
      // Reset form if it's a new product (no initialData)
      if (!initialData) {
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
          {/* Información básica */}
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
              <Label htmlFor="category">Categoría *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
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

          {/* Precios y condición */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio en pesos *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) || 0 }))}
                placeholder="999999"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceUSD">Precio en USD</Label>
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="originalPrice">Precio original (opcional)</Label>
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
              />
            </div>
          </div>

          {/* Condición */}
          <div className="space-y-2">
            <Label htmlFor="condition">Condición *</Label>
            <Select
              value={formData.condition}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, condition: value as any }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar condición" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nuevo">Nuevo</SelectItem>
                <SelectItem value="seminuevo">Seminuevo</SelectItem>
                <SelectItem value="usado">Usado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stock y destacado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock disponible</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData((prev) => ({ ...prev, stock: Number.parseInt(e.target.value) || 0 }))}
                placeholder="10"
              />
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, featured: checked }))}
              />
              <Label htmlFor="featured">Producto destacado</Label>
            </div>
          </div>

          {/* Imágenes */}
          <div className="space-y-4">
            <Label>Imágenes del producto</Label>
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
          </div>

          {/* Especificaciones */}
          <div className="space-y-4">
            <Label>Especificaciones técnicas</Label>
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
