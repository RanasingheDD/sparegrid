export const PLATFORM_COSTS = {
  minimumItemPrice: 1000,
  buyerShippingCost: 450,
  failedOrderReturnServiceCharge: 480,
  sellerShipWithinHours: 48,
  sellerRestrictionAfterFailedOrders: 2,
  sellerPayoutDay: 'Friday',
}

export function resolvePlatformCosts(policies) {
  const safePolicies = policies || {}

  return {
    minimumItemPrice: safePolicies.minimum_item_price ?? PLATFORM_COSTS.minimumItemPrice,
    buyerShippingCost: safePolicies.buyer_shipping_cost ?? PLATFORM_COSTS.buyerShippingCost,
    failedOrderReturnServiceCharge:
      safePolicies.failed_order_return_service_charge ?? PLATFORM_COSTS.failedOrderReturnServiceCharge,
    sellerShipWithinHours: safePolicies.seller_ship_within_hours ?? PLATFORM_COSTS.sellerShipWithinHours,
    sellerRestrictionAfterFailedOrders:
      safePolicies.seller_restriction_after_failed_orders ?? PLATFORM_COSTS.sellerRestrictionAfterFailedOrders,
    sellerPayoutDay: safePolicies.seller_payout_day ?? PLATFORM_COSTS.sellerPayoutDay,
  }
}
