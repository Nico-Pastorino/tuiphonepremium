"use client"

import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ShoppingCart, Eye } from "lucide-react"
import type { Product } from "@/types/product"
import { useDollarRate } from "@/hooks/useDollarRate"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { dollarRate } = useDollarRate()

  const priceInPesos = dollarRate ? product.priceUSD * dollarRate.blue : product.price

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-apple-muted/20 hover:border-apple-primary/30">
      <CardContent className="p-4">
        <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-apple-light">
          <Image
            src={product.images[0] || "/placeholder.svg?height=300&width=300&query=iPhone"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.featured && <Badge className="absolute top-2 left-2 bg-apple-primary text-white">Destacado</Badge>}
          <Badge
            className={`absolute top-2 right-2 ${
              product.condition === "nuevo" ? "bg-green-500 text-white" : "bg-apple-accent text-white"
            }`}
          >
            {product.condition === "nuevo" ? "Nuevo" : "Seminuevo"}
          </Badge>
        </div>

        <h3 className="font-semibold text-lg mb-2 text-gray-900 group-hover:text-apple-primary transition-colors">
          {product.name}
        </h3>

        <div className="space-y-1 mb-4">
          <div className="text-2xl font-bold text-apple-primary">${priceInPesos.toLocaleString("es-AR")}</div>
          {dollarRate && (
            <div className="text-sm text-gray-600">
              USD ${product.priceUSD} • Dólar Blue: ${dollarRate.blue}
            </div>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

        {product.stock > 0 ? (
          <div className="text-sm text-green-600 mb-4">Stock disponible: {product.stock} unidades</div>
        ) : (
          <div className="text-sm text-red-600 mb-4">Sin stock</div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="flex-1 border-apple-primary text-apple-primary hover:bg-apple-primary hover:text-white bg-transparent"
        >
          <Link href={`/productos/${product.id}`}>
            <Eye className="w-4 h-4 mr-2" />
            Ver detalles
          </Link>
        </Button>
        <Button
          size="sm"
          className="flex-1 bg-apple-primary hover:bg-apple-accent text-white"
          disabled={product.stock === 0}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Agregar
        </Button>
      </CardFooter>
    </Card>
  )
}
