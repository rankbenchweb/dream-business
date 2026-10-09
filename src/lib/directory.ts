import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag, updateTag } from "next/cache";
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

export type Directory = { ok: boolean; categories: { id: number; slug: string; name: string }[]; listings: DirectoryListing[] };

export const DIRECTORY_TAG = "directory";

/** Published listings, read with the public key (RLS shows only published rows). */
export async function getDirectory(): Promise<Directory> {
  "use cache";
  cacheTag(DIRECTORY_TAG);
  cacheLife("minutes");
  if (!accountsEnabled) return { ok: false, categories: [], listings: [] };
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
    return { ok: true, categories: cats.data ?? [], listings: (rows.data ?? []) as DirectoryListing[] };
  } catch (e) {
    console.error("directory read failed:", e instanceof Error ? e.message : e);
    return { ok: false, categories: [], listings: [] };
  }
}

/** Call from Server Actions after a listing's public visibility changes. */
export function refreshDirectory() {
  updateTag(DIRECTORY_TAG);
}
