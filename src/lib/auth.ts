import "server-only";
import { redirect } from "next/navigation";
import { accountsEnabled } from "./supabase/config";
import { createClient } from "./supabase/server";

export type CurrentUser = { id: string; email: string };

/** The signed-in person, verified with the auth server, or null. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!accountsEnabled) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? "" };
}

export async function requireUser(next: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  return user;
}

/** Staff are listed by email in STAFF_EMAILS (comma separated). */
export function isStaffEmail(email: string): boolean {
  const list = (process.env.STAFF_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return !!email && list.includes(email.toLowerCase());
}

/** Only allow redirects to paths on this site. */
export function safeNext(raw: string | null | undefined, fallback = "/account"): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return fallback;
  return raw;
}
