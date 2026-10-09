/**
 * Payment provider availability by seller country.
 *
 * Researched from providers' own pages on CHECKED_ON. Availability changes:
 * re-check every quarter and update the date. Status meanings:
 *  - available:   the provider explicitly lists or serves businesses in that country
 *  - limited:     available with a significant restriction (see note)
 *  - check:       the provider states broad global coverage but doesn't list the country
 *  - unavailable: the country is absent from the provider's list, or the provider excludes it
 */
export const CHECKED_ON = "9 October 2026";

export type ProviderStatus = "available" | "limited" | "check" | "unavailable";
export type MarketCode = "us" | "gb" | "eu" | "pk" | "ae" | "sa" | "in" | "ca" | "au";
export type Role = "checkout" | "receive" | "mor";
export type Sells = "physical" | "digital" | "services";

export const roleLabel: Record<Role, string> = {
  checkout: "Card checkout for your website",
  receive: "Receive payments and payouts",
  mor: "Merchant of record (handles sales tax)",
};

export const providerMarkets: { code: MarketCode; label: string }[] = [
  { code: "us", label: "United States" },
  { code: "gb", label: "United Kingdom" },
  { code: "eu", label: "European Union" },
  { code: "pk", label: "Pakistan" },
  { code: "ae", label: "United Arab Emirates" },
  { code: "sa", label: "Saudi Arabia" },
  { code: "in", label: "India" },
  { code: "ca", label: "Canada" },
  { code: "au", label: "Australia" },
];

type Cell = { status: ProviderStatus; note?: string };

export type Provider = {
  slug: string;
  name: string;
  role: Role;
  sells: Sells[];
  summary: string;
  sources: { label: string; url: string }[];
  markets: Record<MarketCode, Cell>;
};

const all = (status: ProviderStatus, note?: string): Record<MarketCode, Cell> =>
  Object.fromEntries(providerMarkets.map((m) => [m.code, { status, note }])) as Record<MarketCode, Cell>;

export const providers: Provider[] = [
  {
    slug: "stripe",
    name: "Stripe",
    role: "checkout",
    sells: ["physical", "digital", "services"],
    summary: "Card and wallet payments for websites and apps, with subscriptions and invoicing.",
    sources: [{ label: "Stripe: supported countries", url: "https://stripe.com/global" }],
    markets: {
      ...all("available"),
      eu: { status: "available", note: "Listed EU countries include Ireland, Germany and France; check yours on the list." },
      pk: { status: "unavailable" },
      sa: { status: "unavailable" },
      in: { status: "limited", note: "Preview only: by invitation through Stripe's sales team." },
    },
  },
  {
    slug: "shopify-payments",
    name: "Shopify Payments",
    role: "checkout",
    sells: ["physical", "digital", "services"],
    summary: "Shopify's built-in checkout for Shopify stores. Without it, stores use a third-party gateway.",
    sources: [{ label: "Shopify Help: Shopify Payments supported countries", url: "https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries" }],
    markets: {
      ...all("available"),
      eu: { status: "available", note: "Most EU countries are listed; check yours on the list." },
      pk: { status: "unavailable", note: "Shopify stores in Pakistan need a third-party gateway." },
      sa: { status: "unavailable" },
      in: { status: "unavailable" },
    },
  },
  {
    slug: "paypal",
    name: "PayPal",
    role: "receive",
    sells: ["physical", "digital", "services"],
    summary: "Widely recognised wallet for checkout, invoices and receiving payments.",
    sources: [
      { label: "PayPal business pages by country", url: "https://www.paypal.com/ae/business" },
      { label: "Report: PayPal ends domestic payments in India (2021)", url: "https://www.techradar.com/news/paypal-to-shut-down-domestic-payment-operations-in-india" },
      { label: "Report: PayPal not available in Pakistan (Sept 2026)", url: "https://www.elevatepay.co/blog/is-paypal-available-in-pakistan" },
    ],
    markets: {
      ...all("available"),
      pk: { status: "unavailable", note: "PayPal does not offer accounts to residents of Pakistan; Pakistan is absent from its country selector." },
      in: { status: "limited", note: "International payments only. PayPal stopped domestic payments within India in April 2021." },
    },
  },
  {
    slug: "payoneer",
    name: "Payoneer",
    role: "receive",
    sells: ["physical", "digital", "services"],
    summary: "Receive payments from clients and marketplaces in USD, GBP and EUR, and withdraw to a local bank.",
    sources: [
      { label: "Payoneer: online payment methods in Pakistan", url: "https://www.payoneer.com/resources/general-payments/online-payment-methods-in-pakistan/" },
      { label: "Payoneer: multi-currency account", url: "https://www.payoneer.com/multi-currency-account/" },
    ],
    markets: {
      ...all("check", "Payoneer states coverage in 190+ countries and territories but doesn't list each one."),
      pk: { status: "available", note: "Receive USD, GBP and EUR; withdraw to a verified Pakistani bank account in PKR." },
    },
  },
  {
    slug: "wise-business",
    name: "Wise Business",
    role: "receive",
    sells: ["physical", "digital", "services"],
    summary: "Multi-currency business account with local account details to receive international payments.",
    sources: [
      { label: "Wise Help: where can I hold money", url: "https://wise.com/help/articles/2813542/where-can-i-open-a-wise-balance" },
      { label: "Wise Help: who can get USD account details", url: "https://wise.com/help/articles/2810318/can-i-get-usd-account-details" },
    ],
    markets: {
      ...all("available"),
      us: { status: "available", note: "Not available to residents of Nevada." },
      pk: { status: "unavailable", note: "Pakistan isn't on Wise's list of countries where you can hold money, and Pakistan addresses can't get USD account details." },
      ae: { status: "unavailable", note: "The UAE isn't on Wise's list of countries where you can hold money, and UAE addresses can't get USD account details." },
      in: { status: "limited", note: "Wise lists India with restrictions on holding money; check what an Indian business can use before relying on it." },
    },
  },
  {
    slug: "paddle",
    name: "Paddle",
    role: "mor",
    sells: ["digital"],
    summary: "Sells your software on your behalf as merchant of record, handling global sales tax and payments.",
    sources: [{ label: "Paddle: which countries are supported", url: "https://www.paddle.com/help/start/intro-to-paddle/which-countries-are-supported-by-paddle" }],
    markets: all("available", "For software businesses. Paddle supports sellers worldwide except a short list of sanctioned countries."),
  },
  {
    slug: "lemon-squeezy",
    name: "Lemon Squeezy",
    role: "mor",
    sells: ["digital"],
    summary: "Merchant of record for digital products and subscriptions, with bank or PayPal payouts.",
    sources: [{ label: "Lemon Squeezy: supported countries", url: "https://docs.lemonsqueezy.com/help/getting-started/supported-countries" }],
    markets: {
      ...all("available", "Bank payouts supported."),
      in: { status: "limited", note: "Bank payouts need Stripe pre-approval; otherwise payouts go through PayPal." },
    },
  },
  {
    slug: "safepay",
    name: "Safepay",
    role: "checkout",
    sells: ["physical", "digital", "services"],
    summary: "Pakistani payment gateway for online stores, accepting local and international card payments.",
    sources: [{ label: "Safepay Checkout on the Shopify App Store", url: "https://apps.shopify.com/safepay-checkout-onsite" }],
    markets: {
      ...all("unavailable", "Serves merchants in Pakistan."),
      pk: { status: "available", note: "States it accepts local and international payments for Pakistani merchants." },
    },
  },
];
