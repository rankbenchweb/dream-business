"use client";

import { useState } from "react";
import { formatMoney, useMarket } from "@/lib/market";
import { cx } from "@/components/ui";
import { CalcLayout, MarketNote, MethodNote, NumberField, ResultRow, ResultsPanel, currencySymbol, parseNum } from "./CalcParts";
import { RowEditor } from "./RowEditor";

type Channel = { id: number; name: string; share: string; cac: string };
let nextId = 20;

const starter: Channel[] = [
  { id: 1, name: "Search ads", share: "35", cac: "30" },
  { id: 2, name: "Social media ads", share: "30", cac: "25" },
  { id: 3, name: "Content and SEO", share: "15", cac: "15" },
  { id: 4, name: "Email and retention", share: "10", cac: "8" },
  { id: 5, name: "Partnerships", share: "10", cac: "20" },
];

export function MarketingBudgetPlanner() {
  const market = useMarket();
  const symbol = currencySymbol(market.locale, market.currency);
  const [budget, setBudget] = useState("5000");
  const [aov, setAov] = useState("50");
  const [channels, setChannels] = useState<Channel[]>(starter);

  const b = parseNum(budget);
  const a = parseNum(aov);
  const errors: Record<string, string> = {};
  if (b === null || b < 0) errors.budget = "Enter your marketing budget for the month.";
  if (a === null || a < 0) errors.aov = "Enter your average first order value.";

  const totalShare = channels.reduce((t, c) => t + (parseNum(c.share) ?? 0), 0);
  const shareOk = Math.abs(totalShare - 100) < 0.01;
  const valid = Object.keys(errors).length === 0 && shareOk;

  const rows = channels.map((c) => {
    const share = parseNum(c.share) ?? 0;
    const cac = parseNum(c.cac);
    const spend = ((b ?? 0) * share) / 100;
    const customers = cac && cac > 0 ? spend / cac : 0;
    return { ...c, spend, customers, cacN: cac };
  });
  const customers = rows.reduce((t, r) => t + r.customers, 0);
  const blended = customers > 0 ? (b ?? 0) / customers : NaN;
  const firstRevenue = customers * (a ?? 0);
  const roas = (b ?? 0) > 0 ? firstRevenue / (b as number) : NaN;
  const best = [...rows].filter((r) => r.cacN && r.cacN > 0).sort((x, y) => (x.cacN as number) - (y.cacN as number))[0];

  return (
    <>
      <CalcLayout
        label="Marketing budget inputs"
        inputs={
          <>
            <div className="grid gap-6 sm:grid-cols-2">
              <NumberField label="Monthly marketing budget" value={budget} onChange={setBudget} prefix={symbol} error={errors.budget} />
              <NumberField label="Average first order value" hint="What a new customer spends on their first order" value={aov} onChange={setAov} prefix={symbol} error={errors.aov} />
            </div>
            <RowEditor<Channel>
              title="Channels"
              description="Share of budget for each channel, and what you expect a new customer to cost there. Use your own results where you have them."
              rows={channels}
              columns={[
                { key: "name", label: "Channel", width: "minmax(0,1fr)", kind: "text" },
                { key: "share", label: "Share of budget", width: "8rem", kind: "number", suffix: "%" },
                { key: "cac", label: "Cost per new customer", width: "9rem", kind: "number", prefix: symbol },
              ]}
              onChange={(id, key, value) => setChannels((l) => l.map((c) => (c.id === id ? { ...c, [key]: value } : c)))}
              onAdd={() => setChannels((l) => [...l, { id: nextId++, name: "", share: "0", cac: "" }])}
              onRemove={(id) => setChannels((l) => l.filter((c) => c.id !== id))}
              addLabel="Add a channel"
              rowName={(r, i) => r.name || `channel ${i + 1}`}
              footer={
                <p className={cx("text-sm font-semibold", shareOk ? "text-success" : "text-danger")} aria-live="polite">
                  {shareOk ? "Shares add up to 100%" : `Shares add up to ${totalShare.toLocaleString("en", { maximumFractionDigits: 1 })}%. Adjust them to 100%.`}
                </p>
              }
            />
          </>
        }
        results={
          <ResultsPanel
            title="Expected results"
            footer={
              !shareOk
                ? "Results appear when channel shares add up to 100%."
                : best
                  ? `${best.name || "Your cheapest channel"} brings customers most cheaply at these costs. Check it can absorb more budget before shifting money to it.`
                  : "These are planning figures based on the costs you entered."
            }
          >
            <ResultRow emphasis label="New customers per month" value={valid ? Math.floor(customers).toLocaleString("en") : "—"} />
            <ResultRow label="Blended cost per customer" value={valid && Number.isFinite(blended) ? formatMoney(blended, market) : "—"} />
            <ResultRow label="Revenue from first orders" value={valid ? formatMoney(firstRevenue, market, 0) : "—"} />
            <ResultRow
              label="First-order return on spend"
              value={valid && Number.isFinite(roas) ? `${roas.toLocaleString("en", { maximumFractionDigits: 2 })}x` : "—"}
              note="Before repeat purchases"
            />
          </ResultsPanel>
        }
        method={
          <MethodNote
            formulas={[
              "Channel spend = budget × channel share",
              "New customers = channel spend ÷ cost per new customer",
              "Blended cost = total budget ÷ total new customers",
            ]}
          >
            <p>Costs per customer usually rise as you spend more in a channel. Treat these as estimates and replace them with your measured results.</p>
            <MarketNote label={market.label} currency={market.currency} />
          </MethodNote>
        }
      />
      {valid ? (
        <section aria-labelledby="mb-table" className="mt-12">
          <h2 id="mb-table" className="text-xl">
            By channel
          </h2>
          <div className="mt-4 overflow-x-auto rounded-[var(--radius-md)] border border-line bg-surface" tabIndex={0} role="region" aria-label="Budget by channel table">
            <table className="w-full min-w-[32rem] text-right text-sm tabular-nums">
              <thead className="bg-paper text-xs text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-semibold">Channel</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Spend</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Cost per customer</th>
                  <th scope="col" className="px-4 py-3 font-semibold">New customers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r, i) => (
                  <tr key={r.id}>
                    <th scope="row" className="px-4 py-2.5 text-left font-medium text-ink">
                      {r.name || `Channel ${i + 1}`}
                    </th>
                    <td className="px-4 py-2.5">{formatMoney(r.spend, market, 0)}</td>
                    <td className="px-4 py-2.5">{r.cacN ? formatMoney(r.cacN, market) : "—"}</td>
                    <td className="px-4 py-2.5 font-semibold text-ink">{r.customers.toLocaleString("en", { maximumFractionDigits: 0 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </>
  );
}
