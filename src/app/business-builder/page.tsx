import { DivisionPage } from "@/components/DivisionPage";
import { ButtonLink, Section, SectionHeading, StatusBadge, TextLink } from "@/components/ui";
import { divisions } from "@/lib/divisions";
import { pageMetadata } from "@/lib/seo";

const d = divisions.builder;
export const metadata = pageMetadata({
  title: "Business Builder: plan, launch and expand a business",
  description:
    "Plan a new business or a new line for an established company: startup costs, business model comparison, launch checklists and growth roadmaps on The Dream Business.",
  path: d.href,
});

const paths = [
  {
    id: "start",
    title: "Starting a business",
    lead: "For a first venture, the Builder answers the questions that decide whether an idea is worth the money.",
    questions: [
      "Which business model suits my capital, time and skills?",
      "What will it cost to launch, and how long will my budget last?",
      "How many sales do I need before it pays for itself?",
      "What has to be in place before launch in my country?",
    ],
    now: { label: "Check how many sales you need with the break-even calculator", href: "/tools/break-even-calculator" },
  },
  {
    id: "expand",
    title: "Expanding an established company",
    lead: "For an operating business, the same tools assess a new product line, a new model or a new market before you commit.",
    questions: [
      "Does a new product line clear our margin targets?",
      "What does a new sales channel cost to set up and run?",
      "Which risks increase if we add this line or market?",
      "What sequence of milestones gets us there?",
    ],
    now: { label: "Test the pricing of a new line with the profit margin calculator", href: "/tools/profit-margin-calculator" },
  },
];

export default function BusinessBuilderPage() {
  return (
    <DivisionPage
      division="builder"
      actions={
        <>
          <ButtonLink href="/tools/break-even-calculator" variant="onDark">
            Check your break-even point
          </ButtonLink>
          <ButtonLink href="#start" variant="onDarkSecondary">
            See how planning works
          </ButtonLink>
        </>
      }
    >
      <Section tone="white" labelledBy="paths-heading">
        <SectionHeading
          id="paths-heading"
          title="Two starting points, one planning method"
          lead="The Builder adapts to where you are. A founder and an established company answer different questions, but both end with a plan they can act on."
        />
        <div className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-md)] border border-line bg-line lg:grid-cols-2">
          {paths.map((p) => (
            <article key={p.id} id={p.id} className="scroll-mt-32 bg-surface p-7 sm:p-9">
              <h3 className="text-xl">{p.title}</h3>
              <p className="mt-2 text-sm text-muted">{p.lead}</p>
              <ul className="mt-6 space-y-3">
                {p.questions.map((q) => (
                  <li key={q} className="flex gap-3 text-sm text-slate">
                    <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-signal" />
                    {q}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-5">
                <StatusBadge status="live" />
                <TextLink href={p.now.href} className="text-sm">
                  {p.now.label}
                </TextLink>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section labelledBy="navigator-heading">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start lg:gap-16">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 id="navigator-heading" className="text-2xl sm:text-3xl">
                The Business Growth Navigator
              </h2>
              <StatusBadge status="planned" />
            </div>
            <p className="mt-4 max-w-[40rem] text-lg text-muted">
              A guided assistant that starts from your objective, asks only the questions that objective needs, and returns a plan linked to the right
              tools, research and services on the platform.
            </p>
            <p className="mt-4 max-w-[40rem] text-sm text-muted">
              It will recommend; it will not act for you. Purchases, sign-ups, payments and commitments stay in your hands, and the Navigator will never
              claim to have contacted a supplier or verified information it has not.
            </p>
          </div>
          <ol className="space-y-3 rounded-[var(--radius-md)] border border-line bg-surface p-6 text-sm">
            {["Choose an objective", "Answer a few focused questions", "Review assumptions and risks", "Get tools, research and services in order", "Track progress as you go"].map(
              (s, i) => (
                <li key={s} className="flex gap-3">
                  <span className="w-5 shrink-0 tabular-nums text-muted">{i + 1}.</span>
                  <span className="text-slate">{s}</span>
                </li>
              ),
            )}
          </ol>
        </div>
      </Section>
    </DivisionPage>
  );
}
