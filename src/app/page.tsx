import Link from "next/link";
import type { Metadata } from "next";
import { BusinessRoute } from "@/components/home/BusinessRoute";
import { Emblem } from "@/components/layout/Logo";
import { ToolFinder } from "@/components/tools/ToolFinder";
import { DisclosureLabel, disclosures, type DisclosureKind } from "@/components/Disclosure";
import { ButtonLink, Container, GridTexture, Section, SectionHeading, StatusBadge, TextLink, cx } from "@/components/ui";
import { divisionOrder, divisions } from "@/lib/divisions";
import { marketplaceCategories } from "@/lib/marketplace";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `${site.name} | ${site.identity}. ${site.tagline}` },
  description: site.description,
  alternates: { canonical: "/" },
};

const stages = [
  {
    title: "Start a business",
    who: "You have an idea, or several, and want to test it before committing money.",
    links: [
      { label: "Plan with the Business Builder", href: "/business-builder#start" },
      { label: "Estimate your startup costs", href: "/tools/startup-cost-planner" },
      { label: "Read the learning library", href: "/learn" },
    ],
  },
  {
    title: "Grow a business",
    who: "You are trading and want better margins, more customers and fewer manual tasks.",
    links: [
      { label: "Review your margins", href: "/tools/profit-margin-calculator" },
      { label: "Explore Business Growth", href: "/growth" },
      { label: "Find suppliers and services", href: "/marketplace" },
    ],
  },
  {
    title: "Scale an established company",
    who: "You run a brand, store, agency or manufacturer and are planning the next stage.",
    links: [
      { label: "Research markets and competitors", href: "/intelligence" },
      { label: "Improve profitability", href: "/growth#profitability" },
      { label: "Plan a new business line", href: "/business-builder#expand" },
    ],
  },
  {
    title: "Expand an enterprise",
    who: "You lead a larger organisation looking for markets, partners and business customers.",
    links: [
      { label: "Discuss an enterprise campaign", href: "/promote#enterprise" },
      { label: "Calculate landed import costs", href: "/tools/landed-cost-calculator" },
      { label: "Plan international expansion", href: "/growth#international" },
      { label: "Find distributors and partners", href: "/marketplace" },
    ],
  },
];

const tiers = [
  {
    name: "Independent businesses",
    who: "Sellers, creators, freelancers and small suppliers.",
    offer: "Free directory listings, and simple promotion of a product, store, course or service.",
  },
  {
    name: "Growing companies",
    who: "Established stores, software companies, agencies and logistics providers.",
    offer: "Featured placements in relevant categories and sponsored content beside the tools your customers use.",
  },
  {
    name: "Enterprise",
    who: "Brands and larger companies looking for business customers and partners.",
    offer: "Custom proposals: category sponsorship, sponsored research and multi-placement campaigns with reporting.",
    enterprise: true,
  },
];

const trust: { title: string; body: string; href: string; link: string }[] = [
  { title: "Data sources", body: "Figures carry their source and collection date. Estimates are labelled as estimates.", href: "/verification-standards", link: "Data standards" },
  { title: "Business verification", body: "A verified label means documented checks were completed. It is never sold.", href: "/verification-standards", link: "Verification standards" },
  { title: "Sponsored content", body: "Paid placements are reviewed before publication and always labelled as sponsored.", href: "/advertising-standards", link: "Advertising standards" },
  { title: "Affiliate relationships", body: "Commissions never decide rankings, comparisons or recommendations.", href: "/affiliate-disclosure", link: "Affiliate disclosure" },
  { title: "Editorial independence", body: "Guides and recommendations are written and maintained independently of advertisers.", href: "/editorial-policy", link: "Editorial policy" },
  { title: "Privacy", body: "Calculators run in your browser. We collect only what a form needs to answer you.", href: "/privacy", link: "Privacy policy" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section aria-labelledby="hero-heading" className="on-dark relative overflow-hidden bg-midnight text-fog">
        <GridTexture />
        <Container className="relative pb-16 pt-12 sm:pt-16 lg:pb-20 lg:pt-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:items-center lg:gap-16">
            <div>
              <Emblem id="tdb-hero-m" glow sparkle className="mb-6 size-20 lg:hidden" />
              <p className="text-sm font-medium text-gold-bright">{site.name}, the business builder</p>
              <h1 id="hero-heading" className="mt-5 text-[2.75rem] font-bold leading-[0.98] tracking-[-0.035em] text-white sm:text-5xl lg:text-[5.75rem]">
                <span className="block">Your vision.</span>
                <span className="block text-fog">Your business.</span>
                <span className="block text-mist">Your future.</span>
              </h1>
            </div>
            <div>
              <div className="relative mb-8 hidden lg:block">
                <span
                  aria-hidden
                  className="absolute left-[-3rem] top-1/2 size-72 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(226_176_72/0.22),transparent_65%)]"
                />
                <Emblem id="tdb-hero" glow sparkle className="relative size-44" />
              </div>
              <p className="text-lg text-fog">
                Discover opportunities, use practical business tools, connect with suppliers and services, and promote your brand. From your first venture
                to your next international expansion.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ButtonLink href="/business-builder" variant="onDark">
                  Build your business
                </ButtonLink>
                <ButtonLink href="/tools" variant="onDarkSecondary">
                  Explore business tools
                </ButtonLink>
              </div>
              <p className="mt-5 text-sm text-mist">
                A company that serves businesses? <TextLink href="/promote">Promote your business</TextLink>
              </p>
            </div>
          </div>

          <div className="mt-16 border-t border-harbour pt-10 lg:mt-20" role="region" aria-labelledby="route-heading">
            <BusinessRoute />
          </div>
        </Container>
      </section>

      {/* Ecosystem */}
      <Section labelledBy="ecosystem-heading">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-36 lg:self-start">
            <SectionHeading
              id="ecosystem-heading"
              title="Six divisions, one business ecosystem"
              lead="Each division handles one part of building a business. Together they cover the journey from an idea to an international company."
            />
            <p className="mt-6 text-sm text-muted">
              Every capability shows its real status. Live means it works today.
            </p>
          </div>
          <ol className="divide-y divide-line border-y border-line">
            {divisionOrder.map((key, i) => {
              const d = divisions[key];
              return (
                <li key={key} className="grid gap-5 py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-10">
                  <div>
                    <p className="text-xs tabular-nums text-muted">Division {i + 1} of 6</p>
                    <h3 className="mt-1 text-xl">
                      <Link href={d.href} className="hover:text-gold-strong">
                        {d.name}
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm text-slate">{d.purpose}</p>
                    <TextLink href={d.href} className="mt-4 inline-block text-sm">
                      Open {d.name}
                    </TextLink>
                  </div>
                  <ul className="space-y-3 self-center">
                    {d.capabilities.slice(0, 3).map((c) => (
                      <li key={c.name} className="flex items-start justify-between gap-4 text-sm">
                        <span className={c.status === "live" ? "font-medium text-ink" : "text-slate"}>{c.name}</span>
                        <StatusBadge status={c.status} />
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        </div>
      </Section>

      {/* Tools */}
      <Section tone="white" labelledBy="tools-heading">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="tools-heading"
            title="Find tools for your business"
            lead="Calculators that show their working and use your selected market's currency. Planned tools are listed with their status, so you know what exists today."
          />
          <ButtonLink href="/tools" variant="secondary" className="self-start lg:self-auto">
            View all business tools
          </ButtonLink>
        </div>
        <div className="mt-10">
          <ToolFinder limit={6} />
        </div>
      </Section>

      {/* Stages */}
      <Section labelledBy="stages-heading">
        <SectionHeading
          id="stages-heading"
          title="Built for every stage of business"
          lead="The same platform serves a first-time founder and an enterprise team. Choose where you are, and start from there."
        />
        <ol className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-md)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {stages.map((s, i) => (
            <li key={s.title} className="flex flex-col bg-surface p-6">
              {/* Stepped bar: rises with each stage */}
              <div aria-hidden className="flex h-12 items-end">
                <span
                  className={cx("block w-10 rounded-t-[2px]", i === 3 ? "bg-brass" : "bg-gold")}
                  style={{ height: `${25 + i * 25}%`, opacity: 0.45 + i * 0.18 }}
                />
              </div>
              <h3 className="mt-5 text-lg">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.who}</p>
              <ul className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm">
                {s.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-gold">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Section>

      {/* Connect */}
      <Section tone="white" labelledBy="connect-heading">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-16">
          <div>
            <SectionHeading
              id="connect-heading"
              title="Connect with the companies that help businesses run"
              lead="The Marketplace brings suppliers, software, logistics and professional services into one directory, with paid placement and verification kept strictly apart."
            />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/promote?type=directory#inquiry">List your business free</ButtonLink>
              <ButtonLink href="/marketplace" variant="secondary">
                Explore the Marketplace
              </ButtonLink>
            </div>
            <p className="mt-6 text-sm text-muted">
              The directory opens category by category as submissions are reviewed. We will not pad it with businesses that have not asked to be listed.
            </p>
          </div>
          <ul className="grid gap-x-10 sm:grid-cols-2">
            {marketplaceCategories.map((c) => (
              <li key={c.name} className="border-t border-line py-4">
                <h3 className="text-base font-semibold">{c.name}</h3>
                <p className="mt-1 text-sm text-muted">{c.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Promote */}
      <section aria-labelledby="promote-heading" className="on-dark relative overflow-hidden bg-midnight py-20 text-fog lg:py-28 [&_h3]:text-white">
        <Container className="relative">
          <div className="max-w-[48rem]">
            <h2 id="promote-heading" className="text-3xl text-white sm:text-4xl">
              Put your business in front of the right audience.
            </h2>
            <p className="mt-5 max-w-[40rem] text-lg text-mist">
              Founders and business owners come here when they need a supplier, a tool or a service. Companies that provide those things can reach them,
              with every placement reviewed and clearly labelled.
            </p>
          </div>
          <ul className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius-md)] border border-harbour-line bg-harbour-line md:grid-cols-3">
            {tiers.map((t) => (
              <li key={t.name} className={cx("flex flex-col p-7", t.enterprise ? "bg-[#14243a]" : "bg-midnight")}>
                <h3 className={cx("text-lg", t.enterprise && "!text-brass-bright")}>{t.name}</h3>
                <p className="mt-2 text-sm text-mist">{t.who}</p>
                <p className="mt-5 text-sm text-fog">{t.offer}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="/promote#inquiry" variant="onDark">
              Start a promotion inquiry
            </ButtonLink>
            <ButtonLink href="/promote" variant="onDarkSecondary">
              See promotion options
            </ButtonLink>
            <p className="text-sm text-mist sm:ml-4 sm:max-w-[22rem]">
              We quote each campaign individually and only describe reach we can measure.
            </p>
          </div>
        </Container>
      </section>

      {/* Trust */}
      <Section labelledBy="trust-heading">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,24rem)_1fr] lg:gap-16">
          <div>
            <SectionHeading
              id="trust-heading"
              title="Clear about what is paid, verified or estimated"
              lead="Trust is part of the product. These labels appear wherever a listing, recommendation or figure is shown, and each one means exactly one thing."
            />
            <dl className="mt-8 space-y-4">
              {(Object.keys(disclosures) as DisclosureKind[]).map((k) => (
                <div key={k} className="grid grid-cols-[7.5rem_1fr] items-start gap-4">
                  <dt>
                    <DisclosureLabel kind={k} />
                  </dt>
                  <dd className="text-sm text-muted">{disclosures[k].meaning}</dd>
                </div>
              ))}
            </dl>
          </div>
          <ul className="grid gap-px self-start overflow-hidden rounded-[var(--radius-md)] border border-line bg-line sm:grid-cols-2">
            {trust.map((t) => (
              <li key={t.title} className="bg-surface p-6">
                <h3 className="text-base font-semibold">{t.title}</h3>
                <p className="mt-2 text-sm text-muted">{t.body}</p>
                <TextLink href={t.href} className="mt-4 inline-block text-sm">
                  {t.link}
                </TextLink>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </>
  );
}
