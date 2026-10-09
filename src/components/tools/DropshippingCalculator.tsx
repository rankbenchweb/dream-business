"use client";

import { useState } from "react";
import { formatMoney, useMarket } from "@/lib/market";
import { CalcLayout, MarketNote, MethodNote, NumberField, ResultRow, ResultsPanel, currencySymbol, fmtPct, parseNum } from "./CalcParts";

export function DropshippingCalculator() {
  const market = useMarket();
  const symbol = currencySymbol(market.locale, market.currency);
  const [price, setPrice] = useState("34.99");
  const [shipCharged, setShipCharged] = useState("0");
  const [product, setProduct] = useState("9.50");
  const [shipCost, setShipCost] = useState("4.50");
  const [feePct, setFeePct] = useState("2.9");
  const [feeFixed, setFeeFixed] = useState("0.30");
  const [adCost, setAdCost] = useState("12");
  const [refund, setRefund] = useState("4");
  const [orders, setOrders] = useState("300");
  const [monthly, setMonthly] = useState("79");

  const p = parseNum(price);
  const sc = parseNum(shipCharged) ?? 0;
  const pc = parseNum(product);
  const sh = parseNum(shipCost) ?? 0;
  const fp = parseNum(feePct) ?? 0;
  const ff = parseNum(feeFixed) ?? 0;
  const ad = parseNum(adCost) ?? 0;
  const rf = parseNum(refund) ?? 0;
  const n = parseNum(orders) ?? 0;
  const mo = parseNum(monthly) ?? 0;

  const errors: Record<string, string> = {};
  if (p === null) errors.price = "Enter your selling price.";
  else if (p <= 0) errors.price = "Price must be greater than zero.";
  if (pc === null) errors.product = "Enter what the supplier charges per order.";
  else if (pc < 0) errors.product = "Cost can't be negative.";
  for (const [k, v] of [["shipCharged", sc], ["shipCost", sh], ["feeFixed", ff], ["adCost", ad], ["monthly", mo]] as const) {
    if (v < 0) errors[k] = "This can't be negative.";
  }
  if (fp < 0 || fp > 50) errors.feePct = "Enter a fee between 0% and 50%.";
  if (rf < 0 || rf > 100) errors.refund = "Enter a rate from 0% to 100%.";
  if (n < 0 || !Number.isInteger(n)) errors.orders = "Use a whole number of orders.";
  const valid = Object.keys(errors).length === 0;

  const revenue = (p ?? 0) + sc;
  const fees = revenue * (fp / 100) + ff;
  const refundCost = revenue * (rf / 100);
  const profit = revenue - (pc ?? 0) - sh - fees - ad - refundCost;
  const margin = (profit / revenue) * 100;
  const monthlyProfit = profit * n - mo;
  const breakEven = profit > 0 ? Math.ceil(mo / profit) : NaN;
  const m = (v: number) => (valid ? formatMoney(v, market) : "—");

  return (
    <CalcLayout
      label="Dropshipping profit inputs"
      inputs={
        <>
          <div>
            <h2 className="text-base font-semibold">Each order</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <NumberField label="Selling price" value={price} onChange={setPrice} prefix={symbol} error={errors.price} />
              <NumberField label="Shipping charged to customer" hint="0 if you offer free shipping" value={shipCharged} onChange={setShipCharged} prefix={symbol} error={errors.shipCharged} />
              <NumberField label="Supplier product cost" value={product} onChange={setProduct} prefix={symbol} error={errors.product} />
              <NumberField label="Supplier shipping cost" value={shipCost} onChange={setShipCost} prefix={symbol} error={errors.shipCost} />
              <NumberField label="Payment fee" hint="Percentage charged by your payment provider" value={feePct} onChange={setFeePct} suffix="%" error={errors.feePct} />
              <NumberField label="Fixed fee per payment" value={feeFixed} onChange={setFeeFixed} prefix={symbol} error={errors.feeFixed} />
              <NumberField label="Advertising cost per order" hint="Ad spend divided by orders" value={adCost} onChange={setAdCost} prefix={symbol} error={errors.adCost} />
              <NumberField label="Refund rate" hint="Share of orders refunded" value={refund} onChange={setRefund} suffix="%" error={errors.refund} />
            </div>
          </div>
          <div>
            <h2 className="text-base font-semibold">Each month</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <NumberField label="Orders per month" value={orders} onChange={setOrders} error={errors.orders} step="1" />
              <NumberField label="Store and app subscriptions" hint="Platform plan, apps, domain" value={monthly} onChange={setMonthly} prefix={symbol} error={errors.monthly} />
            </div>
          </div>
        </>
      }
      results={
        <ResultsPanel
          title="Profit"
          footer={
            valid && profit <= 0 ? (
              <span className="font-medium text-[#f4a39c]">Each order loses money. Raise the price, lower advertising cost per order, or find a cheaper supplier.</span>
            ) : (
              "Advertising is usually the biggest variable. Check your limits with the advertising profitability calculator."
            )
          }
        >
          <ResultRow emphasis label="Profit per order" value={m(profit)} />
          <ResultRow label="Profit margin" value={valid ? fmtPct(margin) : "—"} />
          <ResultRow label="Monthly profit" value={m(monthlyProfit)} note={`${n.toLocaleString("en")} orders, after subscriptions`} />
          <ResultRow label="Orders to cover subscriptions" value={valid ? (Number.isFinite(breakEven) ? breakEven.toLocaleString("en") : "Not possible") : "—"} />
          <ResultRow label="Payment fees per order" value={m(fees)} />
          <ResultRow label="Refund cost per order" value={m(refundCost)} note="Average across all orders" />
        </ResultsPanel>
      }
      method={
        <MethodNote
          formulas={[
            "Revenue per order = price + shipping charged",
            "Payment fees = revenue × fee % + fixed fee",
            "Refund cost = revenue × refund rate",
            "Profit per order = revenue − product − shipping − fees − advertising − refund cost",
          ]}
        >
          <p>
            Assumes refunded orders are not returned for resale, which is common in dropshipping, and that payment fees are not returned on refunds.
            Check your provider&apos;s current fee schedule; fees differ by country and plan.
          </p>
          <MarketNote label={market.label} currency={market.currency} />
        </MethodNote>
      }
    />
  );
}
