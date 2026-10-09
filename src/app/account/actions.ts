"use server";

import { redirect } from "next/navigation";
import { requireUser, safeNext } from "@/lib/auth";
import { getCategories, getListing, getMyOrganizations } from "@/lib/accountData";
import { refreshDirectory } from "@/lib/directory";
import { canEditListings, httpsUrl, listingFromForm, slugify, validateListing, validateOrg, type ListingErrors, type ListingInput, type OrgErrors, type OrgInput } from "@/lib/listings";
import { siteOrigin } from "@/lib/origin";
import { accountsEnabled } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const GENERIC = "Something went wrong on our side. Please try again in a moment.";

export type SignInState = { sent?: string; error?: string; email?: string };

export async function sendSignInLink(_: SignInState, form: FormData): Promise<SignInState> {
  if (!accountsEnabled) return { error: "Business accounts aren't open yet." };
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 320) return { error: "Enter your email address, like name@company.com.", email };
  const next = safeNext(String(form.get("next") ?? ""));
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${await siteOrigin()}/auth/callback?next=${encodeURIComponent(next)}`, shouldCreateUser: true },
  });
  if (error) {
    console.error("sign-in link failed:", error.status, error.message);
    if (error.status === 429) return { error: "Too many sign-in emails were requested. Wait a minute and try again.", email };
    return { error: GENERIC, email };
  }
  return { sent: email };
}

export type OrgState = { errors?: OrgErrors; error?: string; values?: OrgInput };

export async function createOrganization(_: OrgState, form: FormData): Promise<OrgState> {
  await requireUser("/account/organizations/new");
  const input = { name: String(form.get("name") ?? ""), website: String(form.get("website") ?? ""), country: String(form.get("country") ?? "") };
  const errors = validateOrg(input);
  if (Object.keys(errors).length) return { errors, values: input };

  const supabase = await createClient();
  const base = slugify(input.name);
  for (let attempt = 0; attempt < 4; attempt++) {
    const slug = attempt === 0 ? base : `${base.slice(0, 55)}-${Math.random().toString(36).slice(2, 6)}`;
    const { error } = await supabase
      .from("organizations")
      .insert({ name: input.name.trim(), slug, website: httpsUrl(input.website) || null, country: input.country.trim() || null })
      .select("id")
      .single();
    if (!error) redirect("/account?notice=org-created");
    if (error.code !== "23505") {
      console.error("create organization failed:", error.code, error.message);
      return { error: GENERIC, values: input };
    }
  }
  return { error: GENERIC, values: input };
}

export type ListingState = { errors?: ListingErrors; error?: string; values?: ListingInput };

export async function saveListing(_: ListingState, form: FormData): Promise<ListingState> {
  const listingId = String(form.get("listingId") ?? "");
  const user = await requireUser(listingId ? `/account/listing?id=${listingId}` : "/account/listings/new");
  const intent = form.get("intent") === "submit" ? "submit" : "draft";
  const input = listingFromForm(form);
  const categories = await getCategories();
  const errors = validateListing(input, categories.map((c) => c.id));
  if (Object.keys(errors).length) return { errors, values: input };

  const fields = {
    category_id: Number(input.categoryId),
    name: input.name.trim(),
    summary: input.summary.trim(),
    description: input.description.trim() || null,
    website: httpsUrl(input.website)!,
    headquarters: input.headquarters.trim() || null,
    serves_markets: Array.from(new Set(input.servesMarkets)),
  };
  const supabase = await createClient();

  if (listingId) {
    const current = await getListing(listingId);
    if (!current) return { error: "This listing doesn't exist or you don't have access to it.", values: input };
    const status = intent === "submit" && (current.status === "draft" || current.status === "rejected") ? "submitted" : current.status;
    const { data, error } = await supabase.from("business_listings").update({ ...fields, status }).eq("id", listingId).select("id");
    if (error || !data?.length) {
      if (error) console.error("update listing failed:", error.code, error.message);
      return { error: error ? GENERIC : "You don't have permission to edit this listing.", values: input };
    }
    if (current.status === "published") refreshDirectory(); // edits take it out of the directory until re-approved
    redirect(`/account?notice=${current.status === "published" ? "listing-submitted" : intent === "submit" ? "listing-submitted" : "listing-saved"}`);
  }

  const orgId = String(form.get("organizationId") ?? "");
  const orgs = await getMyOrganizations(user.id);
  const org = orgs.find((o) => o.id === orgId);
  if (!org || !canEditListings(org.role)) return { error: "Choose a business you're allowed to create listings for.", values: input };

  const base = slugify(input.name);
  for (let attempt = 0; attempt < 4; attempt++) {
    const slug = attempt === 0 ? base : `${base.slice(0, 55)}-${Math.random().toString(36).slice(2, 6)}`;
    const { error } = await supabase
      .from("business_listings")
      .insert({ ...fields, organization_id: org.id, slug, status: intent === "submit" ? "submitted" : "draft" })
      .select("id")
      .single();
    if (!error) redirect(`/account?notice=${intent === "submit" ? "listing-submitted" : "listing-saved"}`);
    if (error.code !== "23505") {
      console.error("create listing failed:", error.code, error.message);
      return { error: GENERIC, values: input };
    }
  }
  return { error: GENERIC, values: input };
}

const MOVES: Record<string, { to: string; from: string[]; notice: string }> = {
  withdraw: { to: "draft", from: ["submitted"], notice: "listing-withdrawn" },
  archive: { to: "archived", from: ["draft", "submitted", "published", "rejected"], notice: "listing-archived" },
  restore: { to: "draft", from: ["archived"], notice: "listing-restored" },
};

export async function changeListingStatus(form: FormData): Promise<void> {
  const id = String(form.get("listingId") ?? "");
  await requireUser(`/account/listing?id=${id}`);
  const move = MOVES[String(form.get("move") ?? "")];
  const current = await getListing(id);
  if (!move || !current || !move.from.includes(current.status)) redirect("/account?notice=not-allowed");
  const supabase = await createClient();
  const { data, error } = await supabase.from("business_listings").update({ status: move.to }).eq("id", id).select("id");
  if (error) console.error("listing status change failed:", error.code, error.message);
  if (!error && current.status === "published") refreshDirectory();
  redirect(`/account?notice=${!error && data?.length ? move.notice : "not-allowed"}`);
}
