export type Product = {
  id: string
  name: string
  category: string
  condition: string
  price: number
  priceUSD: number
  images: string[]
  description: string
  specifications: { [key: string]: string }
  stock: number
  featured: boolean
  createdAt: string
}
