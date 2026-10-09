/**
 * Store platform pricing, from each platform's US pricing page, checked on
 * PLATFORMS_CHECKED_ON. Prices are USD; platforms note that prices and
 * payment options vary by country. Re-check quarterly.
 */
export const PLATFORMS_CHECKED_ON = "9 October 2026";

export type Billing = "monthly" | "annual";

export type PlatformPlan = {
  id: string;
  platform: string;
  plan: string;
  price: Record<Billing, number>;
  /** Extra platform fee on sales when NOT using the platform's own payments. */
  thirdPartyFeePct: number;
  /** Platform fee on sales that applies whichever payments you use. */
  alwaysFeePct: number;
  /** Card rate with the platform's own payments, when published. */
  ownRate?: { pct: number; fixed: number };
  /** Approximate annual sales cap (gross order value), when published. */
  annualSalesCap?: number;
  note?: string;
  source: { label: string; url: string };
};

const shopify = { label: "Shopify pricing", url: "https://www.shopify.com/pricing" };
const bigcommerce = { label: "BigCommerce pricing", url: "https://www.bigcommerce.com/essentials/pricing/" };
const squarespace = { label: "Squarespace pricing", url: "https://www.squarespace.com/pricing" };
const woo = { label: "WooCommerce pricing", url: "https://woocommerce.com/pricing/" };

export const platformPlans: PlatformPlan[] = [
  { id: "shopify-basic", platform: "Shopify", plan: "Basic", price: { monthly: 39, annual: 29 }, thirdPartyFeePct: 2, alwaysFeePct: 0, ownRate: { pct: 2.9, fixed: 0.3 }, source: shopify },
  { id: "shopify-grow", platform: "Shopify", plan: "Grow", price: { monthly: 105, annual: 79 }, thirdPartyFeePct: 1, alwaysFeePct: 0, ownRate: { pct: 2.7, fixed: 0.3 }, source: shopify },
  {
    id: "bigcommerce-core", platform: "BigCommerce", plan: "Core", price: { monthly: 39, annual: 29 }, thirdPartyFeePct: 2, alwaysFeePct: 0, annualSalesCap: 30000 / 0.9,
    note: "No platform fee with BigCommerce's embedded payment providers; card processing still applies.", source: bigcommerce,
  },
  {
    id: "bigcommerce-growth", platform: "BigCommerce", plan: "Growth", price: { monthly: 105, annual: 79 }, thirdPartyFeePct: 1, alwaysFeePct: 0, annualSalesCap: 100000 / 0.9,
    note: "No platform fee with BigCommerce's embedded payment providers; card processing still applies.", source: bigcommerce,
  },
  { id: "squarespace-basic", platform: "Squarespace", plan: "Basic", price: { monthly: 25, annual: 19 }, thirdPartyFeePct: 0, alwaysFeePct: 2, note: "2% transaction fee on online store sales.", source: squarespace },
  { id: "squarespace-core", platform: "Squarespace", plan: "Core", price: { monthly: 39, annual: 29 }, thirdPartyFeePct: 0, alwaysFeePct: 0, source: squarespace },
  {
    id: "woocommerce", platform: "WooCommerce", plan: "Self-hosted", price: { monthly: 0, annual: 0 }, thirdPartyFeePct: 0, alwaysFeePct: 0, ownRate: { pct: 2.9, fixed: 0.3 },
    note: "The plugin is free; you pay for hosting and any paid extensions. WooPayments is quoted at about 2.5–2.9% + 30¢; the upper end is used here.", source: woo,
  },
];

export type CostInput = {
  sales: number;
  orders: number;
  billing: Billing;
  payments: "own" | "third";
  gatewayPct: number;
  gatewayFixed: number;
  wooHosting: number;
  wooExtensionsYear: number;
};

export type CostRow = {
  plan: PlatformPlan;
  subscription: number;
  platformFees: number;
  processing: number;
  extras: number;
  total: number;
  overCap: boolean;
};

export function costPlans(i: CostInput): CostRow[] {
  return platformPlans
    .map((plan) => {
      const subscription = plan.price[i.billing];
      const feePct = plan.alwaysFeePct + (i.payments === "third" ? plan.thirdPartyFeePct : 0);
      const platformFees = (i.sales * feePct) / 100;
      const rate = i.payments === "own" && plan.ownRate ? plan.ownRate : { pct: i.gatewayPct, fixed: i.gatewayFixed };
      const processing = (i.sales * rate.pct) / 100 + i.orders * rate.fixed;
      const extras = plan.platform === "WooCommerce" ? i.wooHosting + i.wooExtensionsYear / 12 : 0;
      const total = subscription + platformFees + processing + extras;
      const overCap = plan.annualSalesCap !== undefined && i.sales * 12 > plan.annualSalesCap;
      return { plan, subscription, platformFees, processing, extras, total, overCap };
    })
    .sort((a, b) => Number(a.overCap) - Number(b.overCap) || a.total - b.total);
}
