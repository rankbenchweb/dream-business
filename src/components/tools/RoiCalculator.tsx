"use client";

import { useState } from "react";
import { formatMoney, useMarket } from "@/lib/market";
import { CalcLayout, MarketNote, MethodNote, NumberField, ResultRow, ResultsPanel, Segmented, currencySymbol, fmtPct, parseNum } from "./CalcParts";

type Unit = "months" | "years";

function duration(months: number) {
  if (!Number.isFinite(months)) return "—";
  if (months < 1) return "Under 1 month";
  const m = Math.ceil(months);
  if (m < 24) return `${m} ${m === 1 ? "month" : "months"}`;
  const y = Math.floor(m / 12);
  const r = m % 12;
  return r ? `${y} years ${r} ${r === 1 ? "month" : "months"}` : `${y} years`;
}

export function RoiCalculator() {
  const market = useMarket();
  const symbol = currencySymbol(market.locale, market.currency);
  const [invest, setInvest] = useState("10000");
  const [back, setBack] = useState("14000");
  const [period, setPeriod] = useState("18");
  const [unit, setUnit] = useState<Unit>("months");

  const i = parseNum(invest);
  const b = parseNum(back);
  const p = parseNum(period);

  const errors: Record<string, string> = {};
  if (i === null) errors.invest = "Enter the amount invested.";
  else if (i <= 0) errors.invest = "The investment must be greater than zero.";
  if (b === null) errors.back = "Enter the total amount you expect back.";
  else if (b < 0) errors.back = "The amount back can't be negative.";
  if (p === null) errors.period = "Enter how long it takes.";
  else if (p <= 0) errors.period = "The period must be greater than zero.";
  const valid = Object.keys(errors).length === 0;

  const months = valid ? (unit === "years" ? (p as number) * 12 : (p as number)) : NaN;
  const gain = valid ? (b as number) - (i as number) : NaN;
  const roi = valid ? (gain / (i as number)) * 100 : NaN;
  const annual = valid && (b as number) > 0 ? (Math.pow((b as number) / (i as number), 12 / months) - 1) * 100 : NaN;
  const monthlyBack = valid ? (b as number) / months : NaN;
  const payback = valid && monthlyBack > 0 ? (i as number) / monthlyBack : NaN;
  const neverPaysBack = valid && (b as number) < (i as number);

  return (
    <CalcLayout
      label="Return on investment inputs"
      inputs={
        <>
          <div className="grid gap-6 sm:grid-cols-2">
            <NumberField label="Amount invested" hint="Everything you put in: equipment, stock, campaign spend" value={invest} onChange={setInvest} prefix={symbol} error={errors.invest} />
            <NumberField label="Total amount back" hint="All money the investment returns over the period" value={back} onChange={setBack} prefix={symbol} error={errors.back} />
            <NumberField label="Over what period" hint="How long until you have received that amount" value={period} onChange={setPeriod} error={errors.period} />
            <div className="sm:pt-[1.15rem]">
              <Segmented legend="Period in" name="roi-unit" value={unit} onChange={setUnit} options={[["months", "Months"], ["years", "Years"]] as const} />
            </div>
          </div>
        </>
      }
      results={
        <ResultsPanel
          title="Results"
          footer={
            neverPaysBack ? (
              <span className="font-medium text-[#f4a39c]">You get back less than you put in, so this investment loses money.</span>
            ) : (
              "Use annualised ROI to compare investments that run for different lengths of time."
            )
          }
        >
          <ResultRow emphasis label="Return on investment" value={fmtPct(roi)} />
          <ResultRow label="Net gain" value={valid ? formatMoney(gain, market) : "—"} />
          <ResultRow label="Annualised ROI" value={fmtPct(annual)} note="Compound yearly rate" />
          <ResultRow label="Payback period" value={neverPaysBack ? "Doesn't pay back" : duration(payback)} note="Assuming returns arrive evenly" />
        </ResultsPanel>
      }
      method={
        <MethodNote
          formulas={[
            "Net gain = amount back − amount invested",
            "ROI = net gain ÷ amount invested",
            "Annualised ROI = (amount back ÷ invested)^(12 ÷ months) − 1",
            "Payback = invested ÷ (amount back ÷ months)",
          ]}
        >
          <MarketNote label={market.label} currency={market.currency} />
        </MethodNote>
      }
    />
  );
}
