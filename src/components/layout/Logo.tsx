import Link from "next/link";

/**
 * Wordmark plus route mark: three stations on a rising line, the
 * same idea as the business route on the homepage.
 */
export function RouteMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className} fill="none">
      <rect width="32" height="32" rx="7" fill="#16304D" />
      <path d="M7 23 L15 15.5 L25 9" stroke="#45C2BE" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7" cy="23" r="2.6" fill="#0D1B2E" stroke="#45C2BE" strokeWidth="2" />
      <circle cx="15" cy="15.5" r="2.6" fill="#0D1B2E" stroke="#45C2BE" strokeWidth="2" />
      <circle cx="25" cy="9" r="3.2" fill="#45C2BE" />
    </svg>
  );
}

export function Logo({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link href="/" onNavigate={onNavigate} className="group flex items-center gap-3 rounded-sm" aria-label="The Dream Business, home">
      <RouteMark className="size-8 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="whitespace-nowrap font-display text-[1.0625rem] font-bold tracking-[-0.02em] text-white">The Dream Business</span>
        <span className="mt-1 whitespace-nowrap text-[0.6875rem] font-medium tracking-[0.04em] text-mist">The Business Builder</span>
      </span>
    </Link>
  );
}
