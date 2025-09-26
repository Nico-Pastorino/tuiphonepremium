"use client"

import type React from "react"

interface ProductCardProps {
  imageUrl: string
  title: string
  price: number
}

export const ProductCard: React.FC<ProductCardProps> = ({ imageUrl, title, price }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img src={imageUrl || "/placeholder.svg"} alt={title} className="w-full h-48 object-contain" />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-700">${price.toFixed(2)}</p>
      </div>
    </div>
  )
}

export default ProductCard
