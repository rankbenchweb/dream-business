"use client";

import { useState } from "react";
import { formatMoney, useMarket } from "@/lib/market";
import { CalcLayout, MarketNote, MethodNote, NumberField, ResultRow, ResultsPanel, currencySymbol, fmtPct, parseNum } from "./CalcParts";

export function AmazonFbaCalculator() {
  const market = useMarket();
  const symbol = currencySymbol(market.locale, market.currency);
  const [price, setPrice] = useState("29.99");
  const [cost, setCost] = useState("7.50");
  const [inbound, setInbound] = useState("0.80");
  const [referral, setReferral] = useState("15");
  const [fbaFee, setFbaFee] = useState("4.50");
  const [storage, setStorage] = useState("0.15");
  const [other, setOther] = useState("0");
  const [ads, setAds] = useState("3");
  const [fbmShip, setFbmShip] = useState("5.50");
  const [fbmPack, setFbmPack] = useState("0.60");
  const [fbmHandling, setFbmHandling] = useState("1.20");

  const n = (v: string) => parseNum(v) ?? 0;
  const p = parseNum(price);
  const c = parseNum(cost);
  const errors: Record<string, string> = {};
  if (p === null || p <= 0) errors.price = "Enter your selling price.";
  if (c === null || c < 0) errors.cost = "Enter your product cost per unit.";
  if (n(referral) < 0 || n(referral) > 100) errors.referral = "Enter a percentage from 0 to 100.";
  for (const [k, v] of [["inbound", inbound], ["fbaFee", fbaFee], ["storage", storage], ["other", other], ["ads", ads], ["fbmShip", fbmShip], ["fbmPack", fbmPack], ["fbmHandling", fbmHandling]] as const) {
    if (n(v) < 0) errors[k] = "This can't be negative.";
  }
  const valid = Object.keys(errors).length === 0;

  const refFee = (p ?? 0) * (n(referral) / 100);
  const shared = (c ?? 0) + refFee + n(other) + n(ads);
  const fbaCosts = shared + n(inbound) + n(fbaFee) + n(storage);
  const fbmCosts = shared + n(fbmShip) + n(fbmPack) + n(fbmHandling);
  const fbaProfit = (p ?? 0) - fbaCosts;
  const fbmProfit = (p ?? 0) - fbmCosts;
  const diff = fbaProfit - fbmProfit;
  const m = (v: number) => (valid ? formatMoney(v, market) : "—");

  let verdict = "Fees vary by marketplace, category, size and season. Re-check them in Seller Central before you order stock.";
  if (valid) {
    if (fbaProfit <= 0 && fbmProfit <= 0) verdict = "Both methods lose money at this price. Raise the price, lower product cost or cut advertising per unit.";
    else if (Math.abs(diff) < 0.01) verdict = "Both methods earn the same per unit. Compare the time you would spend packing and shipping yourself.";
    else if (diff > 0) verdict = `Amazon fulfilment earns ${formatMoney(diff, market)} more per unit, and saves you packing and shipping time.`;
    else verdict = `Fulfilling yourself earns ${formatMoney(-diff, market)} more per unit, but you handle storage, packing and delivery promises.`;
  }

  return (
    <CalcLayout
      label="Amazon FBA inputs"
      inputs={
        <>
          <div>
            <h2 className="text-base font-semibold">Product</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <NumberField label="Selling price" value={price} onChange={setPrice} prefix={symbol} error={errors.price} />
              <NumberField label="Product cost per unit" hint="Landed cost: supplier, freight and duty" value={cost} onChange={setCost} prefix={symbol} error={errors.cost} />
              <NumberField label="Referral fee" hint="Amazon's percentage for your category" value={referral} onChange={setReferral} suffix="%" error={errors.referral} />
              <NumberField label="Advertising per unit" hint="Ad spend divided by units sold" value={ads} onChange={setAds} prefix={symbol} error={errors.ads} />
              <NumberField label="Other fees per unit" hint="Closing fees, returns allowance, labels" value={other} onChange={setOther} prefix={symbol} error={errors.other} />
            </div>
          </div>
          <div>
            <h2 className="text-base font-semibold">Fulfilled by Amazon (FBA)</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-3">
              <NumberField label="Fulfilment fee" hint="Per unit, by size and weight" value={fbaFee} onChange={setFbaFee} prefix={symbol} error={errors.fbaFee} />
              <NumberField label="Storage per unit" hint="Monthly storage ÷ units sold" value={storage} onChange={setStorage} prefix={symbol} error={errors.storage} />
              <NumberField label="Shipping to Amazon" hint="Inbound freight per unit" value={inbound} onChange={setInbound} prefix={symbol} error={errors.inbound} />
            </div>
          </div>
          <div>
            <h2 className="text-base font-semibold">Fulfilled by you (FBM)</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-3">
              <NumberField label="Delivery to customer" value={fbmShip} onChange={setFbmShip} prefix={symbol} error={errors.fbmShip} />
              <NumberField label="Packaging" value={fbmPack} onChange={setFbmPack} prefix={symbol} error={errors.fbmPack} />
              <NumberField label="Packing labour" hint="Your time or staff cost per order" value={fbmHandling} onChange={setFbmHandling} prefix={symbol} error={errors.fbmHandling} />
            </div>
          </div>
        </>
      }
      results={
        <ResultsPanel title="Profit per unit" footer={verdict}>
          <ResultRow emphasis label="With FBA" value={m(fbaProfit)} note={valid ? `${fmtPct((fbaProfit / (p as number)) * 100)} margin` : undefined} />
          <ResultRow label="Fulfilling yourself" value={m(fbmProfit)} note={valid ? `${fmtPct((fbmProfit / (p as number)) * 100)} margin` : undefined} />
          <ResultRow label="Return on product cost (FBA)" value={valid && (c as number) > 0 ? fmtPct((fbaProfit / (c as number)) * 100) : "—"} />
          <ResultRow label="Referral fee" value={m(refFee)} />
          <ResultRow label="Total Amazon fees (FBA)" value={m(refFee + n(fbaFee) + n(storage) + n(other))} />
        </ResultsPanel>
      }
      method={
        <MethodNote
          formulas={[
            "Referral fee = selling price × referral percentage",
            "FBA profit = price − product cost − referral fee − fulfilment fee − storage − shipping to Amazon − other fees − advertising",
            "FBM profit = price − product cost − referral fee − delivery − packaging − packing labour − other fees − advertising",
          ]}
        >
          <p>
            The starting values are examples only, not Amazon&apos;s current fees. Enter the referral percentage for your category and the fulfilment
            fee for your product&apos;s size and weight from Amazon&apos;s fee schedule for your marketplace in Seller Central.
          </p>
          <MarketNote label={market.label} currency={market.currency} />
        </MethodNote>
      }
    />
  );
}
