"use client";

import { useEffect, useState } from "react";
import { useMarket } from "@/lib/market";
import { providers } from "@/lib/paymentProviders";
import { PLATFORMS_CHECKED_ON, costPlans, platformPlans, type Billing } from "@/lib/storePlatforms";
import { cx } from "@/components/ui";
import { MethodNote, NumberField, Segmented, parseNum } from "./CalcParts";

const usd = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: Number.isInteger(Math.round(v * 100) / 100) ? 0 : 2, minimumFractionDigits: 0 }).format(v);

export function StorePlatformComparison() {
  const market = useMarket();
  const [sales, setSales] = useState("5000");
  const [orders, setOrders] = useState("100");
  const [billing, setBilling] = useState<Billing>("monthly");
  const [payments, setPayments] = useState<"own" | "third">("own");
  const [gwPct, setGwPct] = useState("3.5");
  const [gwFixed, setGwFixed] = useState("0.30");
  const [hosting, setHosting] = useState("25");
  const [ext, setExt] = useState("0");

  // Where Shopify Payments isn't available, default to a third-party gateway.
  const shopifyPayments = providers.find((p) => p.slug === "shopify-payments")!;
  const ownUnavailable =
    market.code in shopifyPayments.markets && shopifyPayments.markets[market.code as keyof typeof shopifyPayments.markets].status === "unavailable";
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- follow the global market preference
    if (ownUnavailable) setPayments("third");
  }, [ownUnavailable]);

  const s = parseNum(sales);
  const o = parseNum(orders);
  const errors: Record<string, string> = {};
  if (s === null || s < 0) errors.sales = "Enter your expected monthly online sales.";
  if (o === null || o < 0 || !Number.isInteger(o)) errors.orders = "Enter a whole number of orders.";
  const gp = parseNum(gwPct) ?? 0;
  if (gp < 0 || gp > 20) errors.gwPct = "Enter a fee between 0% and 20%.";
  const valid = Object.keys(errors).length === 0;

  const rows = valid
    ? costPlans({
        sales: s as number,
        orders: o as number,
        billing,
        payments,
        gatewayPct: gp,
        gatewayFixed: parseNum(gwFixed) ?? 0,
        wooHosting: parseNum(hosting) ?? 0,
        wooExtensionsYear: parseNum(ext) ?? 0,
      })
    : [];
  const cheapest = rows.find((r) => !r.overCap);
  const sources = Array.from(new Map(platformPlans.map((p) => [p.source.url, p.source])).values());

  return (
    <div className="space-y-10">
      <form onSubmit={(e) => e.preventDefault()} aria-label="Store platform inputs" className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <NumberField label="Monthly online sales" hint="In US dollars" value={sales} onChange={setSales} prefix="$" error={errors.sales} />
            <NumberField label="Orders per month" value={orders} onChange={setOrders} error={errors.orders} step="1" />
          </div>
          <Segmented legend="Billing" name="billing" value={billing} onChange={setBilling} options={[["monthly", "Pay monthly"], ["annual", "Pay yearly"]] as const} />
        </div>
        <div className="space-y-6">
          <div>
            <Segmented
              legend="How will you take card payments?"
              name="payments"
              value={payments}
              onChange={setPayments}
              options={[["own", "Platform's own payments"], ["third", "Another payment gateway"]] as const}
            />
            {ownUnavailable ? (
              <p className="mt-2 text-xs font-medium text-gold-strong">
                Shopify Payments isn&apos;t available to businesses in {market.label}, so another gateway is selected.
              </p>
            ) : null}
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <NumberField label="Gateway fee" hint="Also used where a platform's own rate isn't published" value={gwPct} onChange={setGwPct} suffix="%" error={errors.gwPct} />
            <NumberField label="Gateway fixed fee" hint="Per transaction, in USD" value={gwFixed} onChange={setGwFixed} prefix="$" />
            <NumberField label="WooCommerce hosting" hint="Per month" value={hosting} onChange={setHosting} prefix="$" />
            <NumberField label="WooCommerce extensions" hint="Per year" value={ext} onChange={setExt} prefix="$" />
          </div>
        </div>
      </form>

      <section aria-labelledby="platform-results">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 id="platform-results" className="text-xl">
            Monthly cost at your sales
          </h2>
          <p className="text-sm text-muted">
            Prices checked {PLATFORMS_CHECKED_ON}, in US dollars from each platform&apos;s US pricing page.
          </p>
        </div>
        {cheapest ? (
          <p className="mt-3 text-sm text-slate" aria-live="polite">
            Lowest cost: <strong className="text-ink">{cheapest.plan.platform} {cheapest.plan.plan}</strong> at {usd(cheapest.total)} a month,{" "}
            {(s as number) > 0 ? `${((cheapest.total / (s as number)) * 100).toFixed(1)}% of sales` : "with no sales yet"}.
          </p>
        ) : null}
        <div className="mt-4 overflow-x-auto rounded-[var(--radius-md)] border border-line bg-surface" tabIndex={0} role="region" aria-label="Platform cost table, scrolls sideways on small screens">
          <table className="w-full min-w-[46rem] text-right text-sm tabular-nums">
            <thead className="bg-paper text-xs text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-semibold">Platform and plan</th>
                <th scope="col" className="px-4 py-3 font-semibold">Subscription</th>
                <th scope="col" className="px-4 py-3 font-semibold">Platform fees</th>
                <th scope="col" className="px-4 py-3 font-semibold">Card processing</th>
                <th scope="col" className="px-4 py-3 font-semibold">Hosting and extras</th>
                <th scope="col" className="px-4 py-3 font-semibold">Total a month</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => {
                const best = cheapest?.plan.id === r.plan.id;
                return (
                  <tr key={r.plan.id} className={cx(best && "bg-gold-soft/50", r.overCap && "text-muted")}>
                    <th scope="row" className="px-4 py-3 text-left font-normal">
                      <span className="block font-semibold text-ink">
                        {r.plan.platform} {r.plan.plan}
                        {best ? <span className="ml-2 rounded-full bg-gold-soft px-2 py-0.5 text-xs font-semibold text-gold-strong ring-1 ring-gold/30">Lowest</span> : null}
                      </span>
                      {r.overCap ? <span className="block text-xs text-danger">Your sales exceed this plan&apos;s limit</span> : null}
                      {r.plan.note ? <span className="block max-w-[22rem] text-xs text-muted">{r.plan.note}</span> : null}
                    </th>
                    <td className="px-4 py-3">{usd(r.subscription)}</td>
                    <td className="px-4 py-3">{r.platformFees ? usd(r.platformFees) : "—"}</td>
                    <td className="px-4 py-3">{usd(r.processing)}</td>
                    <td className="px-4 py-3">{r.extras ? usd(r.extras) : "—"}</td>
                    <td className="px-4 py-3 font-semibold text-ink">{usd(r.total)}</td>
                  </tr>
                );
              })}
              {!rows.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-left text-sm text-muted">
                    Enter your sales and orders to compare platforms.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          Wix is not included: its pricing page shows prices that vary by location, and we couldn&apos;t confirm US prices on the date checked.
        </p>
      </section>

      <MethodNote
        formulas={[
          "Platform fees = sales × the platform's fee (some platforms charge extra when you use another gateway)",
          "Card processing = sales × card rate + orders × fixed fee",
          "Total = subscription + platform fees + card processing + hosting and extras",
        ]}
      >
        <p>
          Plans differ in features, not only cost. Themes, apps, staff accounts and payment availability in your country can matter more than a few
          dollars a month. Prices can differ in your country; confirm on each platform&apos;s site.
        </p>
        <p className="flex flex-wrap gap-x-4 gap-y-1">
          <span>Sources:</span>
          {sources.map((src) => (
            <a key={src.url} href={src.url} target="_blank" rel="noopener noreferrer" className="font-medium text-gold-strong underline underline-offset-2">
              {src.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ))}
        </p>
      </MethodNote>
    </div>
  );
}
