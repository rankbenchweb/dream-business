import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/auth";
import { accountsEnabled } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/** The sign-in email links here with a one-time code. */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = safeNext(url.searchParams.get("next"));
  const code = url.searchParams.get("code");
  if (!accountsEnabled || !code) return NextResponse.redirect(new URL("/sign-in?error=link", url.origin), 303);

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("sign-in link exchange failed:", error.status, error.message);
    return NextResponse.redirect(new URL(`/sign-in?error=link&next=${encodeURIComponent(next)}`, url.origin), 303);
  }
  return NextResponse.redirect(new URL(next, url.origin), 303);
}
