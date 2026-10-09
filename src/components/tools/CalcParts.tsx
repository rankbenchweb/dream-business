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
      <dd className={cx("text-right font-display tracking-[-0.01em] text-white", emphasis ? "text-3xl font-semibold" : "text-lg font-medium")}>
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
