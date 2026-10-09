import { Suspense } from "react";
import { CampaignForm } from "@/components/account/Forms";
import { AccountsClosed, Loading } from "@/components/account/Shared";
import { ButtonLink, PageHero, Section, TextLink } from "@/components/ui";
import { getListingsForOrgs, getMyOrganizations } from "@/lib/accountData";
import { requireUser } from "@/lib/auth";
import { canManageCampaigns } from "@/lib/campaigns";
import { pageMetadata } from "@/lib/seo";
import { accountsEnabled } from "@/lib/supabase/config";

export const metadata = pageMetadata({
  title: "New campaign",
  description: "Submit a promotion campaign for review.",
  path: "/account/campaigns/new",
  noindex: true,
});

type Search = Promise<{ org?: string }>;

export default function NewCampaignPage({ searchParams }: { searchParams: Search }) {
  return (
    <>
      <PageHero
        crumbs={[
          { name: "Your account", path: "/account" },
          { name: "New campaign", path: "/account/campaigns/new" },
        ]}
        title="Promote your business"
        lead="Tell us what you'd like to promote. Every campaign is reviewed against our advertising standards, and nothing runs until we've agreed dates and price with you."
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

async function Body({ searchParams }: { searchParams: Search }) {
  const user = await requireUser("/account/campaigns/new");
  const { org } = await searchParams;
  const orgs = (await getMyOrganizations(user.id)).filter((o) => canManageCampaigns(o.role));
  if (!orgs.length) {
    return (
      <div>
        <p className="text-slate">You need a business profile where you&apos;re an owner, admin or campaign manager to create campaigns.</p>
        <ButtonLink href="/account" className="mt-6">
          Go to your account
        </ButtonLink>
      </div>
    );
  }
  const listings = (await getListingsForOrgs(orgs.map((o) => o.id))).filter((l) => l.status === "published");
  return (
    <>
      <p className="mb-8 text-sm text-muted">
        Paid placements are always labelled Sponsored and never affect reviews, rankings or verification. Read the{" "}
        <TextLink href="/advertising-standards">advertising standards</TextLink>.
      </p>
      <CampaignForm
        orgs={orgs.map((o) => ({ id: o.id, name: o.name }))}
        listings={listings.map((l) => ({ id: l.id, name: l.name, organization_id: l.organization_id }))}
        defaults={{ organizationId: orgs.some((o) => o.id === org) ? org : orgs[0].id }}
      />
    </>
  );
}
