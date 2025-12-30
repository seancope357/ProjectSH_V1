import { MarketplaceHome } from '@/components/ui/marketplace-home'
import { getMarketInsights } from '@/lib/market-service'

export default async function HomePage() {
  const insights = await getMarketInsights()
  return <MarketplaceHome initialInsights={insights} />
}
