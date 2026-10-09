import { notFound } from "next/navigation";
import { Suspense } from "react";
import { reviewCampaign, reviewListing } from "@/app/staff/actions";
import { campaignStatusLabel, placements, tiers, type CampaignStatus } from "@/lib/campaigns";
import { AccountsClosed, ListingStatusBadge, Loading, Notice } from "@/components/account/Shared";
import { PageHero, Section, TextLink } from "@/components/ui";
import { getCurrentUser, isStaffEmail } from "@/lib/auth";
import type { ListingStatus } from "@/lib/listings";
import { serviceMarkets } from "@/lib/listings";
import { pageMetadata } from "@/lib/seo";
import { createAdminClient, staffToolsConfigured } from "@/lib/supabase/admin";
import { accountsEnabled } from "@/lib/supabase/config";

export const metadata = pageMetadata({
  title: "Review queue",
  description: "Staff review of directory listings.",
  path: "/staff/review",
  noindex: true,
});

type Search = Promise<{ notice?: string }>;

export default function StaffReviewPage({ searchParams }: { searchParams: Search }) {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Review queue", path: "/staff/review" }]}
        title="Listing review queue"
        lead="Publish listings that meet the standards, return the rest with a clear note, and record verification only after the check is done."
        accent="brass"
      />
      <Section tone="white">
        {accountsEnabled ? (
          <Suspense fallback={<Loading>Loading the queue…</Loading>}>
            <Body searchParams={searchParams} />
          </Suspense>
        ) : (
          <AccountsClosed />
        )}
      </Section>
    </>
  );
}

type Row = {
  id: string;
  organization_id: string;
  category_id: number;
  name: string;
  summary: string;
  description: string | null;
  website: string;
  headquarters: string | null;
  serves_markets: string[];
  status: ListingStatus;
  verification: "unverified" | "verified";
  verified_scope: string | null;
  submitted_at: string | null;
  published_at: string | null;
};

type CampaignRow = {
  id: string;
  organization_id: string;
  name: string;
  tier: string;
  placement: string;
  destination_url: string;
  headline: string;
  body: string | null;
  starts_on: string | null;
  ends_on: string | null;
  budget_note: string | null;
  status: CampaignStatus;
  submitted_at: string | null;
};

const campaignActions: Record<string, { decision: string; label: string; primary?: boolean }[]> = {
  submitted: [
    { decision: "approve", label: "Approve", primary: true },
    { decision: "return", label: "Return with note" },
  ],
  approved: [
    { decision: "live", label: "Mark as live", primary: true },
    { decision: "return", label: "Return with note" },
    { decision: "end", label: "End" },
  ],
  live: [
    { decision: "pause", label: "Pause" },
    { decision: "end", label: "End" },
  ],
  paused: [
    { decision: "live", label: "Resume", primary: true },
    { decision: "end", label: "End" },
  ],
};

const marketName = new Map(serviceMarkets.map((m) => [m.code, m.label]));
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
const btn = "inline-flex min-h-11 items-center justify-center rounded-[var(--radius-sm)] px-4 text-sm font-semibold";

async function Body({ searchParams }: { searchParams: Search }) {
  const user = await getCurrentUser();
  // Not signed in, not staff, or staff tools not configured: this page doesn't exist.
  if (!user || !isStaffEmail(user.email) || !staffToolsConfigured) notFound();
  const { notice } = await searchParams;

  const admin = createAdminClient();
  const cols = "id,organization_id,category_id,name,summary,description,website,headquarters,serves_markets,status,verification,verified_scope,submitted_at,published_at";
  const [queue, live, cats, camps] = await Promise.all([
    admin.from("business_listings").select(cols).eq("status", "submitted").order("submitted_at", { ascending: true }).limit(100),
    admin.from("business_listings").select(cols).eq("status", "published").order("published_at", { ascending: false }).limit(100),
    admin.from("listing_categories").select("id,name"),
    admin
      .from("campaigns")
      .select("id,organization_id,name,tier,placement,destination_url,headline,body,starts_on,ends_on,budget_note,status,submitted_at")
      .in("status", ["submitted", "approved", "live", "paused"])
      .order("submitted_at", { ascending: true })
      .limit(200),
  ]);
  if (queue.error || live.error || cats.error || camps.error) throw new Error("Review queue could not load");
  const campaigns = (camps.data ?? []) as CampaignRow[];
  const rows = [...(queue.data ?? []), ...(live.data ?? [])] as Row[];
  const orgIds = Array.from(new Set([...rows.map((r) => r.organization_id), ...campaigns.map((c) => c.organization_id)]));
  const orgs = orgIds.length ? await admin.from("organizations").select("id,name,website,country").in("id", orgIds) : { data: [], error: null };
  if (orgs.error) throw new Error("Review queue could not load");
  const orgOf = new Map((orgs.data ?? []).map((o) => [o.id as string, o as { name: string; website: string | null; country: string | null }]));
  const catOf = new Map((cats.data ?? []).map((c) => [c.id as number, c.name as string]));

  const card = (r: Row) => {
    const org = orgOf.get(r.organization_id);
    return (
      <li key={r.id} id={`listing-${r.id}`} className="scroll-mt-24 rounded-[var(--radius-md)] border border-line p-6">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg">{r.name}</h3>
          <ListingStatusBadge status={r.status} />
          {r.verification === "verified" ? <span className="text-xs font-semibold text-success">Verified: {r.verified_scope}</span> : null}
        </div>
        <p className="mt-1 text-sm text-muted">
          {catOf.get(r.category_id)} · Business profile: {org?.name ?? "unknown"}
          {org?.country ? `, ${org.country}` : ""}
          {r.status === "submitted" && r.submitted_at ? ` · Submitted ${dateFmt.format(new Date(r.submitted_at))} UTC` : ""}
        </p>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="font-semibold text-ink">Summary</dt>
            <dd className="mt-1 text-slate">{r.summary}</dd>
          </div>
          {r.description ? (
            <div className="sm:col-span-2">
              <dt className="font-semibold text-ink">Description</dt>
              <dd className="mt-1 max-h-48 overflow-auto whitespace-pre-line text-slate">{r.description}</dd>
            </div>
          ) : null}
          <div>
            <dt className="font-semibold text-ink">Website</dt>
            <dd className="mt-1 break-all">
              <a href={r.website} target="_blank" rel="noopener noreferrer nofollow" className="text-gold-strong underline underline-offset-2">
                {r.website}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-ink">Serves</dt>
            <dd className="mt-1 text-slate">{r.serves_markets.map((c) => marketName.get(c) ?? c).join(", ")}</dd>
          </div>
        </dl>
        <form action={reviewListing} className="mt-5 border-t border-line pt-5">
          <input type="hidden" name="listingId" value={r.id} />
          <label htmlFor={`note-${r.id}`} className="block text-sm font-semibold text-ink">
            {r.status === "submitted" ? "Note to the business (needed to return it)" : "What was verified (needed to verify)"}
          </label>
          <textarea
            id={`note-${r.id}`}
            name="note"
            rows={2}
            maxLength={1000}
            className="mt-2 w-full rounded-[var(--radius-sm)] border border-line-strong px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          />
          <div className="mt-3 flex flex-wrap gap-3">
            {r.status === "submitted" ? (
              <>
                <button name="decision" value="publish" className={`${btn} bg-gold text-white hover:bg-gold-strong`}>
                  Publish
                </button>
                <button name="decision" value="reject" className={`${btn} border border-line-strong text-ink hover:border-ink`}>
                  Return with note
                </button>
              </>
            ) : r.verification === "verified" ? (
              <button name="decision" value="unverify" className={`${btn} border border-line-strong text-ink hover:border-ink`}>
                Remove verification
              </button>
            ) : (
              <button name="decision" value="verify" className={`${btn} border border-line-strong text-ink hover:border-ink`}>
                Mark as verified
              </button>
            )}
          </div>
        </form>
      </li>
    );
  };

  const waiting = rows.filter((r) => r.status === "submitted");
  const published = rows.filter((r) => r.status === "published");
  return (
    <div>
      <Notice code={notice} />
      <p className="mb-10 max-w-[48rem] text-sm text-muted">
        Signed in as {user.email}. Every decision is recorded in the audit log. Check each listing against the{" "}
        <TextLink href="/verification-standards">data and verification standards</TextLink>; only mark a listing verified after completing a check you can
        describe.
      </p>
      <section aria-labelledby="queue-heading">
        <h2 id="queue-heading" className="text-2xl">
          Waiting for review ({waiting.length})
        </h2>
        {waiting.length ? <ul className="mt-6 space-y-6">{waiting.map(card)}</ul> : <p className="mt-4 text-sm text-muted">Nothing is waiting for review.</p>}
      </section>
      <section aria-labelledby="live-heading" className="mt-16">
        <h2 id="live-heading" className="text-2xl">
          Live listings ({published.length})
        </h2>
        {published.length ? <ul className="mt-6 space-y-6">{published.map(card)}</ul> : <p className="mt-4 text-sm text-muted">No live listings yet.</p>}
      </section>
      <section id="campaigns" aria-labelledby="campaigns-heading" className="mt-16 scroll-mt-24">
        <h2 id="campaigns-heading" className="text-2xl">
          Campaigns ({campaigns.length})
        </h2>
        <p className="mt-2 max-w-[48rem] text-sm text-muted">
          Approve only campaigns that meet the advertising standards. Agree dates and price with the advertiser before marking a campaign live;
          payments are handled outside the platform for now.
        </p>
        {campaigns.length ? (
          <ul className="mt-6 space-y-6">
            {campaigns.map((c) => {
              const org = orgOf.get(c.organization_id);
              return (
                <li key={c.id} id={`campaign-${c.id}`} className="scroll-mt-24 rounded-[var(--radius-md)] border border-line p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg">{c.name}</h3>
                    <span className="inline-flex items-center rounded-full bg-brass-soft px-2.5 py-0.5 text-xs font-semibold text-[#6b5120] ring-1 ring-brass/40">
                      {campaignStatusLabel[c.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {org?.name ?? "Unknown business"} · {tiers.find((t) => t.value === c.tier)?.label} · {placements.find((p) => p.value === c.placement)?.label}
                  </p>
                  <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <dt className="font-semibold text-ink">Headline</dt>
                      <dd className="mt-1 text-slate">{c.headline}</dd>
                    </div>
                    {c.body ? (
                      <div className="sm:col-span-2">
                        <dt className="font-semibold text-ink">Supporting text</dt>
                        <dd className="mt-1 text-slate">{c.body}</dd>
                      </div>
                    ) : null}
                    <div>
                      <dt className="font-semibold text-ink">Link destination</dt>
                      <dd className="mt-1 break-all">
                        <a href={c.destination_url} target="_blank" rel="noopener noreferrer nofollow" className="text-gold-strong underline underline-offset-2">
                          {c.destination_url}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-ink">Preferred dates</dt>
                      <dd className="mt-1 text-slate">
                        {c.starts_on ?? "Not set"} to {c.ends_on ?? "not set"}
                      </dd>
                    </div>
                    {c.budget_note ? (
                      <div className="sm:col-span-2">
                        <dt className="font-semibold text-ink">Budget and notes</dt>
                        <dd className="mt-1 text-slate">{c.budget_note}</dd>
                      </div>
                    ) : null}
                  </dl>
                  <form action={reviewCampaign} className="mt-5 border-t border-line pt-5">
                    <input type="hidden" name="campaignId" value={c.id} />
                    {campaignActions[c.status]?.some((a) => a.decision === "return") ? (
                      <>
                        <label htmlFor={`cnote-${c.id}`} className="block text-sm font-semibold text-ink">
                          Note to the advertiser (needed to return it)
                        </label>
                        <textarea
                          id={`cnote-${c.id}`}
                          name="note"
                          rows={2}
                          maxLength={1000}
                          className="mt-2 w-full rounded-[var(--radius-sm)] border border-line-strong px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                        />
                      </>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-3">
                      {(campaignActions[c.status] ?? []).map((a) => (
                        <button
                          key={a.decision}
                          name="decision"
                          value={a.decision}
                          className={a.primary ? `${btn} bg-gold text-white hover:bg-gold-strong` : `${btn} border border-line-strong text-ink hover:border-ink`}
                        >
                          {a.label}
                          <span className="sr-only"> campaign {c.name}</span>
                        </button>
                      ))}
                    </div>
                  </form>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted">No campaigns waiting or running.</p>
        )}
      </section>
    </div>
  );
}
