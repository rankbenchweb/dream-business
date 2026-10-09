import { ToolFinder } from "@/components/tools/ToolFinder";
import { ButtonLink, PageHero, Section, SectionHeading, StatusKey, TextLink } from "@/components/ui";
import { divisions } from "@/lib/divisions";
import { pageMetadata } from "@/lib/seo";
import { liveTools, tools } from "@/lib/tools";

const d = divisions.tools;
export const metadata = pageMetadata({
  title: "Business Tools: calculators for pricing, profit and planning",
  description:
    "Free business calculators that show their working: profit margin, markup, break-even and more, in your market's currency. See every tool and its status.",
  path: d.href,
});

const principles = [
  { title: "Shows its working", body: "Every tool states its formula and assumptions next to the result." },
  { title: "Your currency", body: "Results follow the market you choose in the header." },
  { title: "Runs in your browser", body: "Numbers you enter stay on your device. Nothing is stored." },
  { title: "One job each", body: "Tools solve distinct problems. No near-duplicates to pad the catalogue." },
];

export default function ToolsPage() {
  return (
    <>
      <PageHero crumbs={[{ name: "Business Tools", path: d.href }]} title="Business Tools" lead={d.intro}>
        <ButtonLink href={liveTools[0].href!} variant="onDark">
          Open the profit margin calculator
        </ButtonLink>
        <ButtonLink href="#catalogue" variant="onDarkSecondary">
          Browse all {tools.length} tools
        </ButtonLink>
      </PageHero>

      <Section id="catalogue" labelledBy="catalogue-heading">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="catalogue-heading"
            title="Tool catalogue"
            lead={`${liveTools.length} tools are live today. The rest are listed with their status so you can see what is coming, in the order we plan to build them.`}
          />
          <StatusKey />
        </div>
        <div className="mt-10">
          <ToolFinder readQueryFromUrl />
        </div>
      </Section>

      <Section tone="white" labelledBy="principles-heading">
        <SectionHeading id="principles-heading" title="How our tools work" />
        <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((p) => (
            <li key={p.title} className="border-t-2 border-gold pt-5">
              <h3 className="text-base font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted">{p.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-12 text-sm text-muted">
          Need a tool that isn&apos;t listed?{" "}
          <TextLink href="/contact">Tell us what you&apos;re trying to work out</TextLink>
          .
        </p>
      </Section>
    </>
  );
}
