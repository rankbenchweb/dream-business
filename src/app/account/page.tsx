import Link from "next/link";
import { Suspense } from "react";
import { AccountsClosed, ListingStatusBadge, Loading, Notice } from "@/components/account/Shared";
import { ButtonLink, PageHero, Section, TextLink } from "@/components/ui";
import { getCategories, getListingsForOrgs, getMyOrganizations } from "@/lib/accountData";
import { isStaffEmail, requireUser } from "@/lib/auth";
import { canEditListings, listingStatusHelp, roleLabel } from "@/lib/listings";
import { pageMetadata } from "@/lib/seo";
import { accountsEnabled } from "@/lib/supabase/config";

export const metadata = pageMetadata({
  title: "Your account",
  description: "Your business profiles and directory listings.",
  path: "/account",
  noindex: true,
});

type Search = Promise<{ notice?: string }>;

export default function AccountPage({ searchParams }: { searchParams: Search }) {
  return (
    <>
      <PageHero crumbs={[{ name: "Your account", path: "/account" }]} title="Your account" lead="Your business profiles and directory listings, in one place." />
      <Section tone="white">
        {accountsEnabled ? (
          <Suspense fallback={<Loading />}>
            <AccountBody searchParams={searchParams} />
          </Suspense>
        ) : (
          <AccountsClosed />
        )}
      </Section>
    </>
  );
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

async function AccountBody({ searchParams }: { searchParams: Search }) {
  const user = await requireUser("/account");
  const { notice } = await searchParams;
  const orgs = await getMyOrganizations(user.id);
  const [listings, categories] = await Promise.all([getListingsForOrgs(orgs.map((o) => o.id)), getCategories()]);
  const catName = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <div>
      <Notice code={notice} />
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate">
          Signed in as <strong className="text-ink">{user.email}</strong>
        </p>
        <div className="flex flex-wrap items-center gap-4">
          {isStaffEmail(user.email) ? <TextLink href="/staff/review">Review queue</TextLink> : null}
          <form action="/auth/sign-out" method="post">
            <button type="submit" className="text-sm font-semibold text-slate underline underline-offset-4 hover:text-ink">
              Sign out
            </button>
          </form>
        </div>
      </div>

      {!orgs.length ? (
        <div className="mt-10 max-w-[40rem]">
          <h2 className="text-2xl">Start with your business profile</h2>
          <p className="mt-3 text-slate">
            A business profile holds your company&apos;s details. Once it exists you can add directory listings for it, and later invite your team.
          </p>
          <ButtonLink href="/account/organizations/new" className="mt-6">
            Create business profile
          </ButtonLink>
        </div>
      ) : (
        <div className="mt-10 space-y-12">
          {orgs.map((org) => {
            const own = listings.filter((l) => l.organization_id === org.id);
            const canEdit = canEditListings(org.role);
            return (
              <section key={org.id} aria-labelledby={`org-${org.id}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 id={`org-${org.id}`} className="text-2xl">
                      {org.name}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      Your role: {roleLabel[org.role]}
                      {org.website ? (
                        <>
                          {" · "}
                          {org.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        </>
                      ) : null}
                    </p>
                  </div>
                  {canEdit ? (
                    <ButtonLink href={`/account/listings/new?org=${org.id}`} variant="secondary">
                      Add a listing
                    </ButtonLink>
                  ) : null}
                </div>
                {own.length ? (
                  <ul className="mt-5 divide-y divide-line rounded-[var(--radius-md)] border border-line">
                    {own.map((l) => (
                      <li key={l.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link href={`/account/listing?id=${l.id}`} className="font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                              {l.name}
                            </Link>
                            <ListingStatusBadge status={l.status} />
                          </div>
                          <p className="mt-1 text-sm text-muted">
                            {catName.get(l.category_id)} · Updated {dateFmt.format(new Date(l.updated_at))}
                          </p>
                          <p className="mt-1 text-xs text-muted">{listingStatusHelp[l.status]}</p>
                        </div>
                        <Link href={`/account/listing?id=${l.id}`} className="shrink-0 text-sm font-semibold text-gold-strong underline underline-offset-4">
                          {canEdit ? "Open and edit" : "View"}
                          <span className="sr-only"> {l.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-5 rounded-[var(--radius-md)] border border-dashed border-line-strong p-6 text-sm text-muted">
                    No listings yet.{canEdit ? " Add one to appear in the business directory once it's reviewed." : ""}
                  </p>
                )}
              </section>
            );
          })}
          <p className="text-sm text-muted">
            Need another business profile? <TextLink href="/account/organizations/new">Create one</TextLink>.
          </p>
        </div>
      )}
    </div>
  );
}
