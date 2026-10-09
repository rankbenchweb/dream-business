"use client";

import { useState } from "react";
import { formatMoney, useMarket } from "@/lib/market";
import { CalcLayout, MarketNote, MethodNote, NumberField, ResultRow, ResultsPanel, Segmented, currencySymbol, fmtPct, parseNum } from "./CalcParts";

type Basis = "cif" | "fob";
type Vat = "include" | "exclude";

export function LandedCostCalculator() {
  const market = useMarket();
  const symbol = currencySymbol(market.locale, market.currency);
  const [units, setUnits] = useState("500");
  const [unitCost, setUnitCost] = useState("8");
  const [freight, setFreight] = useState("600");
  const [insurance, setInsurance] = useState("40");
  const [duty, setDuty] = useState("10");
  const [basis, setBasis] = useState<Basis>("cif");
  const [tax, setTax] = useState("0");
  const [vatMode, setVatMode] = useState<Vat>("exclude");
  const [fees, setFees] = useState("150");

  const n = parseNum(units);
  const c = parseNum(unitCost);
  const f = parseNum(freight) ?? 0;
  const ins = parseNum(insurance) ?? 0;
  const d = parseNum(duty) ?? 0;
  const t = parseNum(tax) ?? 0;
  const fe = parseNum(fees) ?? 0;

  const errors: Record<string, string> = {};
  if (n === null) errors.units = "Enter how many units are in the shipment.";
  else if (n <= 0 || !Number.isInteger(n)) errors.units = "Use a whole number of units above zero.";
  if (c === null) errors.unitCost = "Enter what you pay the supplier per unit.";
  else if (c < 0) errors.unitCost = "Cost can't be negative.";
  if (f < 0) errors.freight = "Freight can't be negative.";
  if (ins < 0) errors.insurance = "Insurance can't be negative.";
  if (d < 0 || d > 1000) errors.duty = "Enter a duty rate between 0% and 1000%.";
  if (t < 0 || t > 100) errors.tax = "Enter an import tax rate between 0% and 100%.";
  if (fe < 0) errors.fees = "Fees can't be negative.";
  const valid = Object.keys(errors).length === 0;

  const goods = valid ? (n as number) * (c as number) : NaN;
  const customsValue = basis === "cif" ? goods + f + ins : goods;
  const dutyAmt = customsValue * (d / 100);
  const taxAmt = (goods + f + ins + dutyAmt) * (t / 100);
  const landed = goods + f + ins + dutyAmt + fe + (vatMode === "include" ? taxAmt : 0);
  const perUnit = landed / (n ?? NaN);
  const uplift = c ? (perUnit / (c as number) - 1) * 100 : NaN;
  const money = (v: number) => (valid ? formatMoney(v, market) : "—");

  return (
    <CalcLayout
      label="Landed cost inputs"
      inputs={
        <>
          <div className="grid gap-6 sm:grid-cols-2">
            <NumberField label="Units in the shipment" value={units} onChange={setUnits} error={errors.units} step="1" />
            <NumberField label="Supplier price per unit" hint="What you pay the supplier, ex works or FOB" value={unitCost} onChange={setUnitCost} prefix={symbol} error={errors.unitCost} />
            <NumberField label="Freight for the shipment" hint="International shipping to your country" value={freight} onChange={setFreight} prefix={symbol} error={errors.freight} />
            <NumberField label="Cargo insurance" hint="Optional" value={insurance} onChange={setInsurance} prefix={symbol} error={errors.insurance} />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <NumberField label="Customs duty rate" hint="From your destination's tariff for this product's HS code" value={duty} onChange={setDuty} suffix="%" error={errors.duty} />
            <div>
              <Segmented
                legend="Duty is charged on"
                name="basis"
                value={basis}
                onChange={setBasis}
                options={[["cif", "Goods + shipping"], ["fob", "Goods only"]] as const}
              />
              <p className="mt-1.5 text-xs text-muted">
                {basis === "cif" ? "CIF basis, used by many countries." : "FOB basis, used by some countries, including the United States."}
              </p>
            </div>
            <NumberField label="Import tax (VAT or GST)" hint="Charged at the border in many countries" value={tax} onChange={setTax} suffix="%" error={errors.tax} />
            <div>
              <Segmented
                legend="Count import tax as a cost?"
                name="vat"
                value={vatMode}
                onChange={setVatMode}
                options={[["exclude", "No, I reclaim it"], ["include", "Yes"]] as const}
              />
              <p className="mt-1.5 text-xs text-muted">Registered businesses can often reclaim import VAT, so it isn&apos;t a true cost.</p>
            </div>
            <NumberField label="Other fees" hint="Customs broker, port handling, local delivery" value={fees} onChange={setFees} prefix={symbol} error={errors.fees} />
          </div>
        </>
      }
      results={
        <ResultsPanel title="Landed cost" footer="Use the landed cost per unit, not the supplier price, when you set prices and calculate margins.">
          <ResultRow emphasis label="Per unit" value={money(perUnit)} />
          <ResultRow label="Whole shipment" value={money(landed)} />
          <ResultRow label="Increase on supplier price" value={valid ? fmtPct(uplift) : "—"} />
          <ResultRow label="Goods" value={money(goods)} />
          <ResultRow label="Freight and insurance" value={valid ? formatMoney(f + ins, market) : "—"} />
          <ResultRow label="Customs duty" value={money(dutyAmt)} note={`On ${basis === "cif" ? "goods + shipping" : "goods only"}`} />
          <ResultRow label="Import tax" value={money(taxAmt)} note={vatMode === "include" ? "Included in landed cost" : "Shown, not included"} />
          <ResultRow label="Other fees" value={valid ? formatMoney(fe, market) : "—"} />
        </ResultsPanel>
      }
      method={
        <MethodNote
          formulas={[
            "Customs value = goods (+ freight + insurance on CIF basis)",
            "Duty = customs value × duty rate",
            "Import tax = (goods + freight + insurance + duty) × tax rate",
            "Landed cost = goods + freight + insurance + duty + fees (+ import tax if counted)",
          ]}
        >
          <p>
            Duty and tax rules vary by country and product. Check your rate with your destination&apos;s customs authority, using your product&apos;s HS
            code, before you rely on this figure. Some goods also carry extra duties or exemptions that this calculator does not model.
          </p>
          <MarketNote label={market.label} currency={market.currency} />
        </MethodNote>
      }
    />
  );
}
