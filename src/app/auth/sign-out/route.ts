import { NextResponse, type NextRequest } from "next/server";
import { accountsEnabled } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/** POST only, so a link or image elsewhere can't sign someone out. */
export async function POST(request: NextRequest) {
  if (accountsEnabled) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(new URL("/?signed-out=1", request.nextUrl.origin), 303);
}
