import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { accountsEnabled, supabasePublishableKey, supabaseUrl } from "@/lib/supabase/config";

/**
 * Keeps the Supabase session fresh on account pages, so expired access
 * tokens are refreshed once and written back to cookies. Authorization is
 * still checked on the server for every page and action.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!accountsEnabled) return response;

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/account/:path*", "/staff/:path*", "/sign-in"],
};
