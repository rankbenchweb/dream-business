import "server-only";
import type { Category, ListingStatus, OrgRole } from "./listings";
import { createClient } from "./supabase/server";

export type MyOrg = { id: string; name: string; slug: string; website: string | null; country: string | null; role: OrgRole };
export type MyListing = {
  id: string;
  organization_id: string;
  category_id: number;
  name: string;
  slug: string;
  summary: string;
  description: string | null;
  website: string;
  headquarters: string | null;
  serves_markets: string[];
  status: ListingStatus;
  moderation_note: string | null;
  verification: "unverified" | "verified";
  updated_at: string;
};

const LISTING_COLUMNS =
  "id,organization_id,category_id,name,slug,summary,description,website,headquarters,serves_markets,status,moderation_note,verification,updated_at";

/** Every read here runs as the signed-in person, so RLS limits it to their own data. */
export async function getMyOrganizations(userId: string): Promise<MyOrg[]> {
  const supabase = await createClient();
  const { data: memberships, error } = await supabase.from("organization_members").select("organization_id,role").eq("user_id", userId);
  if (error) throw new Error(`memberships: ${error.message}`);
  if (!memberships?.length) return [];
  const ids = memberships.map((m) => m.organization_id as string);
  const { data: orgs, error: e2 } = await supabase.from("organizations").select("id,name,slug,website,country").in("id", ids).order("name");
  if (e2) throw new Error(`organizations: ${e2.message}`);
  const roleOf = new Map(memberships.map((m) => [m.organization_id as string, m.role as OrgRole]));
  return (orgs ?? []).map((o) => ({ ...(o as Omit<MyOrg, "role">), role: roleOf.get(o.id as string)! }));
}

export async function getListingsForOrgs(orgIds: string[]): Promise<MyListing[]> {
  if (!orgIds.length) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("business_listings").select(LISTING_COLUMNS).in("organization_id", orgIds).order("updated_at", { ascending: false });
  if (error) throw new Error(`listings: ${error.message}`);
  return (data ?? []) as MyListing[];
}

export async function getListing(id: string): Promise<MyListing | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("business_listings").select(LISTING_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw new Error(`listing: ${error.message}`);
  return (data as MyListing | null) ?? null;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("listing_categories").select("id,slug,name").order("sort_order");
  if (error) throw new Error(`categories: ${error.message}`);
  return (data ?? []) as Category[];
}
