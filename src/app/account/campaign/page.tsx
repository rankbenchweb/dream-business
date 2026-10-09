import { notFound } from "next/navigation";
import { Suspense } from "react";
import { changeCampaignStatus } from "@/app/account/campaigns/actions";
import { CampaignForm } from "@/components/account/Forms";
import { AccountsClosed, Loading } from "@/components/account/Shared";
import { PageHero, Section } from "@/components/ui";
import { getCampaign, getListingsForOrgs, getMyOrganizations } from "@/lib/accountData";
import { requireUser } from "@/lib/auth";
import { campaignStatusHelp, campaignStatusLabel, canManageCampaigns, placements, tiers } from "@/lib/campaigns";
import { pageMetadata } from "@/lib/seo";
import { accountsEnabled } from "@/lib/supabase/config";

export const metadata = pageMetadata({
  title: "Campaign",
  description: "View or edit a promotion campaign.",
  path: "/account/campaign",
  noindex: true,
});

type Search = Promise<{ id?: string }>;

export default function CampaignPage({ searchParams }: { searchParams: Search }) {
  return (
    <>
      <PageHero
        crumbs={[
          { name: "Your account", path: "/account" },
          { name: "Campaign", path: "/account" },
        ]}
        title="Your campaign"
        lead="Edit the details, submit it for review, or pause it while it runs."
        accent="brass"
      />
      <Section tone="white">
        <div className="max-w-[52rem]">
          {accountsEnabled ? (
            <Suspense fallback={<Loading />}>
              <Body searchParams={searchParams} />
            </Suspense>
          ) : (
            <AccountsClosed />
          )}
        </div>
      </Section>
    </>
  );
}

const secondaryBtn =
  "inline-flex min-h-11 items-center justify-center rounded-[var(--radius-sm)] border border-line-strong bg-surface px-4 text-sm font-semibold text-ink hover:border-ink";

async function Body({ searchParams }: { searchParams: Search }) {
  const { id = "" } = await searchParams;
  const user = await requireUser(`/account/campaign?id=${encodeURIComponent(id)}`);
  const c = await getCampaign(id);
  if (!c) notFound();
  const org = (await getMyOrganizations(user.id)).find((o) => o.id === c.organization_id);
  if (!org) notFound();
  const manage = canManageCampaigns(org.role);
  const listings = (await getListingsForOrgs([org.id])).filter((l) => l.status === "published");
  const editable = manage && !["ended", "submitted"].includes(c.status);

  const move = (name: string, label: string) => (
    <form action={changeCampaignStatus}>
      <input type="hidden" name="campaignId" value={c.id} />
      <button name="move" value={name} className={secondaryBtn}>
        {label}
      </button>
    </form>
  );

  return (
    <div>
      <div className="rounded-[var(--radius-md)] border border-line bg-paper p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl">{c.name}</h2>
          <span className="inline-flex items-center rounded-full bg-brass-soft px-2.5 py-0.5 text-xs font-semibold text-[#6b5120] ring-1 ring-brass/40">
            {campaignStatusLabel[c.status]}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted">
          {org.name} · {tiers.find((t) => t.value === c.tier)?.label} · {placements.find((p) => p.value === c.placement)?.label}
        </p>
        <p className="mt-1 text-sm text-slate">{campaignStatusHelp[c.status]}</p>
        {c.status === "rejected" && c.review_note ? (
          <div className="mt-4 rounded-[var(--radius-sm)] border border-danger/30 bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-danger">Note from our reviewers</p>
            <p className="mt-1 whitespace-pre-line text-sm text-slate">{c.review_note}</p>
          </div>
        ) : null}
        {manage ? (
          <div className="mt-5 flex flex-wrap gap-3">
            {c.status === "submitted" ? move("withdraw", "Withdraw from review") : null}
            {c.status === "live" ? move("pause", "Pause campaign") : null}
            {c.status === "draft" || c.status === "rejected" ? move("delete", "Delete draft") : null}
          </div>
        ) : null}
      </div>

      <div className="mt-10">
        {editable ? (
          <CampaignForm
            orgs={[]}
            listings={listings.map((l) => ({ id: l.id, name: l.name, organization_id: l.organization_id }))}
            defaults={{
              campaignId: c.id,
              organizationId: c.organization_id,
              name: c.name,
              tier: c.tier,
              placement: c.placement,
              listingId: c.listing_id,
              destinationUrl: c.destination_url,
              headline: c.headline,
              body: c.body,
              startsOn: c.starts_on,
              endsOn: c.ends_on,
              budgetNote: c.budget_note,
              status: c.status,
            }}
          />
        ) : (
          <>
            {!manage ? <p className="mb-5 text-sm text-muted">Your role can view this campaign but not change it.</p> : null}
            {manage && c.status === "submitted" ? <p className="mb-5 text-sm text-muted">Withdraw it from review to make changes.</p> : null}
            <dl className="grid gap-5 text-sm sm:grid-cols-2">
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
                <dd className="mt-1 break-all text-slate">{c.destination_url}</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Dates</dt>
                <dd className="mt-1 text-slate">
                  {c.starts_on ?? "Not set"} to {c.ends_on ?? "not set"}
                </dd>
              </div>
            </dl>
          </>
        )}
      </div>
    </div>
  );
}
