"use client";

import { useId, type ReactNode } from "react";
import { cx } from "@/components/ui";

export function NumberField({
  label,
  hint,
  value,
  onChange,
  prefix,
  suffix,
  error,
  min = 0,
  step = "any",
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  error?: string;
  min?: number;
  step?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="mt-0.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
      <div
        className={cx(
          "mt-2 flex h-12 items-center rounded-[var(--radius-sm)] border bg-surface focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20",
          error ? "border-danger" : "border-line-strong hover:border-ink",
        )}
      >
        {prefix ? <span className="pl-3 text-sm text-muted">{prefix}</span> : null}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={[hint ? `${id}-hint` : "", error ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined}
          className="h-full w-full min-w-0 bg-transparent px-3 text-base tabular-nums text-ink focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {suffix ? <span className="pr-3 text-sm text-muted">{suffix}</span> : null}
      </div>
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ResultRow({ label, value, emphasis, note }: { label: string; value: ReactNode; emphasis?: boolean; note?: string }) {
  return (
    <div className={cx("flex items-baseline justify-between gap-4 py-3", emphasis && "py-4")}>
      <dt className="text-sm text-mist">
        {label}
        {note ? <span className="block text-xs text-mist/80">{note}</span> : null}
      </dt>
      <dd
        className={cx(
          "text-right font-display tracking-[-0.01em] text-white",
          emphasis
            ? typeof value === "string" && value.length > 12
              ? "text-xl font-semibold"
              : "whitespace-nowrap text-3xl font-semibold"
            : "text-lg font-medium",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

/** Dark results panel that sits beside the inputs. */
export function ResultsPanel({ title, children, footer, className }: { title: string; children: ReactNode; footer?: ReactNode; className?: string }) {
  return (
    <section aria-label={title} aria-live="polite" className={cx("on-dark rounded-[var(--radius-md)] bg-midnight p-6 text-fog sm:p-8", className)}>
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <dl className="mt-3 divide-y divide-harbour">{children}</dl>
      {footer ? <div className="mt-5 border-t border-harbour pt-5 text-xs text-mist">{footer}</div> : null}
    </section>
  );
}

export function parseNum(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function currencySymbol(locale: string, currency: string) {
  return (
    new Intl.NumberFormat(locale, { style: "currency", currency, currencyDisplay: "narrowSymbol" })
      .formatToParts(0)
      .find((p) => p.type === "currency")?.value ?? currency
  );
}

/**
 * Standard calculator layout: inputs, then results, then method. On desktop
 * the results sit in a sticky column beside inputs and method.
 */
export function CalcLayout({ inputs, results, method, label }: { inputs: ReactNode; results: ReactNode; method: ReactNode; label: string }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-x-12">
      <form className="space-y-6 lg:col-start-1 lg:row-start-1" onSubmit={(e) => e.preventDefault()} aria-label={label}>
        {inputs}
      </form>
      <div className="self-start lg:sticky lg:top-36 lg:col-start-2 lg:row-span-2 lg:row-start-1">{results}</div>
      <div className="lg:col-start-1 lg:row-start-2">{method}</div>
    </div>
  );
}

export function MethodNote({ formulas, children }: { formulas: ReactNode[]; children?: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-line bg-surface p-5 text-sm text-slate">
      <h2 className="text-sm font-semibold text-ink">How this is calculated</h2>
      <ul className="mt-2 space-y-1">
        {formulas.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>
      {children ? <div className="mt-3 space-y-2 text-xs text-muted">{children}</div> : null}
    </div>
  );
}

export function Segmented<T extends string>({
  legend,
  name,
  value,
  options,
  onChange,
}: {
  legend: string;
  name: string;
  value: T;
  options: readonly (readonly [T, string])[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-ink">{legend}</legend>
      <div className="mt-2 inline-flex flex-wrap rounded-[var(--radius-sm)] border border-line-strong bg-surface p-1">
        {options.map(([v, label]) => (
          <label
            key={v}
            className={cx(
              "cursor-pointer rounded-[3px] px-3 py-2 text-sm font-medium has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold",
              value === v ? "bg-ink text-white" : "text-slate hover:text-ink",
            )}
          >
            <input type="radio" name={name} value={v} checked={value === v} onChange={() => onChange(v)} className="sr-only" />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export const fmtPct = (n: number, digits = 1) => (Number.isFinite(n) ? `${n.toLocaleString("en", { maximumFractionDigits: digits })}%` : "—");

export function MarketNote({ label, currency }: { label: string; currency: string }) {
  return (
    <p>
      Amounts use the {label} market ({currency}); change it with the market selector in the header. Everything is calculated in your browser and
      nothing you enter is sent to us.
    </p>
  );
}
