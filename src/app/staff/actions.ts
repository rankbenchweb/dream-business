"use server";

import { notFound, redirect } from "next/navigation";
import { getCurrentUser, isStaffEmail } from "@/lib/auth";
import { refreshDirectory } from "@/lib/directory";
import { createAdminClient, staffToolsConfigured } from "@/lib/supabase/admin";

async function requireStaff() {
  const user = await getCurrentUser();
  if (!user || !isStaffEmail(user.email) || !staffToolsConfigured) notFound();
  return user;
}

const ID = /^[0-9a-f-]{36}$/i;

export async function reviewListing(form: FormData): Promise<void> {
  await requireStaff();
  const id = String(form.get("listingId") ?? "");
  const decision = String(form.get("decision") ?? "");
  const note = String(form.get("note") ?? "").trim().slice(0, 1000);
  if (!ID.test(id)) redirect("/staff/review?notice=invalid");

  let update: Record<string, unknown>;
  if (decision === "publish") update = { status: "published" };
  else if (decision === "reject") {
    if (note.length < 10) redirect(`/staff/review?notice=note-needed#listing-${id}`);
    update = { status: "rejected", moderation_note: note };
  } else if (decision === "verify") {
    if (note.length < 10) redirect(`/staff/review?notice=scope-needed#listing-${id}`);
    update = { verification: "verified", verified_at: new Date().toISOString(), verified_scope: note.slice(0, 300) };
  } else if (decision === "unverify") update = { verification: "unverified", verified_at: null, verified_scope: null };
  else redirect("/staff/review?notice=invalid");

  const admin = createAdminClient();
  const { data, error } = await admin.from("business_listings").update(update).eq("id", id).select("id");
  if (error || !data?.length) {
    console.error("review failed:", error?.code, error?.message);
    redirect("/staff/review?notice=failed");
  }
  refreshDirectory();
  redirect(`/staff/review?notice=${decision}`);
}

const CAMPAIGN_DECISIONS: Record<string, { from: string[]; to: string; notice: string }> = {
  approve: { from: ["submitted"], to: "approved", notice: "approve" },
  return: { from: ["submitted", "approved"], to: "rejected", notice: "return-campaign" },
  live: { from: ["approved", "paused"], to: "live", notice: "go-live" },
  pause: { from: ["live"], to: "paused", notice: "staff-pause" },
  end: { from: ["approved", "live", "paused"], to: "ended", notice: "end" },
};

export async function reviewCampaign(form: FormData): Promise<void> {
  await requireStaff();
  const id = String(form.get("campaignId") ?? "");
  const d = CAMPAIGN_DECISIONS[String(form.get("decision") ?? "")];
  const note = String(form.get("note") ?? "").trim().slice(0, 1000);
  if (!ID.test(id) || !d) redirect("/staff/review?notice=invalid#campaigns");
  if (d.to === "rejected" && note.length < 10) redirect(`/staff/review?notice=note-needed#campaign-${id}`);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("campaigns")
    .update(d.to === "rejected" ? { status: d.to, review_note: note } : { status: d.to })
    .eq("id", id)
    .in("status", d.from)
    .select("id");
  if (error || !data?.length) {
    console.error("campaign review failed:", error?.code, error?.message);
    redirect("/staff/review?notice=failed#campaigns");
  }
  refreshDirectory();
  redirect(`/staff/review?notice=${d.notice}#campaigns`);
}
