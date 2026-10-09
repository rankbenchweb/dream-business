"use client";

import Link from "next/link";
import { useState } from "react";
import { businessRoute, divisions, type DivisionKey } from "@/lib/divisions";
import { cx } from "@/components/ui";

const legend: DivisionKey[] = ["builder", "intelligence", "marketplace", "tools", "growth"];

/**
 * The signature element: the business journey drawn as a route line.
 * Each station belongs to a division; hovering or focusing a division
 * in the key highlights where it helps along the route.
 */
export function BusinessRoute() {
  const [focus, setFocus] = useState<DivisionKey | null>(null);
  const dim = (k: DivisionKey) => focus !== null && focus !== k;

  return (
    <div className="relative">
      <h2 id="route-heading" className="text-base font-semibold text-white">
        The business route
      </h2>
      <p className="mt-1 max-w-[38rem] text-sm text-mist">
        Eleven stages from first idea to new markets. Each one maps to a part of the platform.
      </p>

      {/* Desktop: horizontal route */}
      <ol className="relative mt-10 hidden grid-cols-11 lg:grid" aria-describedby="route-heading">
        <span aria-hidden className="absolute left-[4.5%] right-[4.5%] top-[7px] h-0.5 bg-harbour-line" />
        <span
          aria-hidden
          className="absolute left-[4.5%] right-[4.5%] top-[7px] h-0.5 origin-left bg-gold-bright motion-safe:animate-[route-draw_1.6s_cubic-bezier(.6,0,.2,1)_.2s_both]"
        />
        {businessRoute.map((s, i) => {
          const d = divisions[s.division];
          return (
            <li key={s.stage} className={cx("relative flex flex-col items-center text-center transition-opacity", dim(s.division) && "opacity-30")}>
              <Link href={d.href} className="group flex flex-col items-center rounded px-1">
                <span
                  aria-hidden
                  className={cx(
                    "relative z-10 block size-4 rounded-full border-2 border-gold-bright bg-midnight transition-colors group-hover:bg-gold-bright",
                    i === businessRoute.length - 1 && "bg-gold-bright",
                  )}
                />
                <span className="mt-3 text-[0.6875rem] tabular-nums text-mist">{String(i + 1).padStart(2, "0")}</span>
                <span className="mt-0.5 text-sm font-semibold text-white group-hover:underline group-hover:underline-offset-4">{s.stage}</span>
                <span className="mt-1 text-xs text-mist">{d.short}</span>
              </Link>
            </li>
          );
        })}
      </ol>

      {/* Mobile and tablet: vertical route in two columns on tablet */}
      <ol className="relative mt-8 grid gap-x-10 sm:grid-cols-2 lg:hidden">
        {businessRoute.map((s, i) => {
          const d = divisions[s.division];
          return (
            <li key={s.stage} className="relative pl-8">
              <span aria-hidden className="absolute bottom-0 left-[7px] top-0 w-0.5 bg-harbour-line" />
              <span aria-hidden className="absolute left-0 top-[14px] size-4 rounded-full border-2 border-gold-bright bg-midnight" />
              <Link href={d.href} className="flex items-baseline gap-3 py-2.5">
                <span className="w-5 text-xs tabular-nums text-mist">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-semibold text-white">{s.stage}</span>
                <span className="ml-auto text-xs text-mist">{d.short}</span>
              </Link>
            </li>
          );
        })}
      </ol>

      {/* Key */}
      <div className="mt-10 flex flex-col gap-5 border-t border-harbour pt-6">
        <ul className="flex flex-wrap gap-2" aria-label="Divisions on the route">
          {legend.map((k) => (
            <li key={k}>
              <Link
                href={divisions[k].href}
                onMouseEnter={() => setFocus(k)}
                onMouseLeave={() => setFocus(null)}
                onFocus={() => setFocus(k)}
                onBlur={() => setFocus(null)}
                className={cx(
                  "inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors",
                  focus === k ? "border-gold-bright bg-gold-bright text-midnight" : "border-harbour-line text-fog hover:border-mist",
                )}
              >
                {divisions[k].name}
              </Link>
            </li>
          ))}
        </ul>
        <p className="flex items-center gap-3 text-sm text-mist">
          <span aria-hidden className="h-0 w-10 shrink-0 border-t-2 border-dashed border-brass-bright" />
          <span>
            Alongside every stage,{" "}
            <Link href="/promote" className="font-semibold text-white underline decoration-brass-bright/60 underline-offset-4 hover:decoration-brass-bright">
              Business Promotion
            </Link>{" "}
            connects builders with the companies that serve them.
          </span>
        </p>
      </div>
    </div>
  );
}
