"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X } from "lucide-react"
import type { Product } from "@/types/product"

export interface ProductFormData extends Omit<Product, "id" | "createdAt" | "priceUSD" | "specifications"> {}

export function ProductForm({
  product,
  onSubmit,
  onCancel,
}: {
  product?: Product
  onSubmit: (data: ProductFormData) => void
  onCancel?: () => void
}) {
  const [data, setData] = useState<ProductFormData>({
    name: product?.name ?? "",
    category: product?.category ?? "",
    condition: product?.condition ?? "nuevo",
    price: product?.price ?? 0,
    stock: product?.stock ?? 0,
    description: product?.description ?? "",
    images: product?.images ?? [],
    featured: product?.featured ?? false,
  })
  const [newImg, setNewImg] = useState("")

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(data)
      }}
      className="space-y-6"
    >
      {/* name & category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="category">Categoría</Label>
          <Input
            id="category"
            value={data.category}
            onChange={(e) => setData({ ...data, category: e.target.value })}
            required
          />
        </div>
      </div>

      {/* price & stock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Precio (ARS)</Label>
          <Input
            id="price"
            type="number"
            value={data.price}
            onChange={(e) => setData({ ...data, price: Number(e.target.value) })}
            required
          />
        </div>
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            type="number"
            value={data.stock}
            onChange={(e) => setData({ ...data, stock: Number(e.target.value) })}
            required
          />
        </div>
      </div>

      {/* description */}
      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          rows={3}
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
        />
      </div>

      {/* images */}
      <div className="space-y-2">
        <Label>Imágenes</Label>
        <div className="flex gap-2">
          <Input placeholder="URL" value={newImg} onChange={(e) => setNewImg(e.target.value)} />
          <Button
            type="button"
            onClick={() => {
              if (newImg) {
                setData({ ...data, images: [...data.images, newImg] })
                setNewImg("")
              }
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Añadir
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {data.images.map((src, idx) => (
            <div key={idx} className="relative group">
              <Image
                src={src || "/placeholder.svg"}
                alt={`img-${idx}`}
                width={120}
                height={120}
                className="object-cover rounded"
              />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100"
                onClick={() =>
                  setData({
                    ...data,
                    images: data.images.filter((_, i) => i !== idx),
                  })
                }
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* featured */}
      <div className="flex items-center space-x-2">
        <Switch id="featured" checked={data.featured} onCheckedChange={(v) => setData({ ...data, featured: v })} />
        <Label htmlFor="featured">Destacado</Label>
      </div>

      {/* actions */}
      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit">{product ? "Actualizar" : "Crear"}</Button>
      </div>
    </form>
  )
}
