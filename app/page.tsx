import { HomePageContent } from "@/components/HomePageContent"
import { getProductsSnapshot, toProductSummary } from "@/lib/product-cache"
import { getHomeConfigCached } from "@/lib/site-config-cache"

export const revalidate = 120

export default async function HomePage() {
  const [snapshot, homeConfig] = await Promise.all([
    getProductsSnapshot(),
    getHomeConfigCached(),
  ])

  const featuredRows = snapshot.data.filter((row) => row.featured)
  const fallbackRows = snapshot.data.filter((row) => !row.featured)
  const selectedRows = [...featuredRows, ...fallbackRows].slice(0, 12)

  const products = selectedRows.map((row) => {
    const summary = toProductSummary(row)
    return {
      ...summary,
      description: "",
      images: summary.images.length > 0 ? summary.images.slice(0, 1) : [],
    }
  })

  return <HomePageContent initialProducts={products} homeConfig={homeConfig} />
}
