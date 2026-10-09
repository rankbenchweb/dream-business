import { DivisionPage } from "@/components/DivisionPage";
import { DisclosureLabel } from "@/components/Disclosure";
import { ButtonLink, Section, SectionHeading, TextLink } from "@/components/ui";
import { divisions } from "@/lib/divisions";
import { pageMetadata } from "@/lib/seo";

const d = divisions.intelligence;
export const metadata = pageMetadata({
  title: "Business Intelligence: market, product and competitor research",
  description:
    "Research markets, products, competitors and suppliers with every figure sourced and dated, and estimates clearly labelled. The Dream Business intelligence standards and roadmap.",
  path: d.href,
});

const fields = [
  { field: "Value and unit", rule: "The figure itself, with its unit and currency stated." },
  { field: "Source", rule: "The organisation or dataset it came from, linked where public." },
  { field: "Collected on", rule: "The date we retrieved it, so you can judge freshness." },
  { field: "Coverage", rule: "The country, period and population the figure describes." },
  { field: "Type", rule: "Verified fact, estimate, or AI-assisted assessment. Never blurred." },
];

const commitments = [
  "No figure without a source and a collection date.",
  "No data presented as live unless it is refreshed automatically, with the refresh time shown.",
  "No scraping of services against their terms, and no bypassing of technical restrictions.",
  "AI-generated assessments are labelled, and the inputs behind them are shown.",
  "Country-specific facts say which country they apply to, and when they were last checked.",
];

export default function IntelligencePage() {
  return (
    <DivisionPage
      division="intelligence"
      capabilityTitle="Research capabilities"
      actions={
        <>
          <ButtonLink href="#standards" variant="onDark">
            Read the data standards
          </ButtonLink>
          <ButtonLink href="/tools" variant="onDarkSecondary">
            Use the live tools
          </ButtonLink>
        </>
      }
    >
      <Section tone="white" id="standards" labelledBy="standards-heading">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <SectionHeading
              id="standards-heading"
              title="How every figure will be labelled"
              lead="Research is only useful if you can tell where it came from and how current it is. Each data point published in Intelligence carries five pieces of context."
            />
            <dl className="mt-8 divide-y divide-line border-y border-line">
              {fields.map((f) => (
                <div key={f.field} className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
                  <dt className="text-sm font-semibold text-ink">{f.field}</dt>
                  <dd className="text-sm text-muted">{f.rule}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-[var(--radius-md)] border border-line bg-paper p-7 sm:p-9">
            <h3 className="text-lg">Our research commitments</h3>
            <ul className="mt-5 space-y-4">
              {commitments.map((c) => (
                <li key={c} className="flex gap-3 text-sm text-slate">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-signal" />
                  {c}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-2 border-t border-line pt-6">
              <DisclosureLabel kind="verified" />
              <DisclosureLabel kind="estimate" />
            </div>
            <p className="mt-3 text-sm text-muted">
              These are the only two states a figure can be in. Read the full <TextLink href="/verification-standards">data and verification standards</TextLink>.
            </p>
          </div>
        </div>
      </Section>
    </DivisionPage>
  );
}
