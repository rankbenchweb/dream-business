import { cx } from "@/components/ui";

export type DisclosureKind = "verified" | "editorial" | "sponsored" | "affiliate" | "estimate";

export const disclosures: Record<DisclosureKind, { label: string; meaning: string }> = {
  verified: {
    label: "Verified",
    meaning: "We completed documented checks on this business. Verification cannot be bought.",
  },
  editorial: {
    label: "Editorial pick",
    meaning: "Chosen by our editors on merit. No payment influences it.",
  },
  sponsored: {
    label: "Sponsored",
    meaning: "The business paid for this placement. It passed review, but it is advertising.",
  },
  affiliate: {
    label: "Affiliate link",
    meaning: "We may earn a commission if you buy. It never changes rankings or recommendations.",
  },
  estimate: {
    label: "Estimate",
    meaning: "Calculated or AI-assisted, not verified fact. Assumptions are shown alongside.",
  },
};

const style: Record<DisclosureKind, string> = {
  verified: "border-success/40 text-success",
  editorial: "border-ink/30 text-ink",
  sponsored: "border-brass/50 text-[#7d5f24] bg-brass-soft",
  affiliate: "border-line-strong text-slate",
  estimate: "border-dashed border-line-strong text-slate",
};

/** Consistent disclosure label used wherever content is placed or recommended. */
export function DisclosureLabel({ kind, className }: { kind: DisclosureKind; className?: string }) {
  return (
    <span className={cx("inline-flex h-6 items-center rounded-[var(--radius-sm)] border px-2 text-xs font-semibold", style[kind], className)}>
      {disclosures[kind].label}
    </span>
  );
}
