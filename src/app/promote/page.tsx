import { DisclosureLabel } from "@/components/Disclosure";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { InquiryTypeLink } from "@/components/forms/InquiryTypeLink";
import { ButtonLink, Container, PageHero, Section, SectionHeading, StatusBadge, TextLink, cx } from "@/components/ui";
import { promotableTypes } from "@/lib/marketplace";
import { pageMetadata } from "@/lib/seo";
import type { Status } from "@/lib/tools";

export const metadata = pageMetadata({
  title: "Promote your business to founders and business owners",
  description:
    "Advertise products, software, services, courses and stores to people building and growing businesses. Self-service, growth and enterprise promotion, every placement reviewed and labelled.",
  path: "/promote",
});

type Level = {
  id: string;
  type: string;
  name: string;
  who: string;
  formats: { name: string; status: Status }[];
  now: string;
  cta: string;
  enterprise?: boolean;
};

const levels: Level[] = [
  {
    id: "self-service",
    type: "self-service",
    name: "Self-service promotion",
    who: "Independent business owners, startups, small suppliers and creators.",
    formats: [
      { name: "Free basic directory listing", status: "live" },
      { name: "Promoted product, store, course or service", status: "live" },
      { name: "Advertiser dashboard with renewals", status: "planned" },
    ],
    now: "Send an inquiry and we'll reply with placement options for your offer.",
    cta: "Ask about self-service promotion",
  },
  {
    id: "growth-advertising",
    type: "growth",
    name: "Growth advertising",
    who: "Established ecommerce businesses, software companies, agencies and logistics providers.",
    formats: [
      { name: "Featured category placement", status: "live" },
      { name: "Sponsored article", status: "live" },
      { name: "Sponsored offer beside relevant tools", status: "planned" },
      { name: "Campaign analytics", status: "planned" },
    ],
    now: "Placements are arranged by inquiry and reviewed by hand before they run.",
    cta: "Ask about growth advertising",
  },
  {
    id: "enterprise",
    type: "enterprise",
    name: "Enterprise campaigns",
    who: "Larger companies seeking business customers, distributors and partners.",
    formats: [
      { name: "Custom campaign proposal", status: "live" },
      { name: "Category sponsorship", status: "planned" },
      { name: "Sponsored industry research", status: "planned" },
      { name: "Multi-placement campaigns with reporting", status: "planned" },
    ],
    now: "We'll scope a proposal around your objective and tell you plainly what the platform can deliver today.",
    cta: "Request an enterprise proposal",
    enterprise: true,
  },
];

const steps = [
  { title: "Send an inquiry", body: "Tell us what you offer, who it is for and your rough budget." },
  { title: "Receive a proposal", body: "We reply with suitable placements, timing and a quoted price." },
  { title: "Review against our standards", body: "Your offer, claims and landing page are checked before anything is agreed." },
  { title: "Agree terms", body: "Placement, dates, price and payment are confirmed in writing before publication." },
  { title: "Go live, labelled", body: "Your promotion runs where you agreed, marked as sponsored." },
  { title: "Report and renew", body: "We share the measurements available for your placement, then you decide whether to continue." },
];

const faqs = [
  {
    q: "How much does promotion cost?",
    a: "Each campaign is quoted individually while we validate standard packages with real advertisers. Basic directory listings are free. You will always see a written price before anything is published.",
  },
  {
    q: "How large is your audience?",
    a: "The Dream Business is a new platform. Before you commit we will share the measured traffic for the placements you are considering, not projections. We don't promise reach, clicks or sales we can't show.",
  },
  {
    q: "Can I pay to be shown as verified or recommended?",
    a: "No. Verification is a separate set of checks and editorial recommendations are made independently. Paid placements are always labelled sponsored.",
  },
  {
    q: "What won't you promote?",
    a: "Misleading income claims, unlicensed financial products, counterfeit goods, fabricated reviews and anything unlawful in the target market, among others. See the advertising standards for the full list.",
  },
  {
    q: "Can individuals and small businesses advertise?",
    a: "Yes. Self-service promotion is designed for individual sellers, freelancers, creators and small suppliers as much as for larger companies.",
  },
];

export default function PromotePage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Business Promotion", path: "/promote" }]}
        title="Put your business in front of the right audience."
        lead="People come to The Dream Business when they need a supplier, a tool, a service or the skills to grow. If your company provides those things, you can reach them here, with every placement reviewed and clearly labelled."
      >
        <ButtonLink href="#inquiry" variant="onDark">
          Start a promotion inquiry
        </ButtonLink>
        <ButtonLink href="#enterprise" variant="onDarkSecondary">
          Enterprise campaigns
        </ButtonLink>
      </PageHero>

      {/* What you can promote */}
      <Section tone="white" labelledBy="what-heading" className="!py-14 sm:!py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,20rem)_1fr] lg:items-start lg:gap-16">
          <SectionHeading id="what-heading" title="What you can promote" />
          <ul className="flex flex-wrap gap-2">
            {promotableTypes.map((t) => (
              <li key={t} className="rounded-full border border-line-strong bg-paper px-3.5 py-1.5 text-sm text-slate">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Three levels */}
      <Section labelledBy="levels-heading">
        <SectionHeading
          id="levels-heading"
          title="Three ways to advertise"
          lead="Start at the level that fits your business today. Every level is arranged by inquiry for now, so you speak to a person before anything runs."
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {levels.map((l) => (
            <article
              key={l.id}
              id={l.id}
              className={cx(
                "flex scroll-mt-32 flex-col rounded-[var(--radius-md)] border p-7",
                l.enterprise ? "on-dark border-[#2b3f5a] bg-midnight text-fog" : "border-line bg-surface",
              )}
            >
              {l.enterprise ? <span aria-hidden className="-mx-7 -mt-7 mb-7 block h-1 rounded-t-[var(--radius-md)] bg-brass" /> : null}
              <h3 className={cx("text-xl", l.enterprise && "!text-white")}>{l.name}</h3>
              <p className={cx("mt-2 text-sm", l.enterprise ? "text-mist" : "text-muted")}>{l.who}</p>
              <ul className={cx("mt-6 flex-1 space-y-3 border-t pt-5", l.enterprise ? "border-harbour" : "border-line")}>
                {l.formats.map((f) => (
                  <li key={f.name} className="flex items-start justify-between gap-3 text-sm">
                    <span className={l.enterprise ? "text-fog" : "text-slate"}>{f.name}</span>
                    {f.status === "live" ? (
                      <span className={cx("shrink-0 text-xs font-medium", l.enterprise ? "text-brass-bright" : "text-signal-strong")}>By inquiry</span>
                    ) : (
                      <StatusBadge status={f.status} className={l.enterprise ? "!text-mist !ring-harbour-line" : undefined} />
                    )}
                  </li>
                ))}
              </ul>
              <p className={cx("mt-6 text-sm", l.enterprise ? "text-mist" : "text-muted")}>{l.now}</p>
              <InquiryTypeLink
                type={l.type}
                className={cx(
                  "mt-6 inline-flex min-h-11 items-center justify-center rounded-[var(--radius-sm)] px-5 text-sm font-semibold transition-colors",
                  l.enterprise ? "bg-brass text-white hover:bg-[#8f6d2f]" : "border border-line-strong bg-surface text-ink hover:border-ink",
                )}
              >
                {l.cta}
              </InquiryTypeLink>
            </article>
          ))}
        </div>
      </Section>

      {/* How a campaign works */}
      <Section tone="white" labelledBy="steps-heading">
        <SectionHeading
          id="steps-heading"
          title="How a campaign works"
          lead="Promotion is reviewed by people. Nothing is published until you have agreed the details and the campaign has passed our standards."
        />
        <ol className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="relative border-t border-line-strong pt-5">
              <span className="font-display text-sm font-semibold tabular-nums text-signal">Step {i + 1}</span>
              <h3 className="mt-1 text-lg">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-14 flex flex-col gap-4 rounded-[var(--radius-md)] border border-line bg-paper p-6 sm:flex-row sm:items-center sm:gap-6">
          <DisclosureLabel kind="sponsored" className="self-start sm:self-auto" />
          <p className="text-sm text-slate">
            This is how your placement will be marked. It tells readers the business paid to appear, and keeps their trust in everything else they read
            here. <TextLink href="/advertising-standards">Read the advertising standards</TextLink>
          </p>
        </div>
      </Section>

      {/* Inquiry */}
      <section id="inquiry" aria-labelledby="inquiry-heading" className="scroll-mt-28 bg-paper py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-16">
            <div>
              <SectionHeading
                id="inquiry-heading"
                title="Start a promotion inquiry"
                lead="Tell us about your business and what you'd like to promote. There's no obligation and no payment at this stage."
              />
              <h3 className="mt-10 text-base">What happens next</h3>
              <ul className="mt-3 space-y-3 text-sm text-muted">
                <li>We read every inquiry ourselves.</li>
                <li>We reply by email with suitable options and a price, or tell you honestly if we aren&apos;t a good fit yet.</li>
                <li>Free directory listing requests are reviewed and published without any sales follow-up.</li>
              </ul>
            </div>
            <div className="rounded-[var(--radius-md)] border border-line bg-surface p-6 shadow-[var(--shadow-raise)] sm:p-9">
              <InquiryForm defaultType="self-service" />
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <Section tone="white" labelledBy="faq-heading">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
          <SectionHeading id="faq-heading" title="Questions advertisers ask" />
          <div className="divide-y divide-line border-y border-line">
            {faqs.map((f) => (
              <details key={f.q} className="group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 font-display text-lg font-medium tracking-[-0.01em] text-ink [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <svg aria-hidden viewBox="0 0 12 12" className="size-3 shrink-0 text-muted transition-transform group-open:rotate-180">
                    <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </summary>
                <p className="max-w-[44rem] pb-5 text-slate">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
