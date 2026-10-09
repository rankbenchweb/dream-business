/**
 * Directory listings and business profiles: shared types, labels and
 * validation. Used by forms in the browser and by server actions, so the
 * same rules apply in both places. The database enforces them again.
 */
import { markets } from "./markets";

export type OrgRole = "owner" | "admin" | "editor" | "campaign_manager" | "analyst";
export type ListingStatus = "draft" | "submitted" | "published" | "rejected" | "archived";

export const roleLabel: Record<OrgRole, string> = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  campaign_manager: "Campaign manager",
  analyst: "Analyst",
};

export const canEditListings = (role: OrgRole) => role === "owner" || role === "admin" || role === "editor";

export const listingStatusLabel: Record<ListingStatus, string> = {
  draft: "Draft",
  submitted: "In review",
  published: "Live in the directory",
  rejected: "Changes needed",
  archived: "Archived",
};

export const listingStatusHelp: Record<ListingStatus, string> = {
  draft: "Only your team can see it. Submit it when it's ready.",
  submitted: "We're reviewing it against our listing standards.",
  published: "Visible to everyone in the directory. Edits send it back for review.",
  rejected: "See the note from our reviewers, make changes and submit again.",
  archived: "Hidden from the directory. Restore it as a draft at any time.",
};

/** Markets a listing can say it serves ("global" means worldwide). */
export const serviceMarkets = markets.map((m) => ({ code: m.code, label: m.code === "global" ? "Worldwide" : m.label }));

export type Category = { id: number; slug: string; name: string };
export type MyOrgOption = { id: string; name: string };

export type OrgInput = { name: string; website: string; country: string };
export type OrgErrors = Partial<Record<keyof OrgInput, string>>;

export type ListingInput = {
  categoryId: string;
  name: string;
  summary: string;
  description: string;
  website: string;
  headquarters: string;
  servesMarkets: string[];
};
export type ListingErrors = Partial<Record<keyof ListingInput, string>>;

/** Accepts "company.com" or a full address; returns the https URL, "" when empty, or null when invalid. */
export function httpsUrl(raw: string): string | null {
  const v = raw.trim();
  if (!v) return "";
  if (/^http:\/\//i.test(v)) return null;
  try {
    const u = new URL(/^https:\/\//i.test(v) ? v : `https://${v}`);
    if (u.protocol !== "https:" || !u.hostname.includes(".") || u.username || u.password) return null;
    const s = u.toString();
    return s.length <= 500 ? s : null;
  } catch {
    return null;
  }
}

export function validateOrg(i: OrgInput): OrgErrors {
  const e: OrgErrors = {};
  const name = i.name.trim();
  if (name.length < 2) e.name = "Enter your business name.";
  else if (name.length > 160) e.name = "Use 160 characters or fewer.";
  if (httpsUrl(i.website) === null) e.website = "Enter a secure website address (https), like company.com.";
  if (i.country.trim().length > 80) e.country = "Use 80 characters or fewer.";
  return e;
}

export function validateListing(i: ListingInput, categoryIds: number[]): ListingErrors {
  const e: ListingErrors = {};
  if (!categoryIds.includes(Number(i.categoryId))) e.categoryId = "Choose the category that fits best.";
  const name = i.name.trim();
  if (name.length < 2) e.name = "Enter the name customers know you by.";
  else if (name.length > 160) e.name = "Use 160 characters or fewer.";
  const summary = i.summary.trim();
  if (summary.length < 20) e.summary = "Describe what you offer in at least 20 characters.";
  else if (summary.length > 280) e.summary = "Keep the summary to 280 characters.";
  if (i.description.trim().length > 5000) e.description = "Keep the description under 5,000 characters.";
  const site = httpsUrl(i.website);
  if (!site) e.website = "Enter your website's secure address (https), like company.com.";
  if (i.headquarters.trim().length > 80) e.headquarters = "Use 80 characters or fewer.";
  const codes = new Set(serviceMarkets.map((m) => m.code));
  if (!i.servesMarkets.length) e.servesMarkets = "Choose at least one market you serve.";
  else if (i.servesMarkets.some((c) => !codes.has(c))) e.servesMarkets = "Choose from the listed markets.";
  return e;
}

export function slugify(name: string): string {
  const s = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return s.length >= 3 ? s : `business-${s || "listing"}`.slice(0, 60);
}

export function listingFromForm(f: FormData): ListingInput {
  const str = (k: string) => String(f.get(k) ?? "");
  return {
    categoryId: str("categoryId"),
    name: str("name"),
    summary: str("summary"),
    description: str("description"),
    website: str("website"),
    headquarters: str("headquarters"),
    servesMarkets: f.getAll("servesMarkets").map(String),
  };
}
