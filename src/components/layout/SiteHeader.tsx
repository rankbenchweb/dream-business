"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { primaryNav } from "@/lib/site";
import { Container, cx } from "@/components/ui";
import { Logo } from "./Logo";
import { MarketSelector } from "./MarketSelector";
import { SearchDialog } from "./SearchDialog";
import { accountsEnabled } from "@/lib/supabase/config";

function isActive(pathname: string, href: string) {
  const base = href.split(/[?#]/)[0];
  return base === "/" ? pathname === "/" : pathname === base || pathname.startsWith(`${base}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileGroup, setMobileGroup] = useState<number | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const baseId = useId();

  const closeAll = () => {
    setOpenMenu(null);
    setMobileOpen(false);
  };

  // Close transient menus whenever the route changes (state adjusted during render).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpenMenu(null);
    setMobileOpen(false);
  }

  // Escape and outside click close the desktop mega menu.
  useEffect(() => {
    if (openMenu === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenu(null);
        document.getElementById(`${baseId}-trigger-${openMenu}`)?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [openMenu, baseId]);

  // Lock page scroll behind the mobile menu.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    if (mobileOpen) document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  return (
    <header className="on-dark sticky top-0 z-50 bg-midnight text-fog print:hidden">
      <a
        href="#main"
        className="absolute left-4 top-2 z-[60] -translate-y-20 rounded bg-white px-4 py-2 text-sm font-semibold text-ink focus:translate-y-0"
      >
        Skip to content
      </a>

      {/* Utility row */}
      <div className="hidden border-b border-harbour xl:block">
        <Container wide className="flex h-10 items-center justify-between text-xs">
          <p className="text-mist">For founders, growing companies and enterprises worldwide.</p>
          <div className="flex items-center gap-5">
            <MarketSelector id={`${baseId}-market`} />
            <Link href="/promote" className="text-mist hover:text-white">
              Advertise with us
            </Link>
            <Link href="/contact" className="text-mist hover:text-white">
              Contact
            </Link>
            {accountsEnabled ? (
              <Link href="/account" className="font-semibold text-gold-bright hover:text-white">
                Account
              </Link>
            ) : null}
          </div>
        </Container>
      </div>

      {/* Main row */}
      <div ref={navRef} className="relative border-b border-harbour">
        <Container wide className="flex h-16 items-center gap-3 sm:gap-6">
          <Logo id="tdb-h" onNavigate={closeAll} />

          <nav aria-label="Primary" className="ml-auto hidden xl:block">
            <ul className="flex items-center">
              {primaryNav.map((group, i) => {
                const expanded = openMenu === i;
                const active = isActive(pathname, group.href);
                return (
                  <li key={group.label}>
                    <button
                      id={`${baseId}-trigger-${i}`}
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={`${baseId}-panel-${i}`}
                      onClick={() => setOpenMenu(expanded ? null : i)}
                      className={cx(
                        "relative flex h-16 items-center gap-1 whitespace-nowrap px-2 text-[0.875rem] font-medium transition-colors 2xl:px-3",
                        expanded || active ? "text-white" : "text-fog hover:text-white",
                      )}
                    >
                      {group.label}
                      <svg aria-hidden viewBox="0 0 12 12" className={cx("size-2.5 text-mist transition-transform", expanded && "rotate-180")}>
                        <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                      <span
                        aria-hidden
                        className={cx(
                          "absolute inset-x-2 bottom-0 h-0.5 bg-gold-bright transition-opacity 2xl:inset-x-3",
                          active || expanded ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2 xl:ml-0">
            <SearchDialog
              label="Search"
              triggerClassName="flex h-9 items-center gap-2 rounded-[var(--radius-sm)] border border-harbour-line px-3 text-sm text-fog hover:border-mist hover:text-white [&>span]:sr-only 2xl:[&>span]:not-sr-only"
            />
            <button
              type="button"
              className="flex h-9 items-center gap-2 rounded-[var(--radius-sm)] border border-harbour-line px-3 text-sm text-white xl:hidden"
              aria-expanded={mobileOpen}
              aria-controls={`${baseId}-mobile`}
              onClick={() => setMobileOpen((o) => !o)}
            >
              <svg aria-hidden viewBox="0 0 20 20" className="size-4">
                {mobileOpen ? (
                  <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                ) : (
                  <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                )}
              </svg>
              Menu
            </button>
          </div>
        </Container>

        {/* Desktop mega menu panels */}
        {primaryNav.map((group, i) => (
          <div
            key={group.label}
            id={`${baseId}-panel-${i}`}
            role="region"
            aria-labelledby={`${baseId}-trigger-${i}`}
            hidden={openMenu !== i}
            className="absolute inset-x-0 top-full hidden border-b border-line bg-surface text-slate shadow-[var(--shadow-menu)] xl:block"
          >
            <Container wide className="grid grid-cols-[minmax(0,18rem)_1fr] gap-12 py-8">
              <div>
                <p className="font-display text-xl font-semibold tracking-[-0.02em] text-ink">{group.label}</p>
                <p className="mt-3 text-sm text-muted">{group.summary}</p>
                <Link
                  href={group.href}
                  onNavigate={closeAll}
                  className="mt-5 inline-block text-sm font-semibold text-gold-strong underline decoration-gold/30 decoration-2 underline-offset-4 hover:decoration-gold"
                >
                  Go to {group.label}
                </Link>
              </div>
              <ul className="grid grid-cols-2 gap-x-8 gap-y-1">
                {group.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      onNavigate={closeAll}
                      className="block rounded-[var(--radius-md)] px-3 py-3 hover:bg-paper"
                    >
                      <span className="block text-sm font-semibold text-ink">{l.label}</span>
                      {l.description ? <span className="mt-0.5 block text-sm text-muted">{l.description}</span> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </Container>
          </div>
        ))}
      </div>

      {/* Mobile and tablet navigation */}
      <div
        id={`${baseId}-mobile`}
        hidden={!mobileOpen}
        className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto bg-midnight xl:hidden"
      >
        <Container className="py-4">
          <nav aria-label="Primary">
            <ul className="divide-y divide-harbour">
              {primaryNav.map((group, i) => {
                const expanded = mobileGroup === i;
                return (
                  <li key={group.label}>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={`${baseId}-m-${i}`}
                      onClick={() => setMobileGroup(expanded ? null : i)}
                      className="flex w-full items-center justify-between py-4 text-left font-display text-lg font-semibold text-white"
                    >
                      {group.label}
                      <svg aria-hidden viewBox="0 0 12 12" className={cx("size-3.5 text-mist transition-transform", expanded && "rotate-180")}>
                        <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </button>
                    <ul id={`${baseId}-m-${i}`} hidden={!expanded} className="pb-4">
                      {group.links.map((l) => (
                        <li key={l.href + l.label}>
                          <Link href={l.href} onNavigate={closeAll} className="block rounded py-2.5 pl-3 text-fog hover:text-white">
                            {l.label === "Overview" ? `${group.label} overview` : l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="mt-6 flex flex-col gap-4 border-t border-harbour pt-6">
            <MarketSelector id={`${baseId}-market-m`} />
            <Link href="/contact" onNavigate={closeAll} className="text-fog hover:text-white">
              Contact
            </Link>
            {accountsEnabled ? (
              <Link href="/account" onNavigate={closeAll} className="font-semibold text-gold-bright hover:text-white">
                Sign in or your account
              </Link>
            ) : null}
          </div>
        </Container>
      </div>
    </header>
  );
}
