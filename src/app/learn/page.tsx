import { ButtonLink, PageHero, Section, SectionHeading, StatusBadge, TextLink } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";
import type { Status } from "@/lib/tools";

export const metadata = pageMetadata({
  title: "Learn: business guides and explainers",
  description:
    "Practical, sourced guides on starting, running and growing a business, from pricing and margins to sourcing, payments and international selling.",
  path: "/learn",
});

const topics: { title: string; body: string; status: Status; href?: string; link?: string }[] = [
  { title: "Pricing and margins", body: "Margin versus markup, pricing for a target margin, and break-even.", status: "live", href: "/tools/profit-margin-calculator", link: "Start with the margin guide" },
  { title: "Planning a new business", body: "Choosing a business model, then estimating launch costs and runway.", status: "live", href: "/tools/startup-cost-planner", link: "Read the startup costs guide" },
  { title: "Importing and landed cost", body: "Freight, customs duty, CIF and FOB, and import tax on goods you buy abroad.", status: "live", href: "/tools/landed-cost-calculator", link: "Read the landed cost guide" },
  { title: "Sourcing and suppliers", body: "Finding manufacturers and evaluating suppliers before you order.", status: "planned" },
  { title: "Payments by country", body: "Which payment options are realistic in your country and how payouts work.", status: "planned" },
  { title: "Selling internationally", body: "Shipping, customs, marketplaces and tax when you sell across borders.", status: "planned" },
  { title: "Marketing economics", body: "ROAS, cost per sale and when advertising pays.", status: "live", href: "/tools/advertising-profitability-calculator", link: "Read the advertising guide" },
];

export default function LearnPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Learn", path: "/learn" }]}
        title="Learn"
        lead="Practical guides for building and running a business, written from primary sources, dated, and kept up to date. Each guide links to the tool that puts it into practice."
      >
        <ButtonLink href="/tools" variant="onDark">
          Use the business tools
        </ButtonLink>
        <ButtonLink href="/editorial-policy" variant="onDarkSecondary">
          How we write guides
        </ButtonLink>
      </PageHero>

      <Section labelledBy="topics-heading">
        <SectionHeading
          id="topics-heading"
          title="Topics in the library"
          lead="We are publishing the library topic by topic rather than all at once, so each guide is accurate before it goes live. The first guides sit alongside the live calculators."
        />
        <ul className="mt-10 grid gap-px overflow-hidden rounded-[var(--radius-md)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((t) => (
            <li key={t.title} className="flex flex-col bg-surface p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg">{t.title}</h3>
                <StatusBadge status={t.status} />
              </div>
              <p className="mt-2 flex-1 text-sm text-muted">{t.body}</p>
              {t.href ? (
                <TextLink href={t.href} className="mt-5 inline-block text-sm">
                  {t.link}
                </TextLink>
              ) : null}
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
