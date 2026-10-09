import Link from "next/link";
import type { ReactNode } from "react";
import { divisionOrder, divisions, type DivisionKey } from "@/lib/divisions";
import { CapabilityList, PageHero, Section, SectionHeading, StatusKey } from "@/components/ui";

/**
 * Shared structure for the six division landing pages: hero, honest
 * capability list, any division-specific sections, and onward routes.
 */
export function DivisionPage({
  division,
  actions,
  capabilityTitle = "What you can do here",
  children,
  accent,
}: {
  division: DivisionKey;
  actions?: ReactNode;
  capabilityTitle?: string;
  children?: ReactNode;
  accent?: "signal" | "brass";
}) {
  const d = divisions[division];
  const others = divisionOrder.filter((k) => k !== division);

  return (
    <>
      <PageHero crumbs={[{ name: d.name, path: d.href }]} title={d.name} lead={d.intro} accent={accent}>
        {actions}
      </PageHero>

      <Section labelledBy="capabilities-heading">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
          <div>
            <SectionHeading id="capabilities-heading" title={capabilityTitle} />
            <p className="mt-4 text-sm text-muted">
              <strong className="font-semibold text-ink">Who it&apos;s for:</strong> {d.forWhom}
            </p>
          </div>
          <div>
            <CapabilityList items={d.capabilities} />
            <StatusKey className="mt-5" />
          </div>
        </div>
      </Section>

      {children}

      <Section tone="white" labelledBy="related-heading" className="!py-14">
        <h2 id="related-heading" className="text-lg">
          Elsewhere on the platform
        </h2>
        <ul className="mt-6 grid gap-px overflow-hidden rounded-[var(--radius-md)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
          {others.map((k) => (
            <li key={k} className="bg-surface">
              <Link href={divisions[k].href} className="block h-full p-5 hover:bg-paper">
                <span className="block text-sm font-semibold text-ink">{divisions[k].name}</span>
                <span className="mt-1 block text-xs text-muted">{divisions[k].purpose}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
