"use client";

import { useId, useState } from "react";
import { formatMoney, useMarket } from "@/lib/market";
import { cx } from "@/components/ui";
import { CalcLayout, MarketNote, MethodNote, NumberField, ResultRow, ResultsPanel, currencySymbol, parseNum } from "./CalcParts";

type Row = { id: number; label: string; amount: string };
type Kind = "oneOff" | "monthly";

let nextId = 100;

const starterOneOff: Row[] = [
  { id: 1, label: "Business registration and licences", amount: "300" },
  { id: 2, label: "Website and online store setup", amount: "1200" },
  { id: 3, label: "Opening inventory", amount: "3000" },
  { id: 4, label: "Equipment", amount: "800" },
];
const starterMonthly: Row[] = [
  { id: 5, label: "Software and subscriptions", amount: "120" },
  { id: 6, label: "Marketing", amount: "600" },
  { id: 7, label: "Workspace", amount: "250" },
];

function sum(rows: Row[]) {
  return rows.reduce((t, r) => {
    const n = parseNum(r.amount);
    return t + (n !== null && n > 0 ? n : 0);
  }, 0);
}

function CostList({
  title,
  hint,
  rows,
  kind,
  symbol,
  onChange,
  onAdd,
  onRemove,
}: {
  title: string;
  hint: string;
  rows: Row[];
  kind: Kind;
  symbol: string;
  onChange: (id: number, field: "label" | "amount", value: string) => void;
  onAdd: () => void;
  onRemove: (id: number) => void;
}) {
  const uid = useId();
  return (
    <fieldset className="rounded-[var(--radius-md)] border border-line bg-surface p-5">
      <legend className="sr-only">{title}</legend>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-base font-semibold">{title}</h2>
        <span className="text-xs text-muted">{hint}</span>
      </div>
      <ul className="mt-4 space-y-2">
        {rows.map((r, i) => {
          const amount = parseNum(r.amount);
          const bad = r.amount !== "" && (amount === null || amount < 0);
          return (
            <li key={r.id} className="grid grid-cols-[minmax(0,1fr)_7.5rem_2.25rem] items-start gap-2 sm:grid-cols-[minmax(0,1fr)_9rem_2.25rem]">
              <div>
                <label htmlFor={`${uid}-l${r.id}`} className="sr-only">
                  {kind === "oneOff" ? "One-off" : "Monthly"} cost {i + 1} description
                </label>
                <input
                  id={`${uid}-l${r.id}`}
                  value={r.label}
                  onChange={(e) => onChange(r.id, "label", e.target.value)}
                  placeholder="What is it for?"
                  className="h-11 w-full rounded-[var(--radius-sm)] border border-line-strong bg-surface px-3 text-sm text-ink placeholder:text-muted hover:border-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                />
              </div>
              <div>
                <label htmlFor={`${uid}-a${r.id}`} className="sr-only">
                  Amount for {r.label || `cost ${i + 1}`}
                </label>
                <div
                  className={cx(
                    "flex h-11 items-center rounded-[var(--radius-sm)] border bg-surface focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20",
                    bad ? "border-danger" : "border-line-strong hover:border-ink",
                  )}
                >
                  <span className="pl-2.5 text-xs text-muted">{symbol}</span>
                  <input
                    id={`${uid}-a${r.id}`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    value={r.amount}
                    onChange={(e) => onChange(r.id, "amount", e.target.value)}
                    aria-invalid={bad || undefined}
                    className="h-full w-full min-w-0 bg-transparent px-2 text-sm tabular-nums text-ink focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemove(r.id)}
                aria-label={`Remove ${r.label || `cost ${i + 1}`}`}
                className="flex size-11 items-center justify-center rounded-[var(--radius-sm)] text-muted hover:bg-paper hover:text-danger"
              >
                <svg viewBox="0 0 16 16" aria-hidden className="size-4">
                  <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>
      {rows.length === 0 ? <p className="mt-3 text-sm text-muted">No costs yet. Add the first one below.</p> : null}
      <button
        type="button"
        onClick={onAdd}
        className="mt-4 inline-flex h-10 items-center gap-2 rounded-[var(--radius-sm)] border border-dashed border-line-strong px-3 text-sm font-semibold text-ink hover:border-ink"
      >
        <span aria-hidden>+</span> Add a {kind === "oneOff" ? "one-off" : "monthly"} cost
      </button>
    </fieldset>
  );
}

export function StartupCostPlanner() {
  const market = useMarket();
  const symbol = currencySymbol(market.locale, market.currency);
  const [oneOff, setOneOff] = useState<Row[]>(starterOneOff);
  const [monthly, setMonthly] = useState<Row[]>(starterMonthly);
  const [budget, setBudget] = useState("10000");
  const [revenue, setRevenue] = useState("");

  const update = (set: typeof setOneOff) => (id: number, field: "label" | "amount", value: string) =>
    set((rows) => rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  const add = (set: typeof setOneOff) => () => set((rows) => [...rows, { id: nextId++, label: "", amount: "" }]);
  const remove = (set: typeof setOneOff) => (id: number) => set((rows) => rows.filter((r) => r.id !== id));

  const totalOneOff = sum(oneOff);
  const totalMonthly = sum(monthly);
  const b = parseNum(budget);
  const r = parseNum(revenue) ?? 0;

  const errors: Record<string, string> = {};
  if (b === null) errors.budget = "Enter the money you have to start with.";
  else if (b < 0) errors.budget = "The budget can't be negative.";
  if (revenue !== "" && (parseNum(revenue) === null || r < 0)) errors.revenue = "Expected revenue can't be negative.";
  const valid = Object.keys(errors).length === 0;

  const afterLaunch = valid ? (b as number) - totalOneOff : NaN;
  const netBurn = totalMonthly - r;
  const shortfall = valid && afterLaunch < 0;
  let runway = "—";
  if (valid) {
    if (shortfall) runway = "Budget doesn't cover launch";
    else if (netBurn <= 0) runway = "Not limited by costs";
    else {
      const m = Math.floor(afterLaunch / netBurn);
      runway = m >= 120 ? "10 years or more" : `${m} ${m === 1 ? "month" : "months"}`;
    }
  }

  return (
    <CalcLayout
      label="Startup cost inputs"
      inputs={
        <>
          <CostList title="One-off launch costs" hint="Paid once" rows={oneOff} kind="oneOff" symbol={symbol} onChange={update(setOneOff)} onAdd={add(setOneOff)} onRemove={remove(setOneOff)} />
          <CostList title="Monthly running costs" hint="Paid every month" rows={monthly} kind="monthly" symbol={symbol} onChange={update(setMonthly)} onAdd={add(setMonthly)} onRemove={remove(setMonthly)} />
          <div className="grid gap-6 sm:grid-cols-2">
            <NumberField label="Starting budget" hint="Savings, investment or loans available" value={budget} onChange={setBudget} prefix={symbol} error={errors.budget} />
            <NumberField label="Expected monthly revenue (optional)" hint="Leave blank to plan for no sales yet" value={revenue} onChange={setRevenue} prefix={symbol} error={errors.revenue} />
          </div>
        </>
      }
      results={
        <ResultsPanel
          title="Your plan"
          footer={
            shortfall ? (
              <span className="font-medium text-[#f4a39c]">
                Launch costs exceed your budget by {formatMoney(-afterLaunch, market, 0)}. Cut one-off costs or raise more before you start.
              </span>
            ) : (
              "Add a buffer of a few months' costs: launches usually take longer and cost more than planned."
            )
          }
        >
          <ResultRow emphasis label="Runway" value={runway} note="How long the money lasts after launch" />
          <ResultRow label="One-off launch costs" value={formatMoney(totalOneOff, market, 0)} />
          <ResultRow label="Monthly running costs" value={formatMoney(totalMonthly, market, 0)} />
          <ResultRow label="Left after launch" value={valid ? formatMoney(afterLaunch, market, 0) : "—"} />
          <ResultRow label="Net monthly spend" value={formatMoney(netBurn, market, 0)} note={r > 0 ? "Running costs minus revenue" : undefined} />
        </ResultsPanel>
      }
      method={
        <MethodNote
          formulas={[
            "Left after launch = budget − one-off costs",
            "Net monthly spend = monthly costs − expected revenue",
            "Runway = left after launch ÷ net monthly spend, in whole months",
          ]}
        >
          <p>The example rows are only a starting point. Rename, change or remove them to match your business.</p>
          <MarketNote label={market.label} currency={market.currency} />
        </MethodNote>
      }
    />
  );
}
