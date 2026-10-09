export type Market = {
  code: string;
  label: string;
  currency: string;
  locale: string;
};

export const markets: Market[] = [
  { code: "global", label: "Global", currency: "USD", locale: "en-US" },
  { code: "us", label: "United States", currency: "USD", locale: "en-US" },
  { code: "gb", label: "United Kingdom", currency: "GBP", locale: "en-GB" },
  { code: "eu", label: "European Union", currency: "EUR", locale: "en-IE" },
  { code: "pk", label: "Pakistan", currency: "PKR", locale: "en-PK" },
  { code: "ae", label: "United Arab Emirates", currency: "AED", locale: "en-AE" },
  { code: "sa", label: "Saudi Arabia", currency: "SAR", locale: "en-SA" },
  { code: "in", label: "India", currency: "INR", locale: "en-IN" },
  { code: "ca", label: "Canada", currency: "CAD", locale: "en-CA" },
  { code: "au", label: "Australia", currency: "AUD", locale: "en-AU" },
];

export function formatMoney(value: number, market: Market, digits = 2) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(market.locale, {
    style: "currency",
    currency: market.currency,
    maximumFractionDigits: digits,
    // Whole amounts stay clean ($25); fractional amounts show full cents ($5.10, not $5.1).
    minimumFractionDigits: Number.isInteger(Math.round(value * 10 ** digits) / 10 ** digits) ? 0 : digits,
  }).format(value);
}
