import { notFound } from "next/navigation";
import { Suspense } from "react";
import { changeListingStatus } from "@/app/account/actions";
import { ListingForm } from "@/components/account/Forms";
import { AccountsClosed, ListingStatusBadge, Loading } from "@/components/account/Shared";
import { PageHero, Section } from "@/components/ui";
import { getCategories, getListing, getMyOrganizations } from "@/lib/accountData";
import { requireUser } from "@/lib/auth";
import { canEditListings, listingStatusHelp } from "@/lib/listings";
import { pageMetadata } from "@/lib/seo";
import { accountsEnabled } from "@/lib/supabase/config";

export const metadata = pageMetadata({
  title: "Edit listing",
  description: "Edit a directory listing.",
  path: "/account/listing",
  noindex: true,
});

type Search = Promise<{ id?: string }>;

export default function EditListingPage({ searchParams }: { searchParams: Search }) {
  return (
    <>
      <PageHero
        crumbs={[
          { name: "Your account", path: "/account" },
          { name: "Listing", path: "/account" },
        ]}
        title="Your listing"
        lead="Edit the details, submit it for review, or take it out of the directory."
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
  const user = await requireUser(`/account/listing?id=${encodeURIComponent(id)}`);
  const listing = await getListing(id);
  if (!listing) notFound();
  const [orgs, categories] = await Promise.all([getMyOrganizations(user.id), getCategories()]);
  const org = orgs.find((o) => o.id === listing.organization_id);
  // Published listings are public, but this page is only for the business's own team.
  if (!org) notFound();
  const canEdit = canEditListings(org.role);

  return (
    <div>
      <div className="rounded-[var(--radius-md)] border border-line bg-paper p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl">{listing.name}</h2>
          <ListingStatusBadge status={listing.status} />
          {listing.verification === "verified" ? <span className="text-xs font-semibold text-success">Verified</span> : null}
        </div>
        <p className="mt-2 text-sm text-muted">
          {org.name} · {listingStatusHelp[listing.status]}
        </p>
        {listing.status === "rejected" && listing.moderation_note ? (
          <div className="mt-4 rounded-[var(--radius-sm)] border border-danger/30 bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-danger">Note from our reviewers</p>
            <p className="mt-1 whitespace-pre-line text-sm text-slate">{listing.moderation_note}</p>
          </div>
        ) : null}
        {canEdit ? (
          <div className="mt-5 flex flex-wrap gap-3">
            {listing.status === "submitted" ? (
              <form action={changeListingStatus}>
                <input type="hidden" name="listingId" value={listing.id} />
                <button name="move" value="withdraw" className={secondaryBtn}>
                  Withdraw from review
                </button>
              </form>
            ) : null}
            {listing.status === "archived" ? (
              <form action={changeListingStatus}>
                <input type="hidden" name="listingId" value={listing.id} />
                <button name="move" value="restore" className={secondaryBtn}>
                  Restore as draft
                </button>
              </form>
            ) : (
              <form action={changeListingStatus}>
                <input type="hidden" name="listingId" value={listing.id} />
                <button name="move" value="archive" className={secondaryBtn}>
                  Archive listing
                </button>
              </form>
            )}
          </div>
        ) : null}
      </div>

      <div className="mt-10">
        {canEdit && listing.status !== "archived" ? (
          <ListingForm
            orgs={[]}
            categories={categories}
            defaults={{
              listingId: listing.id,
              categoryId: listing.category_id,
              name: listing.name,
              summary: listing.summary,
              description: listing.description,
              website: listing.website,
              headquarters: listing.headquarters,
              serves_markets: listing.serves_markets,
              status: listing.status,
            }}
          />
        ) : (
          <>
          {!canEdit ? <p className="mb-5 text-sm text-muted">Your role can view this listing but not change it.</p> : null}
          <dl className="grid gap-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-ink">Summary</dt>
              <dd className="mt-1 text-slate">{listing.summary}</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">Website</dt>
              <dd className="mt-1 text-slate">{listing.website}</dd>
            </div>
          </dl>
          </>
        )}
      </div>
    </div>
  );
}
