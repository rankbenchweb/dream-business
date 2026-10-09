import { DivisionPage } from "@/components/DivisionPage";
import { ButtonLink, Section, SectionHeading, StatusBadge, TextLink } from "@/components/ui";
import { divisions } from "@/lib/divisions";
import { markets } from "@/lib/markets";
import { pageMetadata } from "@/lib/seo";

const d = divisions.growth;
export const metadata = pageMetadata({
  title: "Business Growth: profitability, operations and expansion",
  description:
    "Improve margins, plan marketing, reduce operating costs and expand into new countries. Business Growth on The Dream Business links each decision to the tools that answer it.",
  path: d.href,
});

const questions = [
  { q: "Are we pricing for the margin we need?", tool: "Profit margin calculator", href: "/tools/profit-margin-calculator", status: "live" as const },
  { q: "How many sales cover this month's costs?", tool: "Break-even calculator", href: "/tools/break-even-calculator", status: "live" as const },
  { q: "Does this investment pay back in time?", tool: "Return on investment calculator", href: "/tools/roi-calculator", status: "live" as const },
  { q: "Which advertising spend actually returns profit?", tool: "Advertising profitability calculator", status: "building" as const },
];

const international = [
  { title: "Payments and payouts", body: "Which providers state support for your country, business type and payout currency." },
  { title: "Shipping, customs and duty", body: "Landed cost and the documentation each route requires." },
  { title: "Marketplaces and platforms", body: "Where you are eligible to sell, and on what terms." },
  { title: "Local services", body: "Fulfilment, agencies and advisers in the market you are entering." },
];

export default function GrowthPage() {
  return (
    <DivisionPage
      division="growth"
      actions={
        <>
          <ButtonLink href="#profitability" variant="onDark">
            Start with profitability
          </ButtonLink>
          <ButtonLink href="#international" variant="onDarkSecondary">
            Plan international expansion
          </ButtonLink>
        </>
      }
    >
      <Section tone="white" id="profitability" labelledBy="profit-heading">
        <SectionHeading
          id="profit-heading"
          title="Improve profitability"
          lead="Growth that loses money on each sale only scales the loss. These are the questions to answer first, and the tools that answer them."
        />
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {questions.map((x) => (
            <li key={x.q} className="grid gap-2 py-5 md:grid-cols-[1fr_minmax(0,18rem)_auto] md:items-center md:gap-8">
              <p className="font-display text-lg font-medium tracking-[-0.01em] text-ink">{x.q}</p>
              {x.href ? <TextLink href={x.href} className="text-sm">{x.tool}</TextLink> : <span className="text-sm text-slate">{x.tool}</span>}
              <StatusBadge status={x.status} className="justify-self-start md:justify-self-end" />
            </li>
          ))}
        </ul>
      </Section>

      <Section id="international" labelledBy="intl-heading">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16">
          <div>
            <SectionHeading
              id="intl-heading"
              title="Expand internationally"
              lead="Requirements differ by country, and so does what is available. Country guidance will separate official requirements, provider eligibility, general guidance and estimates, and say when each was last checked."
            />
            <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {international.map((i) => (
                <li key={i.title} className="border-t border-line-strong pt-4">
                  <h3 className="text-base font-semibold">{i.title}</h3>
                  <p className="mt-1 text-sm text-muted">{i.body}</p>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <StatusBadge status="planned" />
              <span className="text-sm text-muted">Country guides are being researched now. Calculators already use your market&apos;s currency.</span>
            </div>
          </div>
          <aside className="self-start rounded-[var(--radius-md)] border border-line bg-surface p-7">
            <h3 className="text-base">Markets in the first release</h3>
            <p className="mt-2 text-sm text-muted">Choose yours with the market selector in the header.</p>
            <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate">
              {markets
                .filter((m) => m.code !== "global")
                .map((m) => (
                  <li key={m.code}>{m.label}</li>
                ))}
            </ul>
          </aside>
        </div>
      </Section>
    </DivisionPage>
  );
}
