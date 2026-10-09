"use client";

import { useState } from "react";
import { formatMoney, useMarket } from "@/lib/market";
import { NumberField, ResultRow, ResultsPanel, currencySymbol, parseNum } from "./CalcParts";

const units = (n: number) => (Number.isFinite(n) ? Math.ceil(n).toLocaleString("en") : "—");

export function BreakEvenCalculator() {
  const market = useMarket();
  const symbol = currencySymbol(market.locale, market.currency);
  const [fixed, setFixed] = useState("5000");
  const [price, setPrice] = useState("50");
  const [variable, setVariable] = useState("30");
  const [target, setTarget] = useState("");

  const f = parseNum(fixed);
  const p = parseNum(price);
  const v = parseNum(variable);
  const t = parseNum(target);

  const errors: Record<string, string> = {};
  if (f === null) errors.fixed = "Enter your fixed costs for the period.";
  else if (f < 0) errors.fixed = "Fixed costs can't be negative.";
  if (p === null) errors.price = "Enter the selling price per unit.";
  else if (p <= 0) errors.price = "Price must be greater than zero.";
  if (v === null) errors.variable = "Enter the variable cost per unit.";
  else if (v < 0) errors.variable = "Variable cost can't be negative.";
  if (t !== null && t < 0) errors.target = "Target profit can't be negative.";
  if (!errors.price && !errors.variable && p !== null && v !== null && p <= v) {
    errors.price = "Price must be higher than the variable cost, or every sale adds to the loss.";
  }
  const valid = Object.keys(errors).length === 0;

  const cm = (p ?? NaN) - (v ?? NaN);
  const cmRatio = cm / (p ?? NaN);
  const beUnits = valid ? (f as number) / cm : NaN;
  const beRevenue = valid ? Math.ceil(beUnits) * (p as number) : NaN;
  const targetUnits = valid && t !== null ? ((f as number) + t) / cm : NaN;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-x-12">
      <form className="space-y-6 lg:col-start-1 lg:row-start-1" onSubmit={(e) => e.preventDefault()} aria-label="Break-even inputs">
        <div className="grid gap-6 sm:grid-cols-2">
          <NumberField label="Fixed costs" hint="For one period, e.g. a month: rent, salaries, software" value={fixed} onChange={setFixed} prefix={symbol} error={errors.fixed} />
          <NumberField label="Selling price per unit" hint="Before sales tax" value={price} onChange={setPrice} prefix={symbol} error={errors.price} />
          <NumberField label="Variable cost per unit" hint="Product, shipping, payment fees per sale" value={variable} onChange={setVariable} prefix={symbol} error={errors.variable} />
          <NumberField label="Target profit (optional)" hint="Profit you want for the same period" value={target} onChange={setTarget} prefix={symbol} error={errors.target} />
        </div>

      </form>

      <ResultsPanel
        className="self-start lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-36"
        title="Results"
        footer="Break-even is the point where sales cover all costs for the period. Every unit beyond it adds its contribution to profit."
      >
        <ResultRow emphasis label="Break-even units" value={units(beUnits)} />
        <ResultRow label="Break-even revenue" value={valid ? formatMoney(beRevenue, market, 0) : "—"} />
        <ResultRow label="Contribution per unit" value={valid ? formatMoney(cm, market) : "—"} />
        <ResultRow
          label="Contribution margin"
          value={valid ? `${(cmRatio * 100).toLocaleString("en", { maximumFractionDigits: 1 })}%` : "—"}
        />
        {t !== null ? <ResultRow label="Units for target profit" value={units(targetUnits)} /> : null}
      </ResultsPanel>

      <div className="rounded-[var(--radius-md)] border border-line bg-surface p-5 text-sm text-slate lg:col-start-1 lg:row-start-2">
        <h2 className="text-sm font-semibold text-ink">How this is calculated</h2>
        <ul className="mt-2 space-y-1">
          <li>Contribution per unit = price − variable cost</li>
          <li>Break-even units = fixed costs ÷ contribution per unit, rounded up</li>
          <li>Units for target = (fixed costs + target profit) ÷ contribution per unit</li>
        </ul>
        <p className="mt-3 text-xs text-muted">
          Assumes price and variable cost stay the same at every volume. Amounts use the {market.label} market ({market.currency}).
        </p>
      </div>
    </div>
  );
}
