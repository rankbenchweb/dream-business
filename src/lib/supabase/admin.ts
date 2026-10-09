import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./config";

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/** Staff tools need the service role key, which bypasses RLS. Server only. */
export const staffToolsConfigured = Boolean(supabaseUrl && serviceKey);

export function createAdminClient() {
  if (!staffToolsConfigured) throw new Error("Staff tools are not configured");
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
}
