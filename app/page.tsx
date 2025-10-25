import { HomePageContent } from "@/components/HomePageContent"
import { getProductsSnapshot, toProductSummary } from "@/lib/product-cache"
import { getHomeConfigCached, getTradeInConfigCached } from "@/lib/site-config-cache"

export const revalidate = 120

export default async function HomePage() {
  const [snapshot, homeConfig, tradeInConfig] = await Promise.all([
    getProductsSnapshot(),
    getHomeConfigCached(),
    getTradeInConfigCached(),
  ])

  const products = snapshot.data.map(toProductSummary)

  return <HomePageContent initialProducts={products} homeConfig={homeConfig} tradeInConfig={tradeInConfig} />
}
