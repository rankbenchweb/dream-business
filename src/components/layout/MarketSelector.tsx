"use client";

import { markets, setMarket, useMarket } from "@/lib/market";
import { cx } from "@/components/ui";

/**
 * Market preference. It sets the currency used by every calculator and
 * will drive country-specific guidance as that content is added.
 */
export function MarketSelector({ id, className, tone = "dark" }: { id: string; className?: string; tone?: "dark" | "light" }) {
  const market = useMarket();
  return (
    <div className={cx("flex items-center gap-2", className)}>
      <label htmlFor={id} className={cx("text-xs", tone === "dark" ? "text-mist" : "text-muted")}>
        Market
      </label>
      <div className="relative">
        <select
          id={id}
          value={market.code}
          onChange={(e) => setMarket(e.target.value)}
          className={cx(
            "h-8 appearance-none rounded-[var(--radius-sm)] border py-0 pl-2.5 pr-7 text-xs font-medium",
            tone === "dark"
              ? "border-harbour-line bg-midnight text-white hover:border-mist"
              : "border-line-strong bg-surface text-ink hover:border-ink",
          )}
        >
          {markets.map((m) => (
            <option key={m.code} value={m.code}>
              {m.label} ({m.currency})
            </option>
          ))}
        </select>
        <svg aria-hidden viewBox="0 0 12 12" className={cx("pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2", tone === "dark" ? "text-mist" : "text-muted")}>
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
}
