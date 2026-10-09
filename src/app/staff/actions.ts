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
