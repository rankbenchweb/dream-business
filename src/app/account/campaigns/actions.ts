"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getCampaign, getListingsForOrgs, getMyOrganizations } from "@/lib/accountData";
import { campaignFromForm, canManageCampaigns, validateCampaign, type CampaignErrors, type CampaignInput } from "@/lib/campaigns";
import { httpsUrl } from "@/lib/listings";
import { refreshDirectory } from "@/lib/directory";
import { createClient } from "@/lib/supabase/server";

const GENERIC = "Something went wrong on our side. Please try again in a moment.";

/** Today's date in UTC as YYYY-MM-DD. */
const todayUtc = () => new Date().toISOString().slice(0, 10);

export type CampaignState = { errors?: CampaignErrors; error?: string; values?: CampaignInput };

export async function saveCampaign(_: CampaignState, form: FormData): Promise<CampaignState> {
  const campaignId = String(form.get("campaignId") ?? "");
  const user = await requireUser(campaignId ? `/account/campaign?id=${campaignId}` : "/account/campaigns/new");
  const intent = form.get("intent") === "submit" ? "submit" : "draft";
  const input = campaignFromForm(form);

  const existing = campaignId ? await getCampaign(campaignId) : null;
  if (campaignId && !existing) return { error: "This campaign doesn't exist or you don't have access to it.", values: input };
  const orgId = existing?.organization_id ?? String(form.get("organizationId") ?? "");
  const org = (await getMyOrganizations(user.id)).find((o) => o.id === orgId);
  if (!org || !canManageCampaigns(org.role)) return { error: "Choose a business you're allowed to create campaigns for.", values: input };

  const published = (await getListingsForOrgs([org.id])).filter((l) => l.status === "published").map((l) => l.id);
  const errors = validateCampaign(input, published, todayUtc());
  if (Object.keys(errors).length) return { errors, values: input };

  const fields = {
    name: input.name.trim(),
    tier: input.tier,
    placement: input.placement,
    listing_id: input.listingId || null,
    destination_url: httpsUrl(input.destinationUrl)!,
    headline: input.headline.trim(),
    body: input.body.trim() || null,
    starts_on: input.startsOn || null,
    ends_on: input.endsOn || null,
    budget_note: input.budgetNote.trim() || null,
  };
  const supabase = await createClient();

  if (existing) {
    const status = intent === "submit" && (existing.status === "draft" || existing.status === "rejected") ? "submitted" : existing.status;
    const { data, error } = await supabase.from("campaigns").update({ ...fields, status }).eq("id", existing.id).select("id,status");
    if (error || !data?.length) {
      if (error) console.error("update campaign failed:", error.code, error.message);
      return { error: error ? GENERIC : "You don't have permission to edit this campaign.", values: input };
    }
    const now = data[0].status as string;
    if (existing.status === "live") refreshDirectory(); // changes take a live placement down until re-approved
    redirect(`/account?notice=${now === "submitted" ? "campaign-submitted" : "campaign-saved"}`);
  }

  const { error } = await supabase
    .from("campaigns")
    .insert({ ...fields, organization_id: org.id, status: intent === "submit" ? "submitted" : "draft" })
    .select("id")
    .single();
  if (error) {
    console.error("create campaign failed:", error.code, error.message);
    return { error: GENERIC, values: input };
  }
  redirect(`/account?notice=${intent === "submit" ? "campaign-submitted" : "campaign-saved"}`);
}

const MOVES: Record<string, { to: string | null; from: string[]; notice: string }> = {
  withdraw: { to: "draft", from: ["submitted"], notice: "campaign-withdrawn" },
  pause: { to: "paused", from: ["live"], notice: "campaign-paused" },
  delete: { to: null, from: ["draft", "rejected"], notice: "campaign-deleted" },
};

export async function changeCampaignStatus(form: FormData): Promise<void> {
  const id = String(form.get("campaignId") ?? "");
  await requireUser(`/account/campaign?id=${id}`);
  const move = MOVES[String(form.get("move") ?? "")];
  const current = await getCampaign(id);
  if (!move || !current || !move.from.includes(current.status)) redirect("/account?notice=not-allowed");
  const supabase = await createClient();
  const q = move.to ? supabase.from("campaigns").update({ status: move.to }) : supabase.from("campaigns").delete();
  const { data, error } = await q.eq("id", id).select("id");
  if (error) console.error("campaign change failed:", error.code, error.message);
  if (!error && current.status === "live") refreshDirectory();
  redirect(`/account?notice=${!error && data?.length ? move.notice : "not-allowed"}`);
}
