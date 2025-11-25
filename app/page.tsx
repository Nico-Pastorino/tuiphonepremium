import { HomePageContent } from "@/components/HomePageContent"
import { getCatalogProducts } from "@/lib/product-cache"
import { getHomeConfigCached, getTradeInConfigCached } from "@/lib/site-config-cache"

export const revalidate = 300

export default async function HomePage() {
  const [featuredResponse, homeConfig, tradeInConfig] = await Promise.all([
    getCatalogProducts({ limit: 12, offset: 0, featured: true }),
    getHomeConfigCached(),
    getTradeInConfigCached(),
  ])

  const products = featuredResponse.items.map((item) => ({
    ...item,
    description: "",
    images: Array.isArray(item.images) && item.images.length > 0 ? [item.images[0]] : [],
  }))

  return (
    <HomePageContent initialProducts={products} homeConfig={homeConfig} initialTradeInConfig={tradeInConfig} />
  )
}
