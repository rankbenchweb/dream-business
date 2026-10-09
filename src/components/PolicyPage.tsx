import type { ReactNode } from "react";
import { PageHero, Section } from "@/components/ui";

/** Long-form page frame for policies and standards. */
export function PolicyPage({
  path,
  title,
  lead,
  updated,
  draft,
  children,
}: {
  path: string;
  title: string;
  lead: string;
  updated: string;
  draft?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      <PageHero crumbs={[{ name: title, path }]} title={title} lead={lead} />
      <Section tone="white">
        <p className="text-sm text-muted">Last updated {updated}</p>
        {draft ? (
          <p className="mt-4 max-w-[68ch] rounded-[var(--radius-sm)] border border-brass/40 bg-brass-soft px-4 py-3 text-sm text-[#6b5120]">
            This is a working draft written in plain language. It will be reviewed by a qualified adviser before the platform accepts accounts or
            payments.
          </p>
        ) : null}
        <div className="prose-db mt-8">{children}</div>
      </Section>
    </>
  );
}
