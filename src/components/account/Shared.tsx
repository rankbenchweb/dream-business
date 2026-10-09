import type { ReactNode } from "react";
import { ButtonLink, cx } from "@/components/ui";
import { listingStatusLabel, type ListingStatus } from "@/lib/listings";

/** Shown on account pages while Supabase isn't configured. */
export function AccountsClosed() {
  return (
    <div className="max-w-[44rem] rounded-[var(--radius-md)] border border-line bg-surface p-8">
      <h2 className="text-xl">Business accounts open soon</h2>
      <p className="mt-3 text-slate">
        Accounts for managing directory listings aren&apos;t open yet. Until they are, request a free listing and our team will set it up with you by
        email.
      </p>
      <ButtonLink href="/promote?type=directory#inquiry" className="mt-6">
        Request a free listing
      </ButtonLink>
    </div>
  );
}

const statusTone: Record<ListingStatus, string> = {
  draft: "bg-paper text-slate ring-line-strong",
  submitted: "bg-gold-soft text-gold-strong ring-gold/30",
  published: "bg-success/10 text-success ring-success/30",
  rejected: "bg-danger/5 text-danger ring-danger/30",
  archived: "bg-paper text-muted ring-line",
};

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  return (
    <span className={cx("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1", statusTone[status])}>
      {listingStatusLabel[status]}
    </span>
  );
}

const notices: Record<string, { text: string; tone: "ok" | "warn" }> = {
  "org-created": { text: "Business profile created. You can now add a directory listing.", tone: "ok" },
  "listing-saved": { text: "Listing saved as a draft.", tone: "ok" },
  "listing-submitted": { text: "Listing submitted. We'll review it against our listing standards and email you the outcome.", tone: "ok" },
  "listing-withdrawn": { text: "Listing withdrawn from review and returned to draft.", tone: "ok" },
  "listing-archived": { text: "Listing archived and removed from the directory.", tone: "ok" },
  "listing-restored": { text: "Listing restored as a draft.", tone: "ok" },
  "not-allowed": { text: "That change isn't allowed.", tone: "warn" },
  invited: { text: "Invitation saved. Ask them to sign in with that email address to accept it.", tone: "ok" },
  "invite-cancelled": { text: "Invitation cancelled.", tone: "ok" },
  "invite-accepted": { text: "Invitation accepted. You're now part of the team.", tone: "ok" },
  "invite-declined": { text: "Invitation declined.", tone: "ok" },
  "invite-expired": { text: "That invitation has expired. Ask the business to invite you again.", tone: "warn" },
  "invite-unavailable": { text: "That invitation is no longer available.", tone: "warn" },
  "campaign-saved": { text: "Campaign saved as a draft.", tone: "ok" },
  "campaign-submitted": { text: "Campaign submitted. We'll review it and contact you about dates and price before anything runs.", tone: "ok" },
  "campaign-withdrawn": { text: "Campaign withdrawn from review and returned to draft.", tone: "ok" },
  "campaign-paused": { text: "Campaign paused.", tone: "ok" },
  "campaign-deleted": { text: "Draft campaign deleted.", tone: "ok" },
  approve: { text: "Campaign approved. Contact the advertiser to confirm dates and price.", tone: "ok" },
  "return-campaign": { text: "Campaign returned with your note.", tone: "ok" },
  "go-live": { text: "Campaign marked as live.", tone: "ok" },
  "staff-pause": { text: "Campaign paused.", tone: "ok" },
  end: { text: "Campaign ended.", tone: "ok" },
  "role-changed": { text: "Role updated.", tone: "ok" },
  "member-removed": { text: "Member removed.", tone: "ok" },
  "left-team": { text: "You've left that business.", tone: "ok" },
  "last-owner": { text: "A business must keep at least one owner. Make someone else an owner first.", tone: "warn" },
  publish: { text: "Listing published to the directory.", tone: "ok" },
  reject: { text: "Listing returned with your note.", tone: "ok" },
  verify: { text: "Listing marked as verified.", tone: "ok" },
  unverify: { text: "Verification removed.", tone: "ok" },
  "note-needed": { text: "Add a note of at least 10 characters explaining what needs to change.", tone: "warn" },
  "scope-needed": { text: "Describe what was verified in at least 10 characters, for example \"Company registration checked\".", tone: "warn" },
  failed: { text: "That change couldn't be saved. Try again.", tone: "warn" },
  invalid: { text: "That request wasn't valid.", tone: "warn" },
};

export function Notice({ code }: { code?: string }) {
  const n = code ? notices[code] : undefined;
  if (!n) return null;
  return (
    <p
      role="status"
      className={cx(
        "mb-8 rounded-[var(--radius-sm)] border px-4 py-3 text-sm font-medium",
        n.tone === "ok" ? "border-success/30 bg-success/5 text-success" : "border-danger/30 bg-danger/5 text-danger",
      )}
    >
      {n.text}
    </p>
  );
}

export function Loading({ children = "Loading your account…" }: { children?: ReactNode }) {
  return (
    <p className="text-sm text-muted" aria-live="polite">
      {children}
    </p>
  );
}
