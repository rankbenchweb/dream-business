import { DivisionPage } from "@/components/DivisionPage";
import { DisclosureLabel, disclosures } from "@/components/Disclosure";
import { ButtonLink, Section, SectionHeading, TextLink } from "@/components/ui";
import { divisions } from "@/lib/divisions";
import { marketplaceCategories } from "@/lib/marketplace";
import { pageMetadata } from "@/lib/seo";

const d = divisions.marketplace;
export const metadata = pageMetadata({
  title: "Business Marketplace: suppliers, software and services",
  description:
    "A directory of manufacturers, suppliers, software, logistics, agencies and professional services. Free basic listings, with paid placement and verification kept separate.",
  path: d.href,
});

const listingSteps = [
  { title: "Submit your business", body: "Send a free listing request with what you offer and the markets you serve." },
  { title: "We review it", body: "We check the submission is complete, real and within our listing standards." },
  { title: "Your listing goes live", body: "Basic listings are free and appear in the relevant categories." },
  { title: "Optional extras, clearly labelled", body: "Featured placement can be bought later. Verification is a separate check and is never sold." },
];

export default function MarketplacePage() {
  return (
    <DivisionPage
      division="marketplace"
      actions={
        <>
          <ButtonLink href="/promote?type=directory#inquiry" variant="onDark">
            List your business free
          </ButtonLink>
          <ButtonLink href="#categories" variant="onDarkSecondary">
            See directory categories
          </ButtonLink>
        </>
      }
    >
      <Section tone="white" id="categories" labelledBy="categories-heading">
        <SectionHeading
          id="categories-heading"
          title="Directory categories"
          lead="These are the categories the directory is opening with. Each fills as businesses submit listings and pass review; we won't list companies that haven't asked to be listed."
        />
        <ul className="mt-10 grid gap-px overflow-hidden rounded-[var(--radius-md)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
          {marketplaceCategories.map((c) => (
            <li key={c.name} className="flex flex-col bg-surface p-5">
              <h3 className="text-base font-semibold">{c.name}</h3>
              <p className="mt-1 flex-1 text-sm text-muted">{c.detail}</p>
              <p className="mt-4 text-xs text-muted">Accepting listings</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section labelledBy="listing-heading">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-16">
          <div>
            <SectionHeading id="listing-heading" title="How listing works" />
            <ol className="mt-8 space-y-6">
              {listingSteps.map((s, i) => (
                <li key={s.title} className="grid grid-cols-[2.5rem_1fr] gap-4">
                  <span className="flex size-10 items-center justify-center rounded-full border border-line-strong font-display text-sm font-semibold tabular-nums text-ink">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold">{s.title}</h3>
                    <p className="mt-1 text-sm text-muted">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <ButtonLink href="/promote?type=directory#inquiry" className="mt-10">
              Submit a free listing request
            </ButtonLink>
          </div>
          <aside className="self-start rounded-[var(--radius-md)] border border-line bg-surface p-7">
            <h3 className="text-lg">Three labels, never mixed</h3>
            <dl className="mt-5 space-y-5">
              {(["verified", "sponsored", "editorial"] as const).map((k) => (
                <div key={k}>
                  <dt>
                    <DisclosureLabel kind={k} />
                  </dt>
                  <dd className="mt-2 text-sm text-muted">{disclosures[k].meaning}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 border-t border-line pt-5 text-sm text-muted">
              A listing can carry more than one label, but buying one never grants another. Read the <TextLink href="/verification-standards">verification standards</TextLink>.
            </p>
          </aside>
        </div>
      </Section>
    </DivisionPage>
  );
}
