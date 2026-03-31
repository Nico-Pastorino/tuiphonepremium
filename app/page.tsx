import { HomePageContent } from "@/components/HomePageContent"
import { getCatalogProducts } from "@/lib/product-cache"
import { getHomeConfigCached, getTradeInConfigCached } from "@/lib/site-config-cache"

export const revalidate = 300
export const dynamic = "force-dynamic"

export default async function HomePage() {
  const outletEnabled = process.env.NEXT_PUBLIC_OUTLET_ENABLED === "true"
  const [featuredResponse, outletResponse, homeConfig, tradeInConfig] = await Promise.all([
    getCatalogProducts({ limit: 12, offset: 0, featured: true }),
    outletEnabled ? getCatalogProducts({ limit: 12, offset: 0, outletOnly: true }) : Promise.resolve(null),
    getHomeConfigCached(),
    getTradeInConfigCached(),
  ])

  const products = featuredResponse.items.map((item) => ({
    ...item,
  }))

  const outletProducts = outletResponse?.items.map((item) => ({
    ...item,
  }))

  return (
    <HomePageContent
      initialProducts={products}
      initialOutletProducts={outletProducts ?? []}
      homeConfig={homeConfig}
      initialTradeInConfig={tradeInConfig}
    />
  )
}
