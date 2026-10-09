import Link from "next/link";
import { footerNav, site } from "@/lib/site";
import { Container } from "@/components/ui";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="on-dark bg-midnight text-fog print:hidden">
      <Container className="grid gap-12 py-16 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
        <div>
          <Logo id="tdb-f" />
          <p className="mt-6 font-display text-xl font-semibold tracking-[-0.02em] text-white">{site.tagline}</p>
          <p className="mt-3 max-w-[22rem] text-sm text-mist">
            Practical tools, transparent business discovery and clearly labelled promotion for businesses at every stage.
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {footerNav.map((group) => (
            <div key={group.heading}>
              <h2 className="text-sm font-semibold text-white">{group.heading}</h2>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-mist hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </Container>
      <div className="border-t border-harbour">
        <Container className="flex flex-col gap-3 py-6 text-xs text-mist sm:flex-row sm:items-center sm:justify-between">
          <p>© {site.name}. All rights reserved.</p>
          <p className="max-w-[36rem] sm:text-right">
            Sponsored placements and affiliate links are always labelled. Paid placement never buys a verified status or an editorial recommendation.
          </p>
        </Container>
      </div>
    </footer>
  );
}
