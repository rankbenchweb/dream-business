"use client";

import { useState, type ReactNode } from "react";
import { formatMoney, useMarket } from "@/lib/market";
import { CalcLayout, MarketNote, MethodNote, NumberField, ResultRow, ResultsPanel, currencySymbol, parseNum } from "./CalcParts";

export function CacLtvCalculator() {
  const market = useMarket();
  const symbol = currencySymbol(market.locale, market.currency);
  const [spend, setSpend] = useState("3000");
  const [customers, setCustomers] = useState("120");
  const [aov, setAov] = useState("45");
  const [margin, setMargin] = useState("40");
  const [freq, setFreq] = useState("3");
  const [years, setYears] = useState("2");

  const s = parseNum(spend);
  const c = parseNum(customers);
  const a = parseNum(aov);
  const mg = parseNum(margin);
  const fq = parseNum(freq);
  const y = parseNum(years);

  const errors: Record<string, string> = {};
  if (s === null || s < 0) errors.spend = "Enter marketing and sales spend for the period.";
  if (c === null) errors.customers = "Enter how many new customers that spend brought.";
  else if (c <= 0 || !Number.isInteger(c)) errors.customers = "Use a whole number above zero.";
  if (a === null || a <= 0) errors.aov = "Enter an average order value above zero.";
  if (mg === null || mg < 0 || mg > 100) errors.margin = "Enter a gross margin from 0% to 100%.";
  if (fq === null || fq <= 0) errors.freq = "Enter orders per customer per year, above zero.";
  if (y === null || y <= 0 || y > 50) errors.years = "Enter how many years a customer typically stays.";
  const valid = Object.keys(errors).length === 0;

  const cac = valid ? (s as number) / (c as number) : NaN;
  const grossPerYear = valid ? (a as number) * ((mg as number) / 100) * (fq as number) : NaN;
  const ltv = grossPerYear * (y ?? NaN);
  const ratio = ltv / cac;
  const payback = grossPerYear > 0 ? cac / (grossPerYear / 12) : NaN;
  const ratioText = valid && Number.isFinite(ratio) ? `${ratio.toLocaleString("en", { maximumFractionDigits: 1 })} : 1` : cac === 0 && valid ? "No acquisition cost" : "—";

  let verdict: ReactNode = "A common rule of thumb is a lifetime value of at least three times acquisition cost. It is a guide, not a law.";
  if (valid && Number.isFinite(ratio)) {
    if (ratio < 1) verdict = <span className="font-medium text-[#f4a39c]">Each customer costs more to win than they are worth. Growth with paid acquisition loses money.</span>;
    else if (ratio < 3) verdict = "Customers are worth more than they cost, but the margin for error is slim. Improve retention or lower acquisition cost before scaling.";
    else verdict = "Customers are worth comfortably more than they cost. Check that the lifespan you entered is backed by real repeat purchases.";
  }

  return (
    <CalcLayout
      label="Customer acquisition and lifetime value inputs"
      inputs={
        <>
          <div>
            <h2 className="text-base font-semibold">Winning customers</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <NumberField label="Marketing and sales spend" hint="For one period: ads, agencies, sales salaries" value={spend} onChange={setSpend} prefix={symbol} error={errors.spend} />
              <NumberField label="New customers in that period" value={customers} onChange={setCustomers} error={errors.customers} step="1" />
            </div>
          </div>
          <div>
            <h2 className="text-base font-semibold">What a customer is worth</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <NumberField label="Average order value" value={aov} onChange={setAov} prefix={symbol} error={errors.aov} />
              <NumberField label="Gross margin" hint="Share of each order left after product and delivery costs" value={margin} onChange={setMargin} suffix="%" error={errors.margin} />
              <NumberField label="Orders per customer per year" value={freq} onChange={setFreq} error={errors.freq} />
              <NumberField label="Years a customer stays" hint="Use your own repeat-purchase history if you have it" value={years} onChange={setYears} error={errors.years} />
            </div>
          </div>
        </>
      }
      results={
        <ResultsPanel title="Customer economics" footer={verdict}>
          <ResultRow emphasis label="Lifetime value to cost" value={ratioText} />
          <ResultRow label="Cost to acquire a customer" value={valid ? formatMoney(cac, market) : "—"} />
          <ResultRow label="Lifetime value" value={valid ? formatMoney(ltv, market) : "—"} note="Gross profit over the customer's lifetime" />
          <ResultRow label="Gross profit per year" value={valid ? formatMoney(grossPerYear, market) : "—"} />
          <ResultRow
            label="Months to earn back acquisition cost"
            value={valid && Number.isFinite(payback) ? (payback < 1 ? "Under 1 month" : `${Math.ceil(payback)} months`) : "—"}
          />
        </ResultsPanel>
      }
      method={
        <MethodNote
          formulas={[
            "Acquisition cost = marketing and sales spend ÷ new customers",
            "Gross profit per year = order value × gross margin × orders per year",
            "Lifetime value = gross profit per year × years a customer stays",
            "Payback = acquisition cost ÷ monthly gross profit per customer",
          ]}
        >
          <p>Lifetime value here uses gross profit, not revenue, so it shows what a customer actually contributes. It does not discount future profit.</p>
          <MarketNote label={market.label} currency={market.currency} />
        </MethodNote>
      }
    />
  );
}
