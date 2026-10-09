import Link from "next/link";
import type { ReactNode } from "react";
import { JsonLd, PageHero, Section, StatusBadge } from "@/components/ui";
import { site } from "@/lib/site";
import { tools } from "@/lib/tools";

/** Shared frame for an individual tool: hero, the tool, a short guide, related tools. */
export function ToolPage({
  slug,
  title,
  lead,
  children,
  guide,
}: {
  slug: string;
  title: string;
  lead: string;
  children: ReactNode;
  guide: ReactNode;
}) {
  const tool = tools.find((t) => t.slug === slug)!;
  const related = tools.filter((t) => t.slug !== slug && (t.category === tool.category || t.status === "live")).slice(0, 4);

  return (
    <>
      <PageHero crumbs={[{ name: "Business Tools", path: "/tools" }, { name: tool.name, path: tool.href! }]} title={title} lead={lead} />
      <Section className="!pt-10 sm:!pt-12">{children}</Section>
      <Section tone="white">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16">
          <article className="prose-db">{guide}</article>
          <aside aria-labelledby="related-tools">
            <h2 id="related-tools" className="text-base">
              Related tools
            </h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {related.map((t) => (
                <li key={t.slug} className="py-3">
                  {t.href ? (
                    <Link href={t.href} className="text-sm font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-signal">
                      {t.name}
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold text-slate">{t.name}</span>
                  )}
                  <span className="ml-2 align-middle">
                    <StatusBadge status={t.status} />
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/tools" className="mt-4 inline-block text-sm font-semibold text-signal-strong underline underline-offset-4">
              All business tools
            </Link>
          </aside>
        </div>
      </Section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: tool.name,
          description: tool.summary,
          url: `${site.url}${tool.href}`,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Any",
          isAccessibleForFree: true,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          publisher: { "@type": "Organization", name: site.name },
        }}
      />
    </>
  );
}
