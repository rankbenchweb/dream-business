"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import { toolCategories, tools, type ToolCategory } from "@/lib/tools";
import { StatusBadge, cx } from "@/components/ui";
import { SearchIcon } from "@/components/layout/SearchDialog";

/**
 * Searchable, filterable tool catalogue. Live tools open; planned
 * tools are listed as planned and are not clickable.
 */
export function ToolFinder({ limit, readQueryFromUrl = false }: { limit?: number; readQueryFromUrl?: boolean }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ToolCategory | "all">("all");
  const [liveOnly, setLiveOnly] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const inputId = useId();

  useEffect(() => {
    if (!readQueryFromUrl) return;
    const q = new URLSearchParams(window.location.search).get("q");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from the URL on mount
    if (q) setQuery(q);
  }, [readQueryFromUrl]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools
      .filter((t) => category === "all" || t.category === category)
      .filter((t) => !liveOnly || t.status === "live")
      .filter((t) => !q || `${t.name} ${t.summary} ${t.category}`.toLowerCase().includes(q))
      .sort((a, b) => (a.status === b.status ? 0 : a.status === "live" ? -1 : b.status === "live" ? 1 : a.status === "building" ? -1 : 1));
  }, [query, category, liveOnly]);

  const visible = limit && !expanded ? filtered.slice(0, limit) : filtered;
  const usedCategories = toolCategories.filter((c) => tools.some((t) => t.category === c));

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative lg:w-80">
          <label htmlFor={inputId} className="sr-only">
            Search tools
          </label>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, e.g. margin"
            className="h-11 w-full rounded-[var(--radius-sm)] border border-line-strong bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-muted hover:border-ink focus:border-gold focus:outline-none"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate lg:ml-auto lg:order-last">
          <input type="checkbox" checked={liveOnly} onChange={(e) => setLiveOnly(e.target.checked)} className="size-4 accent-[var(--color-gold)]" />
          Show live tools only
        </label>
        <div className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0" role="group" aria-label="Filter by category">
          <div className="flex w-max gap-2 lg:w-auto lg:flex-wrap">
            {(["all", ...usedCategories] as const).map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
                className={cx(
                  "h-8 whitespace-nowrap rounded-full border px-3 text-xs font-medium transition-colors",
                  category === c ? "border-ink bg-ink text-white" : "border-line-strong bg-surface text-slate hover:border-ink",
                )}
              >
                {c === "all" ? "All categories" : c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs text-muted" aria-live="polite">
        {filtered.length === 0
          ? "No tools match."
          : `${filtered.length} ${filtered.length === 1 ? "tool" : "tools"}, ${filtered.filter((t) => t.status === "live").length} live`}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-3 rounded-[var(--radius-md)] border border-dashed border-line-strong bg-surface px-6 py-10">
          <p className="font-semibold text-ink">No tools match “{query}”.</p>
          <p className="mt-1 text-sm text-muted">Clear the search or choose another category. Missing a tool you need? Tell us through the contact page.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("all");
              setLiveOnly(false);
            }}
            className="mt-4 text-sm font-semibold text-gold-strong underline underline-offset-4"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-line overflow-hidden rounded-[var(--radius-md)] border border-line bg-surface">
          {visible.map((t) => {
            const body = (
              <>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className={cx("text-base font-semibold", t.status === "live" ? "text-ink" : "text-slate")}>{t.name}</h3>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted">{t.summary}</p>
                </div>
                <p className="text-xs text-muted sm:text-right">{t.category}</p>
                <span className={cx("text-sm font-semibold sm:text-right", t.status === "live" ? "text-gold-strong" : "text-transparent")} aria-hidden={t.status !== "live"}>
                  {t.status === "live" ? "Open tool" : ""}
                </span>
              </>
            );
            const grid = "grid gap-3 px-5 py-5 sm:grid-cols-[1fr_11rem_6rem] sm:items-center sm:gap-6";
            return (
              <li key={t.slug}>
                {t.href ? (
                  <Link href={t.href} className={cx(grid, "hover:bg-gold-soft/40")}>
                    {body}
                  </Link>
                ) : (
                  <div className={grid}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {limit && filtered.length > limit ? (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-4 text-sm font-semibold text-gold-strong underline decoration-gold/30 decoration-2 underline-offset-4 hover:decoration-gold"
          aria-expanded={expanded}
        >
          {expanded ? "Show fewer tools" : `Show all ${filtered.length} tools`}
        </button>
      ) : null}
    </div>
  );
}
