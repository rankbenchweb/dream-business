"use client";

import { useId, type ReactNode } from "react";
import { cx } from "@/components/ui";

export type Column<R> = {
  key: keyof R & string;
  label: string;
  width: string;
  kind: "text" | "number";
  prefix?: string;
  suffix?: string;
};

const inputCls =
  "h-11 w-full min-w-0 rounded-[var(--radius-sm)] border bg-surface px-2.5 text-sm text-ink hover:border-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20";

/**
 * Editable rows with labelled columns. Stacks into labelled fields on
 * small screens and becomes a compact table-like grid on wide screens.
 */
export function RowEditor<R extends { id: number }>({
  title,
  description,
  rows,
  columns,
  onChange,
  onAdd,
  onRemove,
  addLabel,
  rowName,
  footer,
}: {
  title: string;
  description?: string;
  rows: R[];
  columns: Column<R>[];
  onChange: (id: number, key: keyof R, value: string) => void;
  onAdd: () => void;
  onRemove: (id: number) => void;
  addLabel: string;
  rowName: (row: R, index: number) => string;
  footer?: ReactNode;
}) {
  const uid = useId();
  const template = `${columns.map((c) => c.width).join(" ")} 2.75rem`;
  return (
    <fieldset className="rounded-[var(--radius-md)] border border-line bg-surface p-5">
      <legend className="sr-only">{title}</legend>
      <h2 className="text-base font-semibold">{title}</h2>
      {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      <div className="mt-4 hidden gap-2 text-xs font-semibold text-muted md:grid" style={{ gridTemplateColumns: template }} aria-hidden>
        {columns.map((c) => (
          <span key={c.key}>{c.label}</span>
        ))}
      </div>
      <ul className="mt-2 space-y-4 md:space-y-2">
        {rows.map((row, i) => (
          <li key={row.id} className="grid grid-cols-2 gap-2 border-b border-line pb-4 md:border-0 md:pb-0 md:[grid-template-columns:var(--cols)]" style={{ ["--cols" as string]: template }}>
            {columns.map((c, ci) => {
              const id = `${uid}-${row.id}-${c.key}`;
              return (
                <div key={c.key} className={cx(ci === 0 && "col-span-2 md:col-span-1")}>
                  <label htmlFor={id} className="mb-1 block text-xs font-semibold text-muted md:sr-only">
                    {c.label}
                    <span className="sr-only"> for {rowName(row, i)}</span>
                  </label>
                  {c.prefix || c.suffix ? (
                    <div className="flex h-11 items-center rounded-[var(--radius-sm)] border border-line-strong bg-surface hover:border-ink focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20">
                      {c.prefix ? <span className="pl-2.5 text-xs text-muted">{c.prefix}</span> : null}
                      <input
                        id={id}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        value={String(row[c.key] ?? "")}
                        onChange={(e) => onChange(row.id, c.key, e.target.value)}
                        className="h-full w-full min-w-0 bg-transparent px-2 text-sm tabular-nums text-ink focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      {c.suffix ? <span className="pr-2.5 text-xs text-muted">{c.suffix}</span> : null}
                    </div>
                  ) : (
                    <input
                      id={id}
                      type={c.kind === "number" ? "number" : "text"}
                      inputMode={c.kind === "number" ? "decimal" : undefined}
                      min={c.kind === "number" ? 0 : undefined}
                      value={String(row[c.key] ?? "")}
                      onChange={(e) => onChange(row.id, c.key, e.target.value)}
                      className={cx(inputCls, "border-line-strong", c.kind === "number" && "tabular-nums")}
                    />
                  )}
                </div>
              );
            })}
            <div className="col-span-2 flex justify-end md:col-span-1 md:items-end">
              <button
                type="button"
                onClick={() => onRemove(row.id)}
                aria-label={`Remove ${rowName(row, i)}`}
                className="flex h-11 items-center gap-2 rounded-[var(--radius-sm)] px-3 text-sm text-muted hover:bg-paper hover:text-danger md:size-11 md:justify-center md:px-0"
              >
                <svg viewBox="0 0 16 16" aria-hidden className="size-4">
                  <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <span className="md:sr-only">Remove</span>
              </button>
            </div>
          </li>
        ))}
      </ul>
      {rows.length === 0 ? <p className="mt-3 text-sm text-muted">Nothing here yet. Add the first row below.</p> : null}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-sm)] border border-dashed border-line-strong px-3 text-sm font-semibold text-ink hover:border-ink"
        >
          <span aria-hidden>+</span> {addLabel}
        </button>
        {footer}
      </div>
    </fieldset>
  );
}
