"use client";

import { useId, useState } from "react";
import { formatMoney, useMarket } from "@/lib/market";
import { cx } from "@/components/ui";
import { CalcLayout, MarketNote, MethodNote, NumberField, ResultRow, ResultsPanel, Segmented, currencySymbol, parseNum } from "./CalcParts";

type Item = { id: number; month: string; label: string; amount: string; dir: "out" | "in" };
let nextId = 10;

export type CashMonth = { month: number; revenue: number; costOfSales: number; fixed: number; oneOff: number; net: number; balance: number };

/** Pure projection, exported for testing and reuse. */
export function projectCash(p: {
  opening: number;
  revenue: number;
  growth: number;
  cogsPct: number;
  fixed: number;
  months: number;
  items: { month: number; amount: number }[];
}): CashMonth[] {
  const rows: CashMonth[] = [];
  let balance = p.opening;
  for (let m = 1; m <= p.months; m++) {
    const revenue = p.revenue * Math.pow(1 + p.growth / 100, m - 1);
    const costOfSales = revenue * (p.cogsPct / 100);
    const oneOff = p.items.filter((i) => i.month === m).reduce((t, i) => t + i.amount, 0);
    const net = revenue - costOfSales - p.fixed + oneOff;
    balance += net;
    rows.push({ month: m, revenue, costOfSales, fixed: p.fixed, oneOff, net, balance });
  }
  return rows;
}

export function CashFlowPlanner() {
  const market = useMarket();
  const symbol = currencySymbol(market.locale, market.currency);
  const uid = useId();
  const [opening, setOpening] = useState("5000");
  const [revenue, setRevenue] = useState("2000");
  const [growth, setGrowth] = useState("10");
  const [cogs, setCogs] = useState("40");
  const [fixed, setFixed] = useState("1800");
  const [horizon, setHorizon] = useState<"12" | "18" | "24">("12");
  const [items, setItems] = useState<Item[]>([
    { id: 1, month: "3", label: "Equipment", amount: "2500", dir: "out" },
  ]);

  const o = parseNum(opening);
  const r = parseNum(revenue);
  const g = parseNum(growth) ?? 0;
  const c = parseNum(cogs) ?? 0;
  const f = parseNum(fixed);
  const months = Number(horizon);

  const errors: Record<string, string> = {};
  if (o === null) errors.opening = "Enter the cash you start with.";
  if (r === null) errors.revenue = "Enter expected revenue in month 1.";
  else if (r < 0) errors.revenue = "Revenue can't be negative.";
  if (g < -50 || g > 100) errors.growth = "Use a monthly change between −50% and 100%.";
  if (c < 0 || c > 100) errors.cogs = "Enter a percentage from 0 to 100.";
  if (f === null) errors.fixed = "Enter your fixed monthly costs.";
  else if (f < 0) errors.fixed = "Costs can't be negative.";
  const valid = Object.keys(errors).length === 0;

  const parsedItems = items
    .map((i) => ({ month: Number(i.month), amount: (parseNum(i.amount) ?? 0) * (i.dir === "out" ? -1 : 1) }))
    .filter((i) => Number.isInteger(i.month) && i.month >= 1 && i.month <= months && i.amount !== 0);

  const rows = valid ? projectCash({ opening: o as number, revenue: r as number, growth: g, cogsPct: c, fixed: f as number, months, items: parsedItems }) : [];
  const lowest = rows.reduce<CashMonth | null>((lo, row) => (!lo || row.balance < lo.balance ? row : lo), null);
  const firstNegative = rows.find((row) => row.balance < 0);
  const firstPositiveNet = rows.find((row) => row.net - row.oneOff >= 0);
  const funding = lowest && lowest.balance < 0 ? -lowest.balance : 0;
  const money = (v: number) => formatMoney(v, market, 0);

  const setItem = (id: number, patch: Partial<Item>) => setItems((list) => list.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const fieldCls =
    "h-11 w-full rounded-[var(--radius-sm)] border border-line-strong bg-surface px-3 text-sm text-ink hover:border-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20";

  return (
    <>
      <CalcLayout
        label="Cash-flow inputs"
        inputs={
          <>
            <div className="grid gap-6 sm:grid-cols-2">
              <NumberField label="Cash at the start" hint="In the bank on day one" value={opening} onChange={setOpening} prefix={symbol} error={errors.opening} />
              <NumberField label="Revenue in month 1" hint="Money actually received, not just invoiced" value={revenue} onChange={setRevenue} prefix={symbol} error={errors.revenue} />
              <NumberField label="Monthly revenue growth" hint="Use a negative number for decline" value={growth} onChange={setGrowth} suffix="%" error={errors.growth} />
              <NumberField label="Cost of sales" hint="Product and delivery costs, as a share of revenue" value={cogs} onChange={setCogs} suffix="%" error={errors.cogs} />
              <NumberField label="Fixed monthly costs" hint="Rent, salaries, software, loan repayments" value={fixed} onChange={setFixed} prefix={symbol} error={errors.fixed} />
              <div className="sm:pt-[1.15rem]">
                <Segmented legend="Plan ahead for" name="horizon" value={horizon} onChange={setHorizon} options={[["12", "12 months"], ["18", "18 months"], ["24", "24 months"]] as const} />
              </div>
            </div>

            <fieldset className="rounded-[var(--radius-md)] border border-line bg-surface p-5">
              <legend className="sr-only">One-off payments and receipts</legend>
              <h2 className="text-base font-semibold">One-off payments and receipts</h2>
              <p className="mt-1 text-sm text-muted">Equipment, tax bills, a loan arriving, an investment. Anything that isn&apos;t monthly.</p>
              <ul className="mt-4 space-y-3">
                {items.map((i, idx) => (
                  <li key={i.id} className="grid grid-cols-[4.5rem_minmax(0,1fr)_2.25rem] gap-2 sm:grid-cols-[4.5rem_minmax(0,1fr)_7rem_8rem_2.25rem]">
                    <div>
                      <label htmlFor={`${uid}-m${i.id}`} className="sr-only">Month for item {idx + 1}</label>
                      <select id={`${uid}-m${i.id}`} value={i.month} onChange={(e) => setItem(i.id, { month: e.target.value })} className={fieldCls}>
                        {Array.from({ length: months }, (_, k) => (
                          <option key={k + 1} value={String(k + 1)}>
                            M{k + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`${uid}-l${i.id}`} className="sr-only">Description for item {idx + 1}</label>
                      <input id={`${uid}-l${i.id}`} value={i.label} placeholder="What is it?" onChange={(e) => setItem(i.id, { label: e.target.value })} className={fieldCls} />
                    </div>
                    <button
                      type="button"
                      onClick={() => setItems((l) => l.filter((x) => x.id !== i.id))}
                      aria-label={`Remove ${i.label || `item ${idx + 1}`}`}
                      className="flex size-11 items-center justify-center rounded-[var(--radius-sm)] text-muted hover:bg-paper hover:text-danger sm:order-last"
                    >
                      <svg viewBox="0 0 16 16" aria-hidden className="size-4">
                        <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </button>
                    <div className="col-span-2 grid grid-cols-2 gap-2 sm:col-span-2 sm:contents">
                      <div>
                        <label htmlFor={`${uid}-d${i.id}`} className="sr-only">Money in or out for item {idx + 1}</label>
                        <select id={`${uid}-d${i.id}`} value={i.dir} onChange={(e) => setItem(i.id, { dir: e.target.value as Item["dir"] })} className={fieldCls}>
                          <option value="out">Money out</option>
                          <option value="in">Money in</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor={`${uid}-a${i.id}`} className="sr-only">Amount for {i.label || `item ${idx + 1}`}</label>
                        <div className="flex h-11 items-center rounded-[var(--radius-sm)] border border-line-strong bg-surface hover:border-ink focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20">
                          <span className="pl-2.5 text-xs text-muted">{symbol}</span>
                          <input
                            id={`${uid}-a${i.id}`}
                            type="number"
                            inputMode="decimal"
                            min={0}
                            value={i.amount}
                            onChange={(e) => setItem(i.id, { amount: e.target.value })}
                            className="h-full w-full min-w-0 bg-transparent px-2 text-sm tabular-nums text-ink focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {items.length === 0 ? <p className="mt-3 text-sm text-muted">No one-off items. Add one if you expect a large payment or receipt.</p> : null}
              <button
                type="button"
                onClick={() => setItems((l) => [...l, { id: nextId++, month: "1", label: "", amount: "", dir: "out" }])}
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-[var(--radius-sm)] border border-dashed border-line-strong px-3 text-sm font-semibold text-ink hover:border-ink"
              >
                <span aria-hidden>+</span> Add a one-off item
              </button>
            </fieldset>
          </>
        }
        results={
          <ResultsPanel
            title="Cash outlook"
            footer={
              firstNegative ? (
                <span className="font-medium text-[#f4a39c]">
                  Cash runs out in month {firstNegative.month}. Arrange {money(funding)} of funding, cut costs or bring revenue forward before then.
                </span>
              ) : (
                "Cash stays positive across the plan. Keep a buffer: real receipts often arrive later than expected."
              )
            }
          >
            <ResultRow emphasis label="Lowest balance" value={lowest ? money(lowest.balance) : "—"} note={lowest ? `In month ${lowest.month}` : undefined} />
            <ResultRow label="Cash runs out" value={!valid ? "—" : firstNegative ? `Month ${firstNegative.month}` : `Not within ${months} months`} />
            <ResultRow label="Funding needed" value={valid ? money(funding) : "—"} note="To keep the balance above zero" />
            <ResultRow
              label="Monthly cash flow turns positive"
              value={!valid ? "—" : firstPositiveNet ? `Month ${firstPositiveNet.month}` : `Not within ${months} months`}
              note="Excluding one-off items"
            />
            <ResultRow label={`Balance after month ${months}`} value={rows.length ? money(rows[rows.length - 1].balance) : "—"} />
          </ResultsPanel>
        }
        method={
          <MethodNote
            formulas={[
              "Revenue in month n = month-1 revenue × (1 + growth)^(n − 1)",
              "Net cash flow = revenue − cost of sales − fixed costs ± one-off items",
              "Balance = previous balance + net cash flow",
            ]}
          >
            <p>Cash flow is about timing. Enter money when it actually arrives or leaves your account, not when you invoice or are invoiced.</p>
            <MarketNote label={market.label} currency={market.currency} />
          </MethodNote>
        }
      />

      {rows.length ? (
        <section aria-labelledby="cash-table" className="mt-12">
          <h2 id="cash-table" className="text-xl">
            Month by month
          </h2>
          <div className="mt-4 overflow-x-auto rounded-[var(--radius-md)] border border-line bg-surface" tabIndex={0} role="region" aria-labelledby="cash-table">
            <table className="w-full min-w-[40rem] text-right text-sm tabular-nums">
              <thead className="bg-paper text-xs text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-semibold">Month</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Revenue</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Cost of sales</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Fixed costs</th>
                  <th scope="col" className="px-4 py-3 font-semibold">One-off</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Net</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((row) => (
                  <tr key={row.month} className={cx(row.balance < 0 && "bg-danger-soft/60")}>
                    <th scope="row" className="px-4 py-2.5 text-left font-medium text-ink">
                      {row.month}
                    </th>
                    <td className="px-4 py-2.5">{money(row.revenue)}</td>
                    <td className="px-4 py-2.5 text-muted">{money(-row.costOfSales)}</td>
                    <td className="px-4 py-2.5 text-muted">{money(-row.fixed)}</td>
                    <td className="px-4 py-2.5 text-muted">{row.oneOff ? money(row.oneOff) : "—"}</td>
                    <td className={cx("px-4 py-2.5 font-medium", row.net < 0 ? "text-danger" : "text-ink")}>{money(row.net)}</td>
                    <td className={cx("px-4 py-2.5 font-semibold", row.balance < 0 ? "text-danger" : "text-ink")}>{money(row.balance)}</td>
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
