"use client";

import { useState, type ReactNode } from "react";
import { formatMoney, useMarket } from "@/lib/market";
import { CalcLayout, MarketNote, MethodNote, NumberField, ResultRow, ResultsPanel, currencySymbol, fmtPct, parseNum } from "./CalcParts";

const roas = (n: number) => (Number.isFinite(n) && n > 0 ? `${n.toLocaleString("en", { maximumFractionDigits: 2 })}x` : "—");

export function AdProfitabilityCalculator() {
  const market = useMarket();
  const symbol = currencySymbol(market.locale, market.currency);
  const [aov, setAov] = useState("60");
  const [cogs, setCogs] = useState("22");
  const [other, setOther] = useState("8");
  const [target, setTarget] = useState("10");
  const [cpc, setCpc] = useState("0.80");
  const [cr, setCr] = useState("3");

  const a = parseNum(aov);
  const c = parseNum(cogs);
  const o = parseNum(other) ?? 0;
  const t = parseNum(target) ?? 0;
  const k = parseNum(cpc);
  const r = parseNum(cr);

  const errors: Record<string, string> = {};
  if (a === null) errors.aov = "Enter the average order value.";
  else if (a <= 0) errors.aov = "Order value must be greater than zero.";
  if (c === null) errors.cogs = "Enter the product cost per order.";
  else if (c < 0) errors.cogs = "Cost can't be negative.";
  if (o < 0) errors.other = "Costs can't be negative.";
  if (t < 0) errors.target = "Target profit can't be negative.";
  if (cpc !== "" && (k === null || k < 0)) errors.cpc = "Cost per click can't be negative.";
  if (cr !== "" && (r === null || r <= 0 || r > 100)) errors.cr = "Enter a conversion rate above 0% and up to 100%.";
  const valid = Object.keys(errors).length === 0;

  const contribution = valid ? (a as number) - (c as number) - o : NaN;
  const noRoom = valid && contribution <= 0;
  const beCpa = contribution;
  const beRoas = (a ?? NaN) / contribution;
  const targetCpa = contribution - t;
  const targetRoas = targetCpa > 0 ? (a ?? NaN) / targetCpa : NaN;
  const hasCampaign = valid && k !== null && r !== null && cpc !== "" && cr !== "";
  const expectedCpa = hasCampaign ? (k as number) / ((r as number) / 100) : NaN;
  const profitAfterAds = contribution - expectedCpa;
  const expectedRoas = hasCampaign && expectedCpa > 0 ? (a as number) / expectedCpa : NaN;

  let verdict: ReactNode = "Add a cost per click and conversion rate to test a specific campaign.";
  if (noRoom) verdict = <span className="font-medium text-[#f4a39c]">Each order loses money before any advertising. Fix price or costs first.</span>;
  else if (hasCampaign) {
    if (profitAfterAds < 0)
      verdict = (
        <span className="font-medium text-[#f4a39c]">
          At these numbers each sale from ads loses {formatMoney(-profitAfterAds, market)}. Lower the cost per click, raise conversion, or raise order value.
        </span>
      );
    else if (profitAfterAds < t)
      verdict = `Profitable, but ${formatMoney(t - profitAfterAds, market)} per order short of your target.`;
    else verdict = "This campaign meets your profit target per order.";
  }

  const m = (v: number) => (valid && Number.isFinite(v) ? formatMoney(v, market) : "—");

  return (
    <CalcLayout
      label="Advertising profitability inputs"
      inputs={
        <>
          <div className="grid gap-6 sm:grid-cols-2">
            <NumberField label="Average order value" hint="What a customer spends per order, before tax" value={aov} onChange={setAov} prefix={symbol} error={errors.aov} />
            <NumberField label="Product cost per order" hint="Landed cost of the goods in the order" value={cogs} onChange={setCogs} prefix={symbol} error={errors.cogs} />
            <NumberField label="Other costs per order" hint="Shipping, payment and marketplace fees, packaging" value={other} onChange={setOther} prefix={symbol} error={errors.other} />
            <NumberField label="Profit you want per order" hint="Optional, after advertising" value={target} onChange={setTarget} prefix={symbol} error={errors.target} />
          </div>
          <div>
            <h2 className="text-base font-semibold">Test a campaign</h2>
            <p className="mt-1 text-sm text-muted">Optional. Use figures from your ad platform or a realistic estimate.</p>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <NumberField label="Cost per click" value={cpc} onChange={setCpc} prefix={symbol} error={errors.cpc} />
              <NumberField label="Conversion rate" hint="Share of clicks that become orders" value={cr} onChange={setCr} suffix="%" error={errors.cr} />
            </div>
          </div>
        </>
      }
      results={
        <ResultsPanel title="Your advertising limits" footer={verdict}>
          <ResultRow emphasis label="Break-even ROAS" value={noRoom ? "Not possible" : roas(beRoas)} note="Revenue per 1 spent on ads to break even" />
          <ResultRow label="Most you can pay per sale" value={noRoom ? "—" : m(beCpa)} note="Break-even cost per acquisition" />
          {t > 0 ? <ResultRow label="Cost per sale for your target" value={noRoom || targetCpa <= 0 ? "Not reachable" : m(targetCpa)} note={targetCpa > 0 ? `Needs ROAS of ${roas(targetRoas)}` : undefined} /> : null}
          <ResultRow label="Profit per order before ads" value={m(contribution)} note={valid ? `${fmtPct((contribution / (a as number)) * 100)} of order value` : undefined} />
          {hasCampaign ? (
            <>
              <ResultRow label="Expected cost per sale" value={m(expectedCpa)} note={`Expected ROAS ${roas(expectedRoas)}`} />
              <ResultRow label="Profit per order after ads" value={m(profitAfterAds)} />
            </>
          ) : null}
        </ResultsPanel>
      }
      method={
        <MethodNote
          formulas={[
            "Profit before ads = order value − product cost − other costs",
            "Break-even cost per sale = profit before ads",
            "Break-even ROAS = order value ÷ profit before ads",
            "Expected cost per sale = cost per click ÷ conversion rate",
          ]}
        >
          <p>
            This treats each order on its own. Repeat purchases can justify paying more for a first sale; use lifetime value for that decision, and be
            cautious about counting on repeat sales you haven&apos;t seen yet.
          </p>
          <MarketNote label={market.label} currency={market.currency} />
        </MethodNote>
      }
    />
  );
}
