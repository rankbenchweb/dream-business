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
    now: { label: "Plan your launch budget and runway with the startup cost planner", href: "/tools/startup-cost-planner" },
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
          <ButtonLink href="/tools/startup-cost-planner" variant="onDark">
            Plan your startup costs
          </ButtonLink>
          <ButtonLink href="/tools/business-model-comparison" variant="onDarkSecondary">
            Compare business models
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
                    <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" />
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
              <StatusBadge status="live" />
            </div>
            <p className="mt-4 max-w-[40rem] text-lg text-muted">
              Choose what you want to achieve, answer three questions, and get a plan in the right order, linked to the tools for each step.
            </p>
            <p className="mt-4 max-w-[40rem] text-sm text-muted">
              It recommends; it never acts for you. Purchases, sign-ups, payments and commitments stay in your hands. A version that uses AI to
              tailor plans further is planned for a later stage.
            </p>
            <ButtonLink href="/navigator" className="mt-8">
              Start the Navigator
            </ButtonLink>
          </div>
          <ol className="space-y-3 rounded-[var(--radius-md)] border border-line bg-surface p-6 text-sm">
            {["Choose a goal", "Answer three questions", "Get ordered steps with the right tools", "See the risks and your first action", "Tick off steps as you go"].map((s, i) => (
              <li key={s} className="flex gap-3">
                <span className="w-5 shrink-0 tabular-nums text-muted">{i + 1}.</span>
                <span className="text-slate">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </Section>
    </DivisionPage>
  );
}
