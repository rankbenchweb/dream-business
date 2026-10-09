"use client";

import { useState, type ReactNode } from "react";
import { CalcLayout, MethodNote, NumberField, ResultRow, ResultsPanel, parseNum } from "./CalcParts";

const units = (n: number) => (Number.isFinite(n) ? Math.ceil(n).toLocaleString("en") : "—");

export function InventoryReorderPlanner() {
  const [avg, setAvg] = useState("20");
  const [peak, setPeak] = useState("30");
  const [lead, setLead] = useState("14");
  const [maxLead, setMaxLead] = useState("21");
  const [stock, setStock] = useState("500");
  const [cover, setCover] = useState("30");

  const a = parseNum(avg);
  const pk = parseNum(peak);
  const l = parseNum(lead);
  const ml = parseNum(maxLead);
  const s = parseNum(stock);
  const cv = parseNum(cover);

  const errors: Record<string, string> = {};
  if (a === null || a <= 0) errors.avg = "Enter average units sold per day, above zero.";
  if (pk === null) errors.peak = "Enter your busiest day's sales.";
  else if (a !== null && pk < a) errors.peak = "Peak sales can't be lower than the average.";
  if (l === null || l < 0) errors.lead = "Enter the usual days from order to arrival.";
  if (ml === null) errors.maxLead = "Enter the longest delivery time you have seen.";
  else if (l !== null && ml < l) errors.maxLead = "The longest lead time can't be shorter than the usual one.";
  if (s === null || s < 0) errors.stock = "Enter the units you have now.";
  if (cv === null || cv <= 0) errors.cover = "Enter how many days each order should last.";
  const valid = Object.keys(errors).length === 0;

  const safety = valid ? (pk as number) * (ml as number) - (a as number) * (l as number) : NaN;
  const leadDemand = valid ? (a as number) * (l as number) : NaN;
  const rop = leadDemand + safety;
  const daysLeft = valid ? (s as number) / (a as number) : NaN;
  const orderNow = valid && (s as number) <= rop;
  const daysUntil = valid ? ((s as number) - rop) / (a as number) : NaN;
  const qty = valid ? Math.max(0, rop + (a as number) * (cv as number) - (s as number)) : NaN;

  let verdict: ReactNode = "Recalculate whenever your sales rate or supplier lead time changes.";
  if (valid) {
    if ((s as number) < leadDemand)
      verdict = (
        <span className="font-medium text-[#f4a39c]">
          Current stock won&apos;t last until a new order arrives. Order now and consider faster shipping to avoid selling out.
        </span>
      );
    else if (orderNow) verdict = <span className="font-medium text-gold-pale">You are at or below your reorder point. Place an order now.</span>;
  }

  return (
    <CalcLayout
      label="Inventory reorder inputs"
      inputs={
        <>
          <div>
            <h2 className="text-base font-semibold">Sales</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <NumberField label="Average units sold per day" value={avg} onChange={setAvg} error={errors.avg} />
              <NumberField label="Units sold on a busy day" hint="A high but realistic day, not a one-off spike" value={peak} onChange={setPeak} error={errors.peak} />
            </div>
          </div>
          <div>
            <h2 className="text-base font-semibold">Supplier</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <NumberField label="Usual lead time" hint="Days from placing an order to stock arriving" value={lead} onChange={setLead} suffix="days" error={errors.lead} />
              <NumberField label="Longest lead time" hint="The slowest delivery you have had" value={maxLead} onChange={setMaxLead} suffix="days" error={errors.maxLead} />
            </div>
          </div>
          <div>
            <h2 className="text-base font-semibold">Your stock</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <NumberField label="Units in stock now" value={stock} onChange={setStock} error={errors.stock} step="1" />
              <NumberField label="Each order should last" value={cover} onChange={setCover} suffix="days" error={errors.cover} />
            </div>
          </div>
        </>
      }
      results={
        <ResultsPanel title="Reorder plan" footer={verdict}>
          <ResultRow
            emphasis
            label="Order"
            value={!valid ? "—" : orderNow ? "Now" : `In ${Math.floor(daysUntil)} ${Math.floor(daysUntil) === 1 ? "day" : "days"}`}
          />
          <ResultRow label="Reorder point" value={valid ? `${units(rop)} units` : "—"} note="Order when stock falls to this level" />
          <ResultRow label="Safety stock" value={valid ? `${units(safety)} units` : "—"} note="Buffer for busy days and slow deliveries" />
          <ResultRow label="Suggested order quantity" value={valid ? `${units(qty)} units` : "—"} />
          <ResultRow label="Days of stock left" value={valid ? `${Math.floor(daysLeft)} days` : "—"} note="At average sales" />
        </ResultsPanel>
      }
      method={
        <MethodNote
          formulas={[
            "Safety stock = busy-day sales × longest lead time − average sales × usual lead time",
            "Reorder point = average sales × usual lead time + safety stock",
            "Order quantity = reorder point + average sales × days to cover − stock now",
          ]}
        >
          <p>This is the max-min method: simple and cautious. It suits small catalogues; businesses with many products often move to statistical methods later.</p>
        </MethodNote>
      }
    />
  );
}
