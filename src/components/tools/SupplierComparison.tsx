"use client";

import { useId, useState } from "react";
import { formatMoney, useMarket } from "@/lib/market";
import { cx } from "@/components/ui";
import { MarketNote, MethodNote, currencySymbol, parseNum } from "./CalcParts";

type Supplier = { id: number; name: string; price: string; shipping: string; moq: string; lead: string; quality: string; reliability: string };
type WeightKey = "cost" | "lead" | "quality" | "reliability";

let nextId = 10;

const starter: Supplier[] = [
  { id: 1, name: "Supplier A", price: "4.20", shipping: "0.90", moq: "500", lead: "25", quality: "4", reliability: "4" },
  { id: 2, name: "Supplier B", price: "3.60", shipping: "1.10", moq: "1000", lead: "35", quality: "3", reliability: "3" },
  { id: 3, name: "Supplier C", price: "4.80", shipping: "0.40", moq: "200", lead: "12", quality: "5", reliability: "4" },
];

const weightLabels: Record<WeightKey, string> = { cost: "Low cost", lead: "Fast delivery", quality: "Quality", reliability: "Reliability" };
const weightLevels = ["Ignore", "Low", "Medium", "High"];

export type ScoredSupplier = { id: number; landed: number; outlay: number; score: number; valid: boolean };

/** Score each supplier 0–100 against the best value in each factor, weighted by importance. */
export function scoreSuppliers(rows: { id: number; landed: number; outlay: number; lead: number; quality: number; reliability: number; valid: boolean }[], w: Record<WeightKey, number>): ScoredSupplier[] {
  const ok = rows.filter((r) => r.valid);
  const minCost = Math.min(...ok.map((r) => r.landed));
  const minLead = Math.min(...ok.map((r) => Math.max(r.lead, 1)));
  const total = w.cost + w.lead + w.quality + w.reliability;
  return rows.map((r) => {
    if (!r.valid || total === 0) return { id: r.id, landed: r.landed, outlay: r.outlay, score: NaN, valid: r.valid };
    const parts =
      w.cost * (r.landed > 0 ? minCost / r.landed : 1) +
      w.lead * (minLead / Math.max(r.lead, 1)) +
      w.quality * (r.quality / 5) +
      w.reliability * (r.reliability / 5);
    return { id: r.id, landed: r.landed, outlay: r.outlay, score: (parts / total) * 100, valid: true };
  });
}

export function SupplierComparison() {
  const market = useMarket();
  const symbol = currencySymbol(market.locale, market.currency);
  const uid = useId();
  const [suppliers, setSuppliers] = useState<Supplier[]>(starter);
  const [weights, setWeights] = useState<Record<WeightKey, number>>({ cost: 3, lead: 2, quality: 2, reliability: 2 });

  const set = (id: number, patch: Partial<Supplier>) => setSuppliers((l) => l.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const parsed = suppliers.map((s) => {
    const price = parseNum(s.price);
    const ship = parseNum(s.shipping) ?? 0;
    const moq = parseNum(s.moq) ?? 0;
    const lead = parseNum(s.lead);
    const q = parseNum(s.quality);
    const r = parseNum(s.reliability);
    const valid =
      price !== null && price >= 0 && ship >= 0 && moq >= 0 && lead !== null && lead >= 0 && q !== null && q >= 1 && q <= 5 && r !== null && r >= 1 && r <= 5;
    const landed = (price ?? 0) + ship;
    return { id: s.id, landed, outlay: landed * moq, lead: lead ?? 0, quality: q ?? 0, reliability: r ?? 0, valid };
  });
  const scored = scoreSuppliers(parsed, weights);
  const best = scored.filter((s) => s.valid && Number.isFinite(s.score)).sort((a, b) => b.score - a.score)[0];

  const cell = "h-10 w-full min-w-0 rounded-[var(--radius-sm)] border border-line-strong bg-surface px-2.5 text-sm tabular-nums text-ink hover:border-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20";
  const fields: { key: keyof Supplier; label: string; hint: string; prefix?: string; type?: string }[] = [
    { key: "price", label: "Unit price", hint: symbol, prefix: symbol },
    { key: "shipping", label: "Shipping per unit", hint: symbol, prefix: symbol },
    { key: "moq", label: "Minimum order", hint: "units" },
    { key: "lead", label: "Lead time", hint: "days" },
    { key: "quality", label: "Quality", hint: "1 to 5" },
    { key: "reliability", label: "Reliability", hint: "1 to 5" },
  ];

  return (
    <div className="space-y-8">
      <fieldset className="rounded-[var(--radius-md)] border border-line bg-surface p-5 sm:p-6">
        <legend className="sr-only">How much each factor matters</legend>
        <h2 className="text-base font-semibold">How much does each factor matter?</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(weightLabels) as WeightKey[]).map((k) => (
            <div key={k}>
              <label htmlFor={`${uid}-w-${k}`} className="block text-sm font-semibold text-ink">
                {weightLabels[k]}
              </label>
              <select id={`${uid}-w-${k}`} value={weights[k]} onChange={(e) => setWeights((w) => ({ ...w, [k]: Number(e.target.value) }))} className={cx(cell, "mt-2 h-11")}>
                {weightLevels.map((lvl, i) => (
                  <option key={lvl} value={i}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {suppliers.map((s, idx) => {
          const sc = scored.find((x) => x.id === s.id)!;
          const isBest = best?.id === s.id && suppliers.length > 1;
          return (
            <section
              key={s.id}
              aria-label={s.name || `Supplier ${idx + 1}`}
              className={cx("flex flex-col rounded-[var(--radius-md)] border bg-surface", isBest ? "border-gold ring-1 ring-gold" : "border-line")}
            >
              <div className="flex items-center gap-2 border-b border-line p-4">
                <label htmlFor={`${uid}-n${s.id}`} className="sr-only">Supplier {idx + 1} name</label>
                <input id={`${uid}-n${s.id}`} value={s.name} onChange={(e) => set(s.id, { name: e.target.value })} className={cx(cell, "font-semibold")} />
                <button
                  type="button"
                  disabled={suppliers.length <= 2}
                  onClick={() => setSuppliers((l) => l.filter((x) => x.id !== s.id))}
                  aria-label={`Remove ${s.name || `supplier ${idx + 1}`}`}
                  className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-muted hover:bg-paper hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <svg viewBox="0 0 16 16" aria-hidden className="size-4">
                    <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-2 items-end gap-3 p-4">
                {fields.map((f) => (
                  <div key={f.key}>
                    <label htmlFor={`${uid}-${f.key}${s.id}`} className="block text-xs font-semibold text-ink">
                      {f.label} <span className="font-normal text-muted">({f.hint})</span>
                    </label>
                    <input
                      id={`${uid}-${f.key}${s.id}`}
                      type="number"
                      inputMode="decimal"
                      min={f.key === "quality" || f.key === "reliability" ? 1 : 0}
                      max={f.key === "quality" || f.key === "reliability" ? 5 : undefined}
                      value={s[f.key] as string}
                      onChange={(e) => set(s.id, { [f.key]: e.target.value })}
                      className={cx(cell, "mt-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none")}
                    />
                  </div>
                ))}
              </div>
              <dl className="on-dark mt-auto space-y-2 rounded-b-[var(--radius-md)] bg-midnight p-4 text-sm text-fog" aria-live="polite">
                <div className="flex items-baseline justify-between">
                  <dt className="text-mist">Score</dt>
                  <dd className="font-display text-2xl font-semibold text-white">{sc.valid && Number.isFinite(sc.score) ? Math.round(sc.score) : "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-mist">Cost per unit</dt>
                  <dd>{sc.valid ? formatMoney(sc.landed, market) : "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-mist">Cash for minimum order</dt>
                  <dd>{sc.valid ? formatMoney(sc.outlay, market, 0) : "—"}</dd>
                </div>
                {isBest ? <p className="pt-1 text-xs font-semibold text-gold-bright">Best match for your priorities</p> : null}
                {!sc.valid ? <p className="pt-1 text-xs text-[#f4a39c]">Fill in every field. Ratings must be 1 to 5.</p> : null}
              </dl>
            </section>
          );
        })}
      </div>

      {suppliers.length < 4 ? (
        <button
          type="button"
          onClick={() => setSuppliers((l) => [...l, { id: nextId++, name: `Supplier ${String.fromCharCode(65 + l.length)}`, price: "", shipping: "", moq: "", lead: "", quality: "3", reliability: "3" }])}
          className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-sm)] border border-dashed border-line-strong px-3 text-sm font-semibold text-ink hover:border-ink"
        >
          <span aria-hidden>+</span> Add a supplier
        </button>
      ) : null}

      <MethodNote
        formulas={[
          "Cost per unit = unit price + shipping per unit",
          "Cash for minimum order = cost per unit × minimum order",
          "Score = weighted average of: cheapest cost ÷ this cost, fastest lead time ÷ this lead time, quality ÷ 5, reliability ÷ 5",
        ]}
      >
        <p>
          Quality and reliability are your own ratings, from samples, references and past orders. Order samples before committing, and confirm terms,
          payment protection and inspection options in writing.
        </p>
        <MarketNote label={market.label} currency={market.currency} />
      </MethodNote>
    </div>
  );
}
