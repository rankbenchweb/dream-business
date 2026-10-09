"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Button, cx } from "@/components/ui";
import { buildPlan, goals, sellsOptions, stageOptions, type Answers, type GoalKey, type Plan } from "@/lib/navigator";
import { providerMarkets } from "@/lib/paymentProviders";
import { useMarket } from "@/lib/market";

const STORE = "tdb.navigator";

type Saved = { goal: GoalKey; answers: Answers; done: number[] };

function load(): Saved | null {
  try {
    const raw = window.localStorage.getItem(STORE);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}
function save(s: Saved | null) {
  try {
    if (s) window.localStorage.setItem(STORE, JSON.stringify(s));
    else window.localStorage.removeItem(STORE);
  } catch {
    /* storage unavailable: progress lasts for this visit only */
  }
}

function Choice<T extends string>({
  legend,
  name,
  value,
  options,
  onChange,
}: {
  legend: string;
  name: string;
  value: T | null;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-base font-semibold text-ink">{legend}</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {options.map((o) => (
          <label
            key={o.value}
            className={cx(
              "flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-sm font-medium transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold",
              value === o.value ? "border-ink bg-ink text-white" : "border-line-strong bg-surface text-slate hover:border-ink",
            )}
          >
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="sr-only" />
            <span aria-hidden className={cx("size-3.5 shrink-0 rounded-full border-2", value === o.value ? "border-gold-bright bg-gold-bright" : "border-line-strong")} />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Navigator() {
  const market = useMarket();
  const uid = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [goal, setGoal] = useState<GoalKey | null>(null);
  const [stage, setStage] = useState<Answers["stage"] | null>(null);
  const [sells, setSells] = useState<Answers["sells"] | null>(null);
  const [country, setCountry] = useState<Answers["country"]>("other");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [resumable, setResumable] = useState<Saved | null>(null);

  useEffect(() => {
    const s = load();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read saved progress from the browser once
    if (s) setResumable(s);
  }, []);

  useEffect(() => {
    if (providerMarkets.some((m) => m.code === market.code)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- default the country from the global market preference
      setCountry(market.code as Answers["country"]);
    }
  }, [market.code]);

  const focusTop = () => requestAnimationFrame(() => headingRef.current?.focus());

  const showPlan = (g: GoalKey, a: Answers, d: number[] = []) => {
    setGoal(g);
    setStage(a.stage);
    setSells(a.sells);
    setCountry(a.country);
    setPlan(buildPlan(g, a));
    setDone(d);
    save({ goal: g, answers: a, done: d });
    setResumable(null);
    focusTop();
  };

  const toggleDone = (i: number) => {
    const next = done.includes(i) ? done.filter((x) => x !== i) : [...done, i];
    setDone(next);
    if (goal && stage && sells) save({ goal, answers: { stage, sells, country }, done: next });
  };

  const restart = () => {
    setPlan(null);
    setGoal(null);
    setStage(null);
    setSells(null);
    setDone([]);
    save(null);
    focusTop();
  };

  const goalInfo = goals.find((g) => g.key === goal);

  // Step 3: the plan
  if (plan && goalInfo) {
    const complete = done.length;
    return (
      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gold-strong">Your plan</p>
            <h2 ref={headingRef} tabIndex={-1} className="mt-1 text-2xl focus:outline-none sm:text-3xl">
              {goalInfo.title}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <Button variant="secondary" onClick={() => setPlan(null)}>
              Change answers
            </Button>
            <Button variant="secondary" onClick={() => window.print()}>
              Print or save as PDF
            </Button>
            <Button variant="secondary" onClick={restart}>
              Start over
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-12">
          <div>
            <section aria-labelledby={`${uid}-obj`} className="rounded-[var(--radius-md)] border border-line bg-surface p-6">
              <h3 id={`${uid}-obj`} className="text-sm font-semibold text-muted">
                Objective
              </h3>
              <p className="mt-2 font-display text-lg font-medium tracking-[-0.01em] text-ink">{plan.objective}</p>
            </section>

            <section aria-labelledby={`${uid}-steps`} className="mt-8">
              <div className="flex items-baseline justify-between gap-4">
                <h3 id={`${uid}-steps`} className="text-xl">
                  Steps, in order
                </h3>
                <p className="text-sm text-muted" aria-live="polite">
                  {complete} of {plan.steps.length} done
                </p>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
                <div className="h-full bg-gold transition-[width]" style={{ width: `${(complete / plan.steps.length) * 100}%` }} />
              </div>
              <ol className="mt-5 space-y-3">
                {plan.steps.map((s, i) => {
                  const isDone = done.includes(i);
                  const cbId = `${uid}-step-${i}`;
                  return (
                    <li key={`${s.title}-${i}`} className={cx("rounded-[var(--radius-md)] border bg-surface p-5", isDone ? "border-gold/40 bg-gold-soft/40" : "border-line")}>
                      <div className="flex gap-4">
                        <input
                          id={cbId}
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggleDone(i)}
                          className="mt-1 size-5 shrink-0 accent-[var(--color-gold)] print:hidden"
                        />
                        <div className="min-w-0">
                          <label htmlFor={cbId} className="cursor-pointer">
                            <span className="text-xs tabular-nums text-muted">Step {i + 1}</span>
                            <span className={cx("block text-base font-semibold", isDone ? "text-slate line-through decoration-gold/50" : "text-ink")}>{s.title}</span>
                          </label>
                          <p className="mt-1 text-sm text-slate">{s.why}</p>
                          <Link
                            href={s.href}
                            className="mt-2 inline-block text-sm font-semibold text-gold-strong underline decoration-gold/30 underline-offset-4 hover:decoration-gold print:hidden"
                          >
                            {s.action}
                          </Link>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          </div>

          <aside className="space-y-6 self-start lg:sticky lg:top-36">
            <section className="on-dark rounded-[var(--radius-md)] bg-midnight p-6 text-fog" aria-labelledby={`${uid}-first`}>
              <h3 id={`${uid}-first`} className="text-sm font-semibold text-gold-bright">
                Do this first
              </h3>
              <p className="mt-2 text-sm text-fog">{plan.first}</p>
            </section>
            <section className="rounded-[var(--radius-md)] border border-line bg-surface p-6" aria-labelledby={`${uid}-risks`}>
              <h3 id={`${uid}-risks`} className="text-base">
                Risks to plan for
              </h3>
              <ul className="mt-3 space-y-3 text-sm text-slate">
                {plan.risks.map((r) => (
                  <li key={r} className="flex gap-3">
                    <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-brass" />
                    {r}
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-[var(--radius-md)] border border-line bg-paper p-6" aria-labelledby={`${uid}-ass`}>
              <h3 id={`${uid}-ass`} className="text-base">
                Based on your answers
              </h3>
              <ul className="mt-3 space-y-1.5 text-sm text-slate">
                {plan.assumptions.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-muted">
                This is a general plan built from your answers, not personal financial or legal advice. Nothing has been done on your behalf. Your
                progress is saved only in this browser.
              </p>
            </section>
          </aside>
        </div>
      </div>
    );
  }

  // Step 2: questions
  if (goalInfo) {
    const ready = stage && sells;
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) showPlan(goalInfo.key, { stage, sells, country });
        }}
        className="space-y-8"
      >
        <div>
          <p className="text-sm font-medium text-gold-strong">Step 2 of 2</p>
          <h2 ref={headingRef} tabIndex={-1} className="mt-1 text-2xl focus:outline-none sm:text-3xl">
            {goalInfo.title}: three quick questions
          </h2>
        </div>
        <Choice legend="Where is your business today?" name="stage" value={stage} options={stageOptions} onChange={setStage} />
        <Choice legend="What do you sell, or plan to sell?" name="sells" value={sells} options={sellsOptions} onChange={setSells} />
        <div>
          <label htmlFor={`${uid}-country`} className="block text-base font-semibold text-ink">
            Where is the business based?
          </label>
          <select
            id={`${uid}-country`}
            value={country}
            onChange={(e) => setCountry(e.target.value as Answers["country"])}
            className="mt-3 h-12 w-full max-w-sm rounded-[var(--radius-sm)] border border-line-strong bg-surface px-3 text-base text-ink hover:border-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          >
            {providerMarkets.map((m) => (
              <option key={m.code} value={m.code}>
                {m.label}
              </option>
            ))}
            <option value="other">Somewhere else</option>
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={!ready}>
            Build my plan
          </Button>
          <Button type="button" variant="secondary" onClick={() => { setGoal(null); focusTop(); }}>
            Choose a different goal
          </Button>
          {!ready ? <p className="text-sm text-muted">Answer the first two questions to continue.</p> : null}
        </div>
      </form>
    );
  }

  // Step 1: goal
  return (
    <div>
      {resumable ? (
        <div className="mb-8 flex flex-col gap-3 rounded-[var(--radius-md)] border border-gold/40 bg-gold-soft p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink">
            You have a saved plan: <strong>{goals.find((g) => g.key === resumable.goal)?.title}</strong>, {resumable.done.length} steps done.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => showPlan(resumable.goal, resumable.answers, resumable.done)}>Continue my plan</Button>
            <Button variant="secondary" onClick={() => { save(null); setResumable(null); }}>
              Discard
            </Button>
          </div>
        </div>
      ) : null}
      <p className="text-sm font-medium text-gold-strong">Step 1 of 2</p>
      <h2 ref={headingRef} tabIndex={-1} className="mt-1 text-2xl focus:outline-none sm:text-3xl">
        What do you want to achieve?
      </h2>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {goals.map((g) => (
          <li key={g.key}>
            <button
              type="button"
              onClick={() => {
                setGoal(g.key);
                focusTop();
              }}
              className="group flex h-full w-full flex-col rounded-[var(--radius-md)] border border-line bg-surface p-5 text-left transition-colors hover:border-gold"
            >
              <span className="font-display text-lg font-semibold tracking-[-0.01em] text-ink">{g.title}</span>
              <span className="mt-1 text-sm text-muted">{g.detail}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
