import { Suspense } from "react";
import { ListingForm } from "@/components/account/Forms";
import { AccountsClosed, Loading } from "@/components/account/Shared";
import { ButtonLink, PageHero, Section, TextLink } from "@/components/ui";
import { getCategories, getMyOrganizations } from "@/lib/accountData";
import { requireUser } from "@/lib/auth";
import { canEditListings } from "@/lib/listings";
import { pageMetadata } from "@/lib/seo";
import { accountsEnabled } from "@/lib/supabase/config";

export const metadata = pageMetadata({
  title: "Add a directory listing",
  description: "Submit a directory listing for review.",
  path: "/account/listings/new",
  noindex: true,
});

type Search = Promise<{ org?: string }>;

export default function NewListingPage({ searchParams }: { searchParams: Search }) {
  return (
    <>
      <PageHero
        crumbs={[
          { name: "Your account", path: "/account" },
          { name: "New listing", path: "/account/listings/new" },
        ]}
        title="Add a directory listing"
        lead="Basic listings are free. Every listing is reviewed before it appears, and paid placement never affects review."
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

async function Body({ searchParams }: { searchParams: Search }) {
  const user = await requireUser("/account/listings/new");
  const { org } = await searchParams;
  const [orgs, categories] = await Promise.all([getMyOrganizations(user.id), getCategories()]);
  const editable = orgs.filter((o) => canEditListings(o.role));
  if (!editable.length) {
    return (
      <div>
        <p className="text-slate">
          {orgs.length
            ? "Your role doesn't allow creating listings. Ask an owner or admin of your business to change your role."
            : "Create a business profile first. Listings belong to a business."}
        </p>
        {!orgs.length ? (
          <ButtonLink href="/account/organizations/new" className="mt-6">
            Create business profile
          </ButtonLink>
        ) : null}
      </div>
    );
  }
  return (
    <>
      <p className="mb-8 text-sm text-muted">
        Listings must describe a real business that you represent. Read the <TextLink href="/verification-standards">listing and verification standards</TextLink>.
      </p>
      <ListingForm orgs={editable.map((o) => ({ id: o.id, name: o.name }))} categories={categories} defaults={{ organizationId: editable.some((o) => o.id === org) ? org : editable[0].id }} />
    </>
  );
}
