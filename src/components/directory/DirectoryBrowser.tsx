"use client";

import { useId, useMemo, useState } from "react";
import { DisclosureLabel } from "@/components/Disclosure";
import { cx } from "@/components/ui";
import { serviceMarkets } from "@/lib/listings";

export type PublicListing = {
  id: string;
  name: string;
  summary: string;
  website: string;
  headquarters: string | null;
  serves_markets: string[];
  verified: boolean;
  verified_scope: string | null;
  category: string;
};

export type PublicSponsored = { campaignId: string; listingId: string; headline: string; body: string | null; url: string };

const marketName = new Map(serviceMarkets.map((m) => [m.code, m.label]));
const select =
  "mt-2 h-11 w-full rounded-[var(--radius-sm)] border border-line-strong bg-surface px-3 text-sm text-ink hover:border-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20";

export function DirectoryBrowser({
  listings,
  categories,
  sponsored = [],
}: {
  listings: PublicListing[];
  categories: string[];
  sponsored?: PublicSponsored[];
}) {
  const id = useId();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [market, setMarket] = useState("");

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return listings.filter(
      (l) =>
        (!cat || l.category === cat) &&
        (!market || l.serves_markets.includes(market) || l.serves_markets.includes("global")) &&
        (!needle || `${l.name} ${l.summary} ${l.headquarters ?? ""}`.toLowerCase().includes(needle)),
    );
  }, [listings, q, cat, market]);

  // Sponsored placements follow the same filters as the listings they promote.
  const shownIds = new Set(shown.map((l) => l.id));
  const byId = new Map(listings.map((l) => [l.id, l]));
  const promoted = sponsored.filter((s) => shownIds.has(s.listingId)).slice(0, 2);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor={`${id}-q`} className="text-sm font-semibold text-ink">
            Search
          </label>
          <input id={`${id}-q`} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or what they offer" className={select} />
        </div>
        <div>
          <label htmlFor={`${id}-cat`} className="text-sm font-semibold text-ink">
            Category
          </label>
          <select id={`${id}-cat`} value={cat} onChange={(e) => setCat(e.target.value)} className={select}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-mk`} className="text-sm font-semibold text-ink">
            Serves
          </label>
          <select id={`${id}-mk`} value={market} onChange={(e) => setMarket(e.target.value)} className={select}>
            <option value="">Any market</option>
            {serviceMarkets
              .filter((m) => m.code !== "global")
              .map((m) => (
                <option key={m.code} value={m.code}>
                  {m.label}
                </option>
              ))}
          </select>
        </div>
      </div>
      <p className="mt-5 text-sm text-muted" aria-live="polite">
        {shown.length === listings.length ? `${listings.length} ${listings.length === 1 ? "listing" : "listings"}` : `${shown.length} of ${listings.length} listings`}
        , newest first. Listed businesses asked to be included and passed review.
      </p>
      {promoted.length ? (
        <section aria-label="Sponsored placements" className="mt-4">
          <ul className="grid gap-5 md:grid-cols-2">
            {promoted.map((p) => {
              const l = byId.get(p.listingId)!;
              return (
                <li key={p.campaignId} className="flex flex-col rounded-[var(--radius-md)] border border-brass/50 bg-brass-soft/40 p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <DisclosureLabel kind="sponsored" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted">{l.category}</span>
                  </div>
                  <h3 className="mt-3 text-lg">{l.name}</h3>
                  <p className="mt-1 font-semibold text-ink">{p.headline}</p>
                  {p.body ? <p className="mt-2 flex-1 text-sm text-slate">{p.body}</p> : <div className="flex-1" />}
                  <a
                    href={p.url}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="mt-4 self-start text-sm font-semibold text-gold-strong underline decoration-gold/30 decoration-2 underline-offset-4 hover:decoration-gold"
                  >
                    Learn more<span className="sr-only">: {l.name}, sponsored (opens in a new tab)</span>
                  </a>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-xs text-muted">Sponsored placements are paid for and pass our advertising review. They don&apos;t change verification or rankings.</p>
        </section>
      ) : null}
      <ul className="mt-4 grid gap-5 md:grid-cols-2">
        {shown.map((l) => (
          <li key={l.id} className="flex flex-col rounded-[var(--radius-md)] border border-line bg-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{l.category}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h3 className="text-lg">{l.name}</h3>
              {l.verified ? <DisclosureLabel kind="verified" /> : null}
            </div>
            <p className="mt-2 flex-1 text-sm text-slate">{l.summary}</p>
            {l.verified && l.verified_scope ? <p className="mt-2 text-xs text-success">Checked: {l.verified_scope}</p> : null}
            <p className="mt-3 text-xs text-muted">
              {l.headquarters ? `${l.headquarters} · ` : ""}Serves {l.serves_markets.map((c) => marketName.get(c) ?? c).join(", ")}
            </p>
            <a
              href={l.website}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className={cx("mt-4 self-start text-sm font-semibold text-gold-strong underline decoration-gold/30 decoration-2 underline-offset-4 hover:decoration-gold")}
            >
              Visit website<span className="sr-only">: {l.name} (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
      {!shown.length ? <p className="mt-4 rounded-[var(--radius-md)] border border-dashed border-line-strong p-6 text-sm text-muted">No listings match these filters yet.</p> : null}
    </div>
  );
}
