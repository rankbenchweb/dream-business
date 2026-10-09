"use client";

import { useState } from "react";
import { formatMoney, useMarket } from "@/lib/market";
import { CalcLayout, MarketNote, MethodNote, NumberField, ResultRow, ResultsPanel, currencySymbol, parseNum } from "./CalcParts";
import { RowEditor } from "./RowEditor";

type Task = { id: number; name: string; perWeek: string; minutes: string; automatable: string };
let nextId = 20;
const WEEKS_PER_MONTH = 52 / 12;

const starter: Task[] = [
  { id: 1, name: "Copy new orders into a spreadsheet", perWeek: "35", minutes: "4", automatable: "90" },
  { id: 2, name: "Send shipping updates to customers", perWeek: "35", minutes: "3", automatable: "100" },
  { id: 3, name: "Prepare the weekly sales report", perWeek: "1", minutes: "90", automatable: "80" },
  { id: 4, name: "Answer common customer questions", perWeek: "40", minutes: "5", automatable: "50" },
];

export function AutomationPlanner() {
  const market = useMarket();
  const symbol = currencySymbol(market.locale, market.currency);
  const [rate, setRate] = useState("15");
  const [tasks, setTasks] = useState<Task[]>(starter);

  const r = parseNum(rate);
  const errors: Record<string, string> = {};
  if (r === null || r < 0) errors.rate = "Enter what an hour of this work costs.";
  const valid = !errors.rate;

  const rows = tasks.map((t) => {
    const per = Math.max(parseNum(t.perWeek) ?? 0, 0);
    const min = Math.max(parseNum(t.minutes) ?? 0, 0);
    const auto = Math.min(Math.max(parseNum(t.automatable) ?? 0, 0), 100);
    const hours = (per * min * WEEKS_PER_MONTH) / 60;
    const saved = (hours * auto) / 100;
    return { ...t, hours, saved, value: saved * (r ?? 0) };
  });
  const totalHours = rows.reduce((s, x) => s + x.hours, 0);
  const totalSaved = rows.reduce((s, x) => s + x.saved, 0);
  const ranked = [...rows].filter((x) => x.saved > 0).sort((a, b) => b.saved - a.saved);
  const h = (n: number) => `${n.toLocaleString("en", { maximumFractionDigits: 1 })} h`;

  return (
    <>
      <CalcLayout
        label="Automation planner inputs"
        inputs={
          <>
            <NumberField label="Cost of an hour of this work" hint="Your hourly rate, or what you pay someone to do it" value={rate} onChange={setRate} prefix={symbol} error={errors.rate} />
            <RowEditor<Task>
              title="Repetitive tasks"
              description="List the tasks you or your team repeat. Estimate how much of each a tool could do without a person."
              rows={tasks}
              columns={[
                { key: "name", label: "Task", width: "minmax(0,1fr)", kind: "text" },
                { key: "perWeek", label: "Times a week", width: "6.5rem", kind: "number" },
                { key: "minutes", label: "Minutes each", width: "6.5rem", kind: "number" },
                { key: "automatable", label: "Could automate", width: "7rem", kind: "number", suffix: "%" },
              ]}
              onChange={(id, key, value) => setTasks((l) => l.map((t) => (t.id === id ? { ...t, [key]: value } : t)))}
              onAdd={() => setTasks((l) => [...l, { id: nextId++, name: "", perWeek: "", minutes: "", automatable: "50" }])}
              onRemove={(id) => setTasks((l) => l.filter((t) => t.id !== id))}
              addLabel="Add a task"
              rowName={(t, i) => t.name || `task ${i + 1}`}
            />
          </>
        }
        results={
          <ResultsPanel
            title="Time you could free"
            footer={
              ranked[0]
                ? `Start with “${ranked[0].name || "your top task"}”: it frees the most time. Automate one task at a time and check the results before the next.`
                : "Add tasks to see where automation would save the most time."
            }
          >
            <ResultRow emphasis label="Hours saved per month" value={h(totalSaved)} />
            <ResultRow label="Value of that time" value={valid ? formatMoney(totalSaved * (r as number), market, 0) : "—"} note="Per month" />
            <ResultRow label="Time on these tasks now" value={h(totalHours)} note="Per month" />
            <ResultRow label="Share that could be automated" value={totalHours > 0 ? `${Math.round((totalSaved / totalHours) * 100)}%` : "—"} />
          </ResultsPanel>
        }
        method={
          <MethodNote
            formulas={[
              "Hours per month = times a week × minutes each × 4.33 weeks ÷ 60",
              "Hours saved = hours per month × share that could be automated",
              "Value = hours saved × cost of an hour",
            ]}
          >
            <p>
              Automation tools such as Zapier, Make or n8n have their own costs and take time to set up and maintain. Compare the value here with those
              costs before you commit; the ROI calculator can help.
            </p>
            <MarketNote label={market.label} currency={market.currency} />
          </MethodNote>
        }
      />
      {ranked.length ? (
        <section aria-labelledby="auto-rank" className="mt-12">
          <h2 id="auto-rank" className="text-xl">
            Where to start
          </h2>
          <ol className="mt-4 divide-y divide-line rounded-[var(--radius-md)] border border-line bg-surface">
            {ranked.map((t, i) => (
              <li key={t.id} className="grid grid-cols-[2rem_1fr_auto] items-baseline gap-3 px-4 py-3 text-sm">
                <span className="tabular-nums text-muted">{i + 1}.</span>
                <span className="font-medium text-ink">{t.name || `Task ${i + 1}`}</span>
                <span className="tabular-nums text-slate">
                  {h(t.saved)} saved{valid ? `, ${formatMoney(t.value, market, 0)}` : ""}
                </span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </>
  );
}
