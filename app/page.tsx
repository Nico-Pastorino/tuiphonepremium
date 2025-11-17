import { HomePageContent } from "@/components/HomePageContent"
import { getProductsSnapshot, toProductSummary } from "@/lib/product-cache"
import { getHomeConfigCached, getTradeInConfigCached } from "@/lib/site-config-cache"

export const revalidate = 300

export default async function HomePage() {
  const [snapshot, homeConfig, tradeInConfig] = await Promise.all([
    getProductsSnapshot(),
    getHomeConfigCached(),
    getTradeInConfigCached(),
  ])

  const selectedRows = snapshot.data.filter((row) => row.featured).slice(0, 12)

  const products = selectedRows.map((row) => {
    const summary = toProductSummary(row)
    return {
      ...summary,
      description: "",
      images: summary.images.length > 0 ? summary.images.slice(0, 1) : [],
    }
  })

  return (
    <HomePageContent initialProducts={products} homeConfig={homeConfig} initialTradeInConfig={tradeInConfig} />
  )
}
