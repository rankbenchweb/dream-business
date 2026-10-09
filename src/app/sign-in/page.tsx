import { Suspense } from "react";
import { SignInForm } from "@/components/account/Forms";
import { AccountsClosed, Loading } from "@/components/account/Shared";
import { ButtonLink, PageHero, Section, TextLink } from "@/components/ui";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { pageMetadata } from "@/lib/seo";
import { accountsEnabled } from "@/lib/supabase/config";

export const metadata = pageMetadata({
  title: "Sign in",
  description: "Sign in to manage your business profile and directory listings on The Dream Business.",
  path: "/sign-in",
  noindex: true,
});

type Search = Promise<{ next?: string; error?: string }>;

export default function SignInPage({ searchParams }: { searchParams: Search }) {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Sign in", path: "/sign-in" }]}
        title="Sign in or create an account"
        lead="Manage your business profile and directory listings. No password needed: we email you a secure sign-in link."
      />
      <Section tone="white">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] lg:gap-20">
          <div>
            {accountsEnabled ? (
              <Suspense fallback={<Loading>Loading…</Loading>}>
                <SignInBody searchParams={searchParams} />
              </Suspense>
            ) : (
              <AccountsClosed />
            )}
          </div>
          <div className="max-w-[36rem] text-sm text-muted">
            <h2 className="text-lg text-ink">What an account is for</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>Create a profile for your business and invite your team later.</li>
              <li>Submit directory listings. Basic listings are free, and every one is reviewed before it goes live.</li>
              <li>Edit, withdraw or archive your listings at any time.</li>
            </ul>
            <p className="mt-6">
              We only use your email to sign you in and to tell you about your listings. Read the{" "}
              <TextLink href="/privacy">privacy policy</TextLink>.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}

async function SignInBody({ searchParams }: { searchParams: Search }) {
  const { next: rawNext, error } = await searchParams;
  const next = safeNext(rawNext);
  const user = await getCurrentUser();
  if (user) {
    return (
      <div className="rounded-[var(--radius-md)] border border-line bg-paper p-7">
        <h2 className="text-xl">You&apos;re signed in</h2>
        <p className="mt-2 text-slate">
          Signed in as <strong className="text-ink">{user.email}</strong>.
        </p>
        <ButtonLink href={next} className="mt-5">
          Continue
        </ButtonLink>
      </div>
    );
  }
  return <SignInForm next={next} linkError={error === "link"} />;
}
