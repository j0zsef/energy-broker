export const CARBON_LBS_PER_KWH = 0.86;
export const CARBON_GRAMS_PER_KWH = CARBON_LBS_PER_KWH * 453.592;
export const GRAMS_PER_METRIC_TON = 1_000_000;
export const LBS_TO_METRIC_TONS = 0.000453592;

export interface CarbonProject {
  country: string
  description: string
  id: string
  name: string
  pricePerMtCo2Cents: number
  type: string
}

export interface CarbonOrderResponse {
  createdAt: string
  id: number
  massGrams: number
  patchOrderId: string
  priceCents: number
  projectName: string | null
  projectType: string | null
  state: string
  vintageYear: number | null
}

export interface CarbonOrdersSummary {
  orders: CarbonOrderResponse[]
  totalOffsetMtCo2: number
  totalSpentCents: number
}

export interface CreateOrderRequest {
  massGrams: number
  projectId: string
}

export interface CheckoutResponse {
  checkoutUrl: string
}
