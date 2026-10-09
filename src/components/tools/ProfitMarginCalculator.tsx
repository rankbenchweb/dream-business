"use client";

import { useState } from "react";
import { formatMoney, useMarket } from "@/lib/market";
import { cx } from "@/components/ui";
import { NumberField, ResultRow, ResultsPanel, currencySymbol, parseNum } from "./CalcParts";

type Mode = "price" | "target";

const pct = (n: number) => (Number.isFinite(n) ? `${n.toLocaleString("en", { maximumFractionDigits: 2 })}%` : "—");

export function ProfitMarginCalculator() {
  const market = useMarket();
  const symbol = currencySymbol(market.locale, market.currency);
  const [mode, setMode] = useState<Mode>("price");
  const [cost, setCost] = useState("40");
  const [price, setPrice] = useState("65");
  const [target, setTarget] = useState("35");

  const c = parseNum(cost);
  const p = parseNum(price);
  const t = parseNum(target);

  const errors: Record<string, string> = {};
  if (c === null) errors.cost = "Enter the cost per unit.";
  else if (c < 0) errors.cost = "Cost can't be negative.";
  if (mode === "price") {
    if (p === null) errors.price = "Enter the selling price per unit.";
    else if (p <= 0) errors.price = "Price must be greater than zero.";
  } else {
    if (t === null) errors.target = "Enter the margin you want.";
    else if (t < 0 || t >= 100) errors.target = "Margin must be at least 0% and below 100%.";
  }
  const valid = Object.keys(errors).length === 0;

  let sell = NaN;
  if (valid && c !== null) sell = mode === "price" ? (p as number) : c / (1 - (t as number) / 100);
  const profit = sell - (c ?? NaN);
  const margin = (profit / sell) * 100;
  const markup = c ? (profit / c) * 100 : NaN;
  const loss = valid && profit < 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-x-12">
      <form className="space-y-6 lg:col-start-1 lg:row-start-1" onSubmit={(e) => e.preventDefault()} aria-label="Profit margin inputs">
        <fieldset>
          <legend className="text-sm font-semibold text-ink">What do you want to work out?</legend>
          <div className="mt-2 inline-flex rounded-[var(--radius-sm)] border border-line-strong bg-surface p-1">
            {(
              [
                ["price", "Margin from my price"],
                ["target", "Price for a target margin"],
              ] as const
            ).map(([m, label]) => (
              <label
                key={m}
                className={cx(
                  "cursor-pointer rounded-[3px] px-3 py-2 text-sm font-medium has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold",
                  mode === m ? "bg-ink text-white" : "text-slate hover:text-ink",
                )}
              >
                <input type="radio" name="mode" value={m} checked={mode === m} onChange={() => setMode(m)} className="sr-only" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-6 sm:grid-cols-2">
          <NumberField label="Cost per unit" hint="Product, packaging and any per-unit fees" value={cost} onChange={setCost} prefix={symbol} error={errors.cost} />
          {mode === "price" ? (
            <NumberField label="Selling price per unit" hint="Before sales tax" value={price} onChange={setPrice} prefix={symbol} error={errors.price} />
          ) : (
            <NumberField label="Target gross margin" hint="Profit as a share of the price" value={target} onChange={setTarget} suffix="%" error={errors.target} />
          )}
        </div>

      </form>

      <ResultsPanel
        className="self-start lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-36"
        title="Results"
        footer={
          loss ? (
            <span className="font-medium text-[#f4a39c]">The price is below cost, so each sale loses money.</span>
          ) : (
            "Gross margin excludes overheads such as rent, salaries and advertising. Use the break-even calculator to include them."
          )
        }
      >
        {mode === "target" ? <ResultRow emphasis label="Selling price" value={valid ? formatMoney(sell, market) : "—"} /> : null}
        <ResultRow emphasis={mode === "price"} label="Gross margin" value={valid ? pct(margin) : "—"} />
        <ResultRow label="Profit per unit" value={valid ? formatMoney(profit, market) : "—"} />
        <ResultRow label="Markup" value={valid ? pct(markup) : "—"} note={c === 0 ? "Not defined when cost is zero" : undefined} />
      </ResultsPanel>

      <div className="rounded-[var(--radius-md)] border border-line bg-surface p-5 text-sm text-slate lg:col-start-1 lg:row-start-2">
        <h2 className="text-sm font-semibold text-ink">How this is calculated</h2>
        <ul className="mt-2 space-y-1">
          <li>Profit per unit = price − cost</li>
          <li>Gross margin = profit ÷ price</li>
          <li>Markup = profit ÷ cost</li>
          {mode === "target" ? <li>Price for target margin = cost ÷ (1 − margin)</li> : null}
        </ul>
        <p className="mt-3 text-xs text-muted">
          Amounts use the {market.label} market ({market.currency}). Change it with the market selector in the header. Results are calculated in your
          browser; nothing is sent to us.
        </p>
      </div>
    </div>
  );
}
