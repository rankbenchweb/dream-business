import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { statusLabel, type Status } from "@/lib/tools";
import type { Capability } from "@/lib/divisions";
import { breadcrumbJsonLd } from "@/lib/seo";

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export function Container({ className, children }: { className?: string; children: ReactNode; wide?: boolean }) {
  return <div className={cx("mx-auto w-full px-4 sm:px-6 lg:px-8", "max-w-[1320px]", className)}>{children}</div>;
}

type Tone = "paper" | "white" | "midnight";
const toneClass: Record<Tone, string> = {
  paper: "bg-paper",
  white: "bg-surface",
  midnight: "on-dark bg-midnight text-fog [&_h2]:text-white [&_h3]:text-white",
};

export function Section({
  tone = "paper",
  className,
  children,
  id,
  labelledBy,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
  id?: string;
  labelledBy?: string;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cx(toneClass[tone], "py-16 sm:py-20 lg:py-24", className)}>
      <Container>{children}</Container>
    </section>
  );
}

/** Section heading block: title + optional lead. Left aligned by design. */
export function SectionHeading({
  id,
  title,
  lead,
  className,
  as: Tag = "h2",
}: {
  id?: string;
  title: ReactNode;
  lead?: ReactNode;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className={cx("max-w-[44rem]", className)}>
      <Tag id={id} className="text-2xl sm:text-3xl">
        {title}
      </Tag>
      {lead ? <p className="mt-4 text-lg text-muted [.on-dark_&]:text-mist">{lead}</p> : null}
    </div>
  );
}

type Variant = "primary" | "secondary" | "onDark" | "onDarkSecondary" | "brass";
const variantClass: Record<Variant, string> = {
  primary: "bg-gold text-white hover:bg-gold-strong",
  secondary: "border border-line-strong bg-surface text-ink hover:border-ink",
  onDark: "bg-gold-bright text-midnight hover:bg-white",
  onDarkSecondary: "border border-harbour-line text-white hover:border-mist hover:bg-harbour",
  brass: "bg-brass text-white hover:bg-[#8f6d2f]",
};
const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-sm)] px-5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link {...props} className={cx(buttonBase, variantClass[variant], className)} />;
}

export function Button({
  variant = "primary",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button {...props} className={cx(buttonBase, variantClass[variant], className)} />;
}

/** Inline text link with an underline that strengthens on hover. */
export function TextLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={cx(
        "font-semibold text-gold-strong underline decoration-gold/30 decoration-2 underline-offset-4 hover:decoration-gold [.on-dark_&]:text-gold-bright [.on-dark_&]:decoration-gold-bright/40",
        className,
      )}
    />
  );
}

const statusClass: Record<Status, string> = {
  live: "bg-gold-soft text-gold-strong ring-gold/25",
  building: "bg-surface text-slate ring-line-strong",
  planned: "bg-transparent text-muted ring-line",
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        statusClass[status],
        className,
      )}
    >
      {status === "live" ? <span aria-hidden className="size-1.5 rounded-full bg-gold" /> : null}
      {statusLabel[status]}
    </span>
  );
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here; escape "<" to prevent breaking out of the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  const trail = [{ name: "Home", path: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-xs text-mist">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {trail.map((item, i) => (
            <li key={item.path} className="flex items-center gap-2">
              {i > 0 ? (
                <span aria-hidden className="text-harbour-line">
                  /
                </span>
              ) : null}
              {i === trail.length - 1 ? (
                <span aria-current="page" className="text-fog">
                  {item.name}
                </span>
              ) : (
                <Link href={item.path} className="hover:text-white">
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(trail)} />
    </>
  );
}

/**
 * Inner-page hero on midnight. The thin rule on the left carries the
 * division accent (teal, or brass for enterprise contexts).
 */
export function PageHero({
  crumbs,
  title,
  lead,
  children,
  accent = "gold",
}: {
  crumbs: { name: string; path: string }[];
  title: ReactNode;
  lead: ReactNode;
  children?: ReactNode;
  accent?: "gold" | "brass";
}) {
  return (
    <header className="on-dark relative overflow-hidden bg-midnight pb-14 pt-10 text-fog sm:pb-20 sm:pt-12">
      <GridTexture />
      <Container className="relative">
        <Breadcrumbs items={crumbs} />
        <div
          className={cx(
            "mt-8 max-w-[52rem] border-l-2 pl-5 sm:pl-7",
            accent === "brass" ? "border-brass-bright" : "border-gold-bright",
          )}
        >
          <h1 className="text-3xl text-white sm:text-4xl">{title}</h1>
          <p className="mt-5 max-w-[40rem] text-lg text-mist">{lead}</p>
          {children ? <div className="mt-8 flex flex-wrap gap-3">{children}</div> : null}
        </div>
      </Container>
    </header>
  );
}

/** Faint coordinate grid used behind midnight headers. Decorative only. */
export function GridTexture() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,rgb(42_69_102/0.45)_1px,transparent_1px),linear-gradient(to_bottom,rgb(42_69_102/0.45)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
    />
  );
}

export function CapabilityList({ items, className }: { items: Capability[]; className?: string }) {
  return (
    <ul className={cx("divide-y divide-line border-y border-line", className)}>
      {items.map((c) => (
        <li key={c.name} className="grid gap-2 py-5 sm:grid-cols-[minmax(0,15rem)_1fr_auto] sm:items-baseline sm:gap-6">
          <h3 className="text-base font-semibold">
            {c.href ? (
              <Link href={c.href} className="underline decoration-line-strong underline-offset-4 hover:decoration-gold">
                {c.name}
              </Link>
            ) : (
              c.name
            )}
          </h3>
          <p className="text-sm text-muted">{c.detail}</p>
          <StatusBadge status={c.status} className="justify-self-start sm:justify-self-end" />
        </li>
      ))}
    </ul>
  );
}

export function StatusKey({ className }: { className?: string }) {
  return (
    <p className={cx("flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted", className)}>
      <span>Status key:</span>
      <StatusBadge status="live" />
      <span>works today</span>
      <StatusBadge status="building" />
      <span>being built now</span>
      <StatusBadge status="planned" />
      <span>on the roadmap</span>
    </p>
  );
}
