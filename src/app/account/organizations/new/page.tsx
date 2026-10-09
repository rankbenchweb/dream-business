import { Suspense } from "react";
import { OrgForm } from "@/components/account/Forms";
import { AccountsClosed, Loading } from "@/components/account/Shared";
import { PageHero, Section } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { pageMetadata } from "@/lib/seo";
import { accountsEnabled } from "@/lib/supabase/config";

export const metadata = pageMetadata({
  title: "Create a business profile",
  description: "Create a business profile to manage directory listings.",
  path: "/account/organizations/new",
  noindex: true,
});

export default function NewOrganizationPage() {
  return (
    <>
      <PageHero
        crumbs={[
          { name: "Your account", path: "/account" },
          { name: "New business profile", path: "/account/organizations/new" },
        ]}
        title="Create a business profile"
        lead="The company behind your listings. Only you and the team members you add can see or change it."
      />
      <Section tone="white">
        <div className="max-w-[36rem]">
          {accountsEnabled ? (
            <Suspense fallback={<Loading />}>
              <Body />
            </Suspense>
          ) : (
            <AccountsClosed />
          )}
        </div>
      </Section>
    </>
  );
}

async function Body() {
  await requireUser("/account/organizations/new");
  return <OrgForm />;
}
