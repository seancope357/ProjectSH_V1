/**
 * Calculate platform fees for orders
 * Fee structure: 15% + $0.50 per order item
 */

export interface FeeCalculation {
  platformFeePercent: number
  platformFeeFixed: number
  platformFeeTotal: number
  sellerAmount: number
}

export function calcFees(itemPrice: number): FeeCalculation {
  const platformFeePercent = Math.round(itemPrice * 0.15) // 15% of item price
  const platformFeeFixed = 50 // $0.50 in cents
  const platformFeeTotal = platformFeePercent + platformFeeFixed
  const sellerAmount = itemPrice - platformFeeTotal

  return {
    platformFeePercent,
    platformFeeFixed,
    platformFeeTotal,
    sellerAmount,
  }
}

export function calcOrderFees(items: { price: number }[]): {
  subtotal: number
  totalPlatformFee: number
  totalSellerAmount: number
  itemFees: FeeCalculation[]
} {
  const itemFees = items.map(item => calcFees(item.price))
  const subtotal = items.reduce((sum, item) => sum + item.price, 0)
  const totalPlatformFee = itemFees.reduce(
    (sum, fee) => sum + fee.platformFeeTotal,
    0
  )
  const totalSellerAmount = itemFees.reduce(
    (sum, fee) => sum + fee.sellerAmount,
    0
  )

  return {
    subtotal,
    totalPlatformFee,
    totalSellerAmount,
    itemFees,
  }
}
