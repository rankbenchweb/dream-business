"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DisclosureLabel } from "@/components/Disclosure";
import { cx } from "@/components/ui";
import { businessModels, factors, fitScore, type Factor, type Level } from "@/lib/businessModels";

function Meter({ level }: { level: Level }) {
  return (
    <span aria-hidden className="flex gap-0.5">
      {[1, 2, 3].map((i) => (
        <span key={i} className={cx("h-1.5 w-4 rounded-full", i <= level ? "bg-ink" : "bg-line-strong/60")} />
      ))}
    </span>
  );
}

function fitLabel(score: number, max: number) {
  const r = score / max;
  if (r >= 0.75) return { text: "Strong fit", cls: "bg-gold-soft text-gold-strong ring-gold/30" };
  if (r >= 0.4) return { text: "Partial fit", cls: "bg-surface text-slate ring-line-strong" };
  return { text: "Weak fit", cls: "bg-transparent text-muted ring-line" };
}

export function BusinessModelComparison() {
  const [chosen, setChosen] = useState<Factor[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  const toggle = (f: Factor) => setChosen((c) => (c.includes(f) ? c.filter((x) => x !== f) : [...c, f]));

  const ranked = useMemo(() => {
    const list = businessModels.map((m, i) => ({ m, i, score: fitScore(m, chosen) }));
    if (chosen.length) list.sort((a, b) => b.score - a.score || a.i - b.i);
    return list;
  }, [chosen]);

  const max = chosen.length * 2;

  return (
    <div>
      <div className="rounded-[var(--radius-md)] border border-line bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 className="text-base font-semibold">What matters most to you?</h2>
          <p className="text-xs text-muted">Choose any. Models are re-ordered by how well they fit.</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Your priorities">
          {factors.map((f) => {
            const on = chosen.includes(f.key);
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(f.key)}
                className={cx(
                  "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors",
                  on ? "border-ink bg-ink text-white" : "border-line-strong bg-surface text-slate hover:border-ink",
                )}
              >
                {on ? (
                  <svg viewBox="0 0 12 12" aria-hidden className="size-3">
                    <path d="m2.5 6.5 2.2 2.2 4.8-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
                {f.priority}
              </button>
            );
          })}
          {chosen.length ? (
            <button type="button" onClick={() => setChosen([])} className="h-9 px-2 text-sm font-semibold text-gold-strong underline underline-offset-4">
              Clear
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted">
        <DisclosureLabel kind="estimate" />
        <span>Editorial assessment of typical patterns, not measured data. Your own costs and results will differ.</span>
      </div>

      <p className="sr-only" aria-live="polite">
        {chosen.length ? `Models re-ordered by fit with ${chosen.length} ${chosen.length === 1 ? "priority" : "priorities"}.` : "Models shown in default order."}
      </p>

      <ol className="mt-5 space-y-3">
        {ranked.map(({ m, score }, idx) => {
          const fit = chosen.length ? fitLabel(score, max) : null;
          const isOpen = open === m.slug;
          return (
            <li key={m.slug} className="rounded-[var(--radius-md)] border border-line bg-surface">
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,17rem)_1fr] lg:gap-8">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {chosen.length ? <span className="text-xs tabular-nums text-muted">{idx + 1}.</span> : null}
                    <h3 className="text-lg">{m.name}</h3>
                    {fit ? <span className={cx("rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", fit.cls)}>{fit.text}</span> : null}
                  </div>
                  <p className="mt-1.5 text-sm text-muted">{m.summary}</p>
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 xl:grid-cols-6">
                  {factors.map((f) => {
                    const v = m.ratings[f.key];
                    const highlight = chosen.includes(f.key);
                    const matches = highlight && v === f.good;
                    return (
                      <div
                        key={f.key}
                        className={cx("rounded-[var(--radius-sm)] px-2.5 py-2", highlight ? (matches ? "bg-gold-soft" : "bg-paper") : "")}
                      >
                        <dt className="text-xs text-muted">{f.label}</dt>
                        <dd className="mt-1 flex items-center gap-2 text-sm font-medium text-ink">
                          <Meter level={v} />
                          {f.levels[v - 1]}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
              <div className="border-t border-line">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`model-${m.slug}`}
                  onClick={() => setOpen(isOpen ? null : m.slug)}
                  className="flex w-full items-center justify-between px-5 py-3 text-left text-sm font-semibold text-ink hover:bg-paper sm:px-6"
                >
                  {isOpen ? "Hide details" : `Who ${m.name.toLowerCase()} suits, and the risks`}
                  <svg aria-hidden viewBox="0 0 12 12" className={cx("size-3 text-muted transition-transform", isOpen && "rotate-180")}>
                    <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </button>
                <div id={`model-${m.slug}`} hidden={!isOpen} className="grid gap-6 px-5 pb-6 sm:px-6 md:grid-cols-3">
                  <div>
                    <h4 className="text-sm font-semibold text-ink">Best for</h4>
                    <p className="mt-1 text-sm text-slate">{m.bestFor}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-ink">Watch out for</h4>
                    <p className="mt-1 text-sm text-slate">{m.watchOut}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-ink">Run the numbers</h4>
                    <ul className="mt-1 space-y-1">
                      {m.tools.map((t) => (
                        <li key={t.href}>
                          <Link href={t.href} className="text-sm font-semibold text-gold-strong underline decoration-gold/30 underline-offset-4 hover:decoration-gold">
                            {t.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
