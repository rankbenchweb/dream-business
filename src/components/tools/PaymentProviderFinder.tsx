"use client";

import { useEffect, useId, useState } from "react";
import { useMarket } from "@/lib/market";
import { cx } from "@/components/ui";
import { CHECKED_ON, providerMarkets, providers, roleLabel, type MarketCode, type ProviderStatus, type Sells } from "@/lib/paymentProviders";
import { Segmented } from "./CalcParts";

const statusText: Record<ProviderStatus, string> = {
  available: "Available",
  limited: "Limited",
  check: "Check with provider",
  unavailable: "Not available",
};
const statusCls: Record<ProviderStatus, string> = {
  available: "bg-gold-soft text-gold-strong ring-gold/30",
  limited: "bg-surface text-ink ring-line-strong",
  check: "bg-surface text-slate ring-line-strong",
  unavailable: "bg-paper text-muted ring-line",
};
const order: ProviderStatus[] = ["available", "limited", "check", "unavailable"];
const groupTitle: Record<ProviderStatus, string> = {
  available: "Available to businesses based here",
  limited: "Available with restrictions",
  check: "Confirm with the provider",
  unavailable: "Not available here",
};

function Badge({ status }: { status: ProviderStatus }) {
  return <span className={cx("inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", statusCls[status])}>{statusText[status]}</span>;
}

export function PaymentProviderFinder() {
  const market = useMarket();
  const uid = useId();
  const [country, setCountry] = useState<MarketCode>("pk");
  const [sells, setSells] = useState<"all" | Sells>("all");
  const [showUnavailable, setShowUnavailable] = useState(false);

  // Follow the header market when it maps to a researched country.
  useEffect(() => {
    if (providerMarkets.some((m) => m.code === market.code)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync from the global market preference
      setCountry(market.code as MarketCode);
    }
  }, [market.code]);

  const label = providerMarkets.find((m) => m.code === country)!.label;
  const list = providers
    .filter((p) => sells === "all" || p.sells.includes(sells))
    .map((p) => ({ p, cell: p.markets[country] }));

  return (
    <div className="space-y-10">
      <div className="grid gap-6 rounded-[var(--radius-md)] border border-line bg-surface p-5 sm:p-6 lg:grid-cols-[minmax(0,18rem)_1fr]">
        <div>
          <label htmlFor={`${uid}-country`} className="block text-sm font-semibold text-ink">
            Where is your business registered?
          </label>
          <select
            id={`${uid}-country`}
            value={country}
            onChange={(e) => setCountry(e.target.value as MarketCode)}
            className="mt-2 h-12 w-full rounded-[var(--radius-sm)] border border-line-strong bg-surface px-3 text-base text-ink hover:border-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          >
            {providerMarkets.map((m) => (
              <option key={m.code} value={m.code}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <Segmented
          legend="What do you sell?"
          name="sells"
          value={sells}
          onChange={setSells}
          options={[["all", "Anything"], ["physical", "Physical goods"], ["digital", "Digital or software"], ["services", "Services"]] as const}
        />
      </div>

      <p className="max-w-[60rem] text-sm text-muted">
        <span className="font-semibold text-ink">Checked {CHECKED_ON}</span> from each provider&apos;s own pages. Availability changes, and approval
        depends on your business type and documents, so confirm with the provider before you build around it.
      </p>

      <div aria-live="polite" className="space-y-10">
        {order.map((status) => {
          const group = list.filter((x) => x.cell.status === status);
          if (!group.length) return null;
          if (status === "unavailable" && !showUnavailable) {
            return (
              <button
                key={status}
                type="button"
                onClick={() => setShowUnavailable(true)}
                className="text-sm font-semibold text-gold-strong underline decoration-gold/30 underline-offset-4 hover:decoration-gold"
              >
                Show {group.length} {group.length === 1 ? "provider" : "providers"} not available in {label}
              </button>
            );
          }
          return (
            <section key={status} aria-labelledby={`${uid}-${status}`}>
              <h2 id={`${uid}-${status}`} className="text-lg">
                {groupTitle[status]} <span className="font-normal text-muted">({group.length})</span>
              </h2>
              <ul className="mt-4 grid gap-4 md:grid-cols-2">
                {group.map(({ p, cell }) => (
                  <li key={p.slug} className={cx("flex flex-col rounded-[var(--radius-md)] border bg-surface p-5", status === "available" ? "border-line" : "border-line")}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-lg">{p.name}</h3>
                      <Badge status={cell.status} />
                    </div>
                    <p className="mt-1 text-xs font-medium text-muted">{roleLabel[p.role]}</p>
                    <p className="mt-3 text-sm text-slate">{p.summary}</p>
                    {cell.note ? <p className="mt-3 rounded-[var(--radius-sm)] bg-paper px-3 py-2 text-sm text-ink">{cell.note}</p> : null}
                    <div className="mt-auto pt-4">
                      <p className="text-xs text-muted">Source</p>
                      <ul className="mt-1 space-y-1">
                        {p.sources.map((s) => (
                          <li key={s.url}>
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-gold-strong underline decoration-gold/30 underline-offset-2 hover:decoration-gold"
                            >
                              {s.label}
                              <span className="sr-only"> (opens in a new tab)</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <section aria-labelledby={`${uid}-matrix`}>
        <h2 id={`${uid}-matrix`} className="text-lg">
          Compare every market
        </h2>
        <div className="mt-4 overflow-x-auto rounded-[var(--radius-md)] border border-line bg-surface" tabIndex={0} role="region" aria-label="Provider availability by country, scrolls sideways on small screens">
          <table className="w-full min-w-[52rem] text-left text-xs">
            <thead className="bg-paper text-muted">
              <tr>
                <th scope="col" className="px-3 py-3 font-semibold">Provider</th>
                {providerMarkets.map((m) => (
                  <th key={m.code} scope="col" className={cx("px-2 py-3 font-semibold", m.code === country && "text-ink")}>
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {providers.map((p) => (
                <tr key={p.slug}>
                  <th scope="row" className="px-3 py-2.5 text-sm font-semibold text-ink">
                    {p.name}
                  </th>
                  {providerMarkets.map((m) => {
                    const s = p.markets[m.code].status;
                    return (
                      <td key={m.code} className={cx("px-2 py-2.5", m.code === country && "bg-gold-soft/40")}>
                        <span
                          className={cx(
                            "font-medium",
                            s === "available" ? "text-gold-strong" : s === "limited" ? "text-ink" : s === "check" ? "text-slate" : "text-muted",
                          )}
                        >
                          {s === "available" ? "Yes" : s === "limited" ? "Limited" : s === "check" ? "Check" : "No"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
