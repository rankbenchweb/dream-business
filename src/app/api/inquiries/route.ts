import { normaliseUrl, validateInquiry, type InquiryInput } from "@/lib/inquiry";

/**
 * Receives promotion, listing and contact inquiries.
 *
 * Storage is configured with environment variables (server-only):
 *   SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY  -> inserts into public.inquiries
 *   INQUIRY_WEBHOOK_URL                        -> POSTs JSON (e.g. an n8n webhook)
 * Both can be set. If neither is set the endpoint answers 503 and the form
 * tells the visitor plainly that inquiries are not being accepted yet.
 */

const recent = new Map<string, number[]>();
function rateLimited(key: string) {
  // Best-effort per-instance limit: 5 submissions per 10 minutes.
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((t) => now - t < 10 * 60_000);
  hits.push(now);
  recent.set(key, hits);
  return hits.length > 5;
}

const str = (v: unknown, max = 4000) => (typeof v === "string" ? v.slice(0, max) : "");

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "The request could not be read. Refresh the page and try again." }, { status: 400 });
  }

  const input: InquiryInput = {
    type: str(body.type, 40),
    name: str(body.name, 200),
    email: str(body.email, 320),
    company: str(body.company, 200),
    website: str(body.website, 500),
    country: str(body.country, 100),
    promote: str(body.promote, 100),
    budget: str(body.budget, 60),
    message: str(body.message, 5000),
    consent: body.consent === true,
    fax: str(body.fax, 200),
  };

  // Honeypot filled: accept silently so bots get no signal.
  if (input.fax) return Response.json({ ok: true });

  const errors = validateInquiry(input);
  if (Object.keys(errors).length) {
    return Response.json({ error: "Some details need attention.", fields: errors }, { status: 422 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return Response.json({ error: "Too many submissions from this connection. Try again in a few minutes." }, { status: 429 });
  }

  const record = {
    type: input.type,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    company: input.company.trim() || null,
    website: normaliseUrl(input.website) || null,
    country: input.country.trim() || null,
    promote: input.promote.trim() || null,
    budget: input.budget.trim() || null,
    message: input.message.trim(),
    source_path: str(body.sourcePath, 200) || null,
  };

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const webhook = process.env.INQUIRY_WEBHOOK_URL;

  if (!(supabaseUrl && serviceKey) && !webhook) {
    return Response.json(
      { error: "Online inquiries are not switched on yet. Please check back soon.", code: "not_configured" },
      { status: 503 },
    );
  }

  try {
    if (supabaseUrl && serviceKey) {
      const res = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/inquiries`, {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(record),
      });
      if (!res.ok) throw new Error(`storage responded ${res.status}`);
    }
    if (webhook) {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...record, received_at: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error(`webhook responded ${res.status}`);
    }
  } catch (err) {
    console.error("inquiry delivery failed:", (err as Error).message);
    return Response.json(
      { error: "Your inquiry couldn't be saved because of a problem on our side. Please try again shortly." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true }, { status: 201 });
}
