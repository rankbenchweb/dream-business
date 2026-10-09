/**
 * Accounts are switched on only when Supabase is configured. With nothing
 * set, account pages explain that accounts are not open yet and no sign-in
 * links are shown anywhere.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const accountsEnabled = Boolean(supabaseUrl && supabasePublishableKey);

/** Where "list your business" links go: self-service when accounts are on, the inquiry form otherwise. */
export const listBusinessHref = accountsEnabled ? "/sign-in?next=/account/listings/new" : "/promote?type=directory#inquiry";
