import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag, updateTag } from "next/cache";
import { createAdminClient, staffToolsConfigured } from "./supabase/admin";
import { accountsEnabled, supabasePublishableKey, supabaseUrl } from "./supabase/config";

export type DirectoryListing = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  website: string;
  headquarters: string | null;
  serves_markets: string[];
  verification: "unverified" | "verified";
  verified_scope: string | null;
  category_id: number;
  published_at: string;
};

/** A live, staff-approved featured-listing campaign. Only public-safe fields. */
export type SponsoredPlacement = {
  campaign_id: string;
  listing_id: string;
  headline: string;
  body: string | null;
  destination_url: string;
  starts_on: string | null;
  ends_on: string | null;
};

export type Directory = {
  ok: boolean;
  categories: { id: number; slug: string; name: string }[];
  listings: DirectoryListing[];
  sponsored: SponsoredPlacement[];
};

export const DIRECTORY_TAG = "directory";

/** Published listings, read with the public key (RLS shows only published rows). */
export async function getDirectory(): Promise<Directory> {
  "use cache";
  cacheTag(DIRECTORY_TAG);
  cacheLife("minutes");
  if (!accountsEnabled) return { ok: false, categories: [], listings: [], sponsored: [] };
  try {
    const supabase = createClient(supabaseUrl, supabasePublishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      // Only this function's tagged cache may hold directory data; the raw requests must not be cached separately.
      global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
    });
    const [cats, rows] = await Promise.all([
      supabase.from("listing_categories").select("id,slug,name").order("sort_order"),
      supabase
        .from("business_listings")
        .select("id,name,slug,summary,website,headquarters,serves_markets,verification,verified_scope,category_id,published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(500),
    ]);
    if (cats.error || rows.error) throw new Error(cats.error?.message ?? rows.error?.message);
    const listings = (rows.data ?? []) as DirectoryListing[];
    return { ok: true, categories: cats.data ?? [], listings, sponsored: await getSponsored(new Set(listings.map((l) => l.id))) };
  } catch (e) {
    console.error("directory read failed:", e instanceof Error ? e.message : e);
    return { ok: false, categories: [], listings: [], sponsored: [] };
  }
}

/**
 * Campaigns are private to their business, so live placements are read
 * server-side with the service key and reduced to public-safe fields. Only
 * featured-listing campaigns whose listing is published are returned; date
 * windows are applied per request by the page.
 */
async function getSponsored(published: Set<string>): Promise<SponsoredPlacement[]> {
  if (!staffToolsConfigured) return [];
  const { data, error } = await createAdminClient()
    .from("campaigns")
    .select("id,listing_id,headline,body,destination_url,starts_on,ends_on")
    .eq("status", "live")
    .eq("placement", "directory_featured")
    .limit(50);
  if (error) {
    console.error("sponsored read failed:", error.message);
    return [];
  }
  return (data ?? [])
    .filter((c) => c.listing_id && published.has(c.listing_id as string))
    .map((c) => ({
      campaign_id: c.id as string,
      listing_id: c.listing_id as string,
      headline: c.headline as string,
      body: (c.body as string | null) ?? null,
      destination_url: c.destination_url as string,
      starts_on: (c.starts_on as string | null) ?? null,
      ends_on: (c.ends_on as string | null) ?? null,
    }));
}

/** Is a placement running on this date (YYYY-MM-DD, UTC)? */
export function isRunning(p: Pick<SponsoredPlacement, "starts_on" | "ends_on">, today: string): boolean {
  return (!p.starts_on || p.starts_on <= today) && (!p.ends_on || p.ends_on >= today);
}

/** Call from Server Actions after a listing's public visibility changes. */
export function refreshDirectory() {
  updateTag(DIRECTORY_TAG);
}
