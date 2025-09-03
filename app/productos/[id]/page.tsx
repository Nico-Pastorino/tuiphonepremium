import { getProductById } from "@/lib/products"
import { notFound } from "next/navigation"

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id)

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header section */}
      <div className="bg-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="text-gray-600">{product.description}</p>
      </div>

      {/* Content section */}
      <div className="bg-white p-4 shadow-md mt-4">
        <h2 className="text-xl font-semibold">Details</h2>
        <p className="text-gray-800">Price: ${product.price}</p>
        <p className="text-gray-800">Stock: {product.stock}</p>
      </div>

      {/* Footer section */}
      <div className="bg-white p-4 shadow-md mt-4">
        <p className="text-gray-600">Thank you for visiting!</p>
      </div>
    </div>
  )
}
