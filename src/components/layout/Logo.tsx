import Link from "next/link";

/**
 * The Dream Business emblem: two gold eyes held by chrome-silver arcs,
 * redrawn from the brand logo with its polished, glowing finish.
 * - `glow` adds a soft gold halo (for dark backgrounds).
 * - `sparkle` adds the star highlights from the original artwork; use it
 *   at sizes of about 56px and up, where it stays crisp.
 * `id` keeps gradient and filter ids unique when the emblem repeats on a page.
 */
export function Emblem({
  className,
  id = "tdb",
  glow = false,
  sparkle = false,
}: {
  className?: string;
  id?: string;
  glow?: boolean;
  sparkle?: boolean;
}) {
  const s = `${id}-silver`;
  const g = `${id}-gold`;
  const eye = `${id}-eye`;
  const halo = `${id}-halo`;
  const star = `${id}-star`;
  return (
    <svg viewBox="-4 -4 72 72" aria-hidden className={className} fill="none" overflow="visible">
      <defs>
        {/* Banded chrome, like polished metal catching light */}
        <linearGradient id={s} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.22" stopColor="#D3DAE2" />
          <stop offset="0.45" stopColor="#8E99A6" />
          <stop offset="0.62" stopColor="#EEF2F6" />
          <stop offset="0.82" stopColor="#A3ADB9" />
          <stop offset="1" stopColor="#6F7A87" />
        </linearGradient>
        {/* Polished gold with a bright highlight band */}
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF3C4" />
          <stop offset="0.3" stopColor="#F5C451" />
          <stop offset="0.55" stopColor="#D69A24" />
          <stop offset="0.75" stopColor="#FFDD7A" />
          <stop offset="1" stopColor="#B07A14" />
        </linearGradient>
        <filter id={halo} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.6" result="blur" />
          <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0.95  0 1 0 0 0.72  0 0 1 0 0.2  0 0 0 0.75 0" result="gold" />
          <feMerge>
            <feMergeNode in="gold" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <path id={star} d="M0 -5 C0.6 -0.6 0.6 -0.6 5 0 C0.6 0.6 0.6 0.6 0 5 C-0.6 0.6 -0.6 0.6 -5 0 C-0.6 -0.6 -0.6 -0.6 0 -5 Z" />
      </defs>

      <g filter={glow ? `url(#${halo})` : undefined}>
        <path d="M4 39.5 A29 29 0 0 1 48.6 8.2 A34 34 0 0 0 4 39.5 Z" fill={`url(#${s})`} />
        <path d="M60 24.5 A29 29 0 0 1 15.4 55.8 A34 34 0 0 0 60 24.5 Z" fill={`url(#${s})`} />
        <path d="M10 26 C20 21 28 27 32 32 C36 37 44 43 54 38 C47 47 36 43 31 38 C26 33 21 27 10 26 Z" fill={`url(#${s})`} />
        <g id={eye}>
          <path
            d="M17 20.5 C23 12.5 35 10.5 45.5 15 C38.5 22.5 26 24.5 17 20.5 Z"
            stroke={`url(#${g})`}
            strokeWidth="2.6"
            strokeLinejoin="round"
          />
          <circle cx="31.5" cy="17.3" r="4.6" fill={`url(#${g})`} />
          <circle cx="31.5" cy="15.3" r="1.5" fill="#0D1B2E" />
          <circle cx="29.6" cy="16.4" r="0.8" fill="#FFF8DD" />
        </g>
        <use href={`#${eye}`} transform="rotate(180 32 32)" />
      </g>

      {sparkle ? (
        <g fill="#FFFFFF">
          <use href={`#${star}`} transform="translate(18 20) scale(0.9)" className="tdb-sparkle" />
          <use href={`#${star}`} transform="translate(53 37) scale(1.1)" className="tdb-sparkle [animation-delay:1.2s]" />
          <use href={`#${star}`} transform="translate(43.5 45) scale(0.65)" className="tdb-sparkle [animation-delay:2.1s]" />
        </g>
      ) : null}
    </svg>
  );
}

export function Logo({ onNavigate, id }: { onNavigate?: () => void; id?: string }) {
  return (
    <Link href="/" onNavigate={onNavigate} className="group flex items-center gap-3 rounded-sm">
      <Emblem id={id} glow className="size-11 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="whitespace-nowrap font-display text-[1.0625rem] font-bold tracking-[-0.02em] text-white">The Dream Business</span>
        <span className="mt-1 whitespace-nowrap text-[0.6875rem] font-medium tracking-[0.04em] text-gold-bright">The Business Builder</span>
      </span>
      <span className="sr-only">, home</span>
    </Link>
  );
}
