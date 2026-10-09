"use client";

import type { ReactNode } from "react";
import { cx } from "@/components/ui";

export const INQUIRY_TYPE_EVENT = "tdb:inquiry-type";

/**
 * Jumps to the inquiry form on the same page and presets its subject.
 * Works as a normal link without JavaScript.
 */
export function InquiryTypeLink({ type, className, children }: { type: string; className?: string; children: ReactNode }) {
  const href = `?type=${encodeURIComponent(type)}#inquiry`;
  return (
    <a
      href={href}
      className={cx(className)}
      onClick={(e) => {
        const target = document.getElementById("inquiry");
        if (!target) return;
        e.preventDefault();
        window.history.replaceState(null, "", href);
        window.dispatchEvent(new CustomEvent(INQUIRY_TYPE_EVENT, { detail: type }));
        target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        window.setTimeout(() => target.querySelector<HTMLElement>("select[name=type]")?.focus({ preventScroll: true }), 400);
      }}
    >
      {children}
    </a>
  );
}
