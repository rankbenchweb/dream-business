/**
 * Advertiser campaigns: labels, rules and validation shared by forms and
 * server actions. The database enforces the same rules again.
 */
import { httpsUrl, type OrgRole } from "./listings";

export type CampaignStatus = "draft" | "submitted" | "approved" | "rejected" | "live" | "paused" | "ended";
export type CampaignTier = "self_service" | "growth" | "enterprise";
export type Placement = "directory_featured" | "category_sponsor" | "tool_page_sponsor" | "sponsored_article" | "custom";

export const canManageCampaigns = (role: OrgRole) => role === "owner" || role === "admin" || role === "campaign_manager";
export const canViewCampaigns = (role: OrgRole) => canManageCampaigns(role) || role === "analyst";

export const tiers: { value: CampaignTier; label: string; detail: string }[] = [
  { value: "self_service", label: "Self-service promotion", detail: "For independent businesses, startups and creators." },
  { value: "growth", label: "Growth advertising", detail: "For established and growing companies." },
  { value: "enterprise", label: "Enterprise campaign", detail: "Custom proposals for larger companies." },
];

export const placements: { value: Placement; label: string; detail: string }[] = [
  { value: "directory_featured", label: "Featured directory listing", detail: "Your listing shown first in its category, labelled Sponsored." },
  { value: "category_sponsor", label: "Category sponsorship", detail: "Your brand on a directory category page, labelled Sponsored." },
  { value: "tool_page_sponsor", label: "Tool page sponsorship", detail: "A labelled placement beside a relevant business tool." },
  { value: "sponsored_article", label: "Sponsored article", detail: "An article about your business, clearly marked as paid." },
  { value: "custom", label: "Something else", detail: "Describe what you have in mind in the notes." },
];

export const campaignStatusLabel: Record<CampaignStatus, string> = {
  draft: "Draft",
  submitted: "In review",
  approved: "Approved",
  rejected: "Changes needed",
  live: "Live",
  paused: "Paused",
  ended: "Ended",
};

export const campaignStatusHelp: Record<CampaignStatus, string> = {
  draft: "Only your team can see it. Submit it when it's ready.",
  submitted: "We're reviewing it against our advertising standards.",
  approved: "Approved. We'll contact you to confirm dates and payment before it goes live.",
  rejected: "See the note from our reviewers, make changes and submit again.",
  live: "Running now. Changing it sends it back for review.",
  paused: "Paused. Contact us to restart it.",
  ended: "Finished.",
};

export type CampaignInput = {
  name: string;
  tier: string;
  placement: string;
  listingId: string;
  destinationUrl: string;
  headline: string;
  body: string;
  startsOn: string;
  endsOn: string;
  budgetNote: string;
};
export type CampaignErrors = Partial<Record<keyof CampaignInput, string>>;

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** `today` is YYYY-MM-DD; passed in so the rule is testable and timezone-explicit. */
export function validateCampaign(i: CampaignInput, listingIds: string[], today: string): CampaignErrors {
  const e: CampaignErrors = {};
  const name = i.name.trim();
  if (name.length < 2) e.name = "Give the campaign a name your team will recognise.";
  else if (name.length > 120) e.name = "Use 120 characters or fewer.";
  if (!tiers.some((t) => t.value === i.tier)) e.tier = "Choose an advertising level.";
  if (!placements.some((p) => p.value === i.placement)) e.placement = "Choose a placement.";
  if (i.listingId && !listingIds.includes(i.listingId)) e.listingId = "Choose one of your own listings.";
  if (i.placement === "directory_featured" && !i.listingId) e.listingId = "A featured listing needs one of your published listings.";
  if (!httpsUrl(i.destinationUrl)) e.destinationUrl = "Enter the secure (https) page people should visit.";
  const headline = i.headline.trim();
  if (headline.length < 5) e.headline = "Write a headline of at least 5 characters.";
  else if (headline.length > 90) e.headline = "Keep the headline to 90 characters.";
  if (i.body.trim().length > 280) e.body = "Keep the text to 280 characters.";
  if (i.startsOn && !DATE.test(i.startsOn)) e.startsOn = "Enter a valid date.";
  else if (i.startsOn && i.startsOn < today) e.startsOn = "Choose today or a later date.";
  if (i.endsOn && !DATE.test(i.endsOn)) e.endsOn = "Enter a valid date.";
  else if (i.endsOn && i.startsOn && i.endsOn < i.startsOn) e.endsOn = "The end date must be on or after the start date.";
  if (i.budgetNote.trim().length > 300) e.budgetNote = "Keep this to 300 characters.";
  return e;
}

export function campaignFromForm(f: FormData): CampaignInput {
  const str = (k: string) => String(f.get(k) ?? "");
  return {
    name: str("name"),
    tier: str("tier"),
    placement: str("placement"),
    listingId: str("listingId"),
    destinationUrl: str("destinationUrl"),
    headline: str("headline"),
    body: str("body"),
    startsOn: str("startsOn"),
    endsOn: str("endsOn"),
    budgetNote: str("budgetNote"),
  };
}
