"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getMyOrganizations } from "@/lib/accountData";
import { EMAIL_PATTERN, assignableRoles, canManageTeam, invitableRoles, type OrgRole } from "@/lib/listings";
import { createClient } from "@/lib/supabase/server";

const ID = /^[0-9a-f-]{36}$/i;
const back = (org: string, notice: string) => redirect(`/account/team?org=${org}&notice=${notice}`);

/** The signed-in person's role in an organization, or null. */
async function myRole(orgId: string): Promise<OrgRole | null> {
  const user = await requireUser(`/account/team?org=${orgId}`);
  const orgs = await getMyOrganizations(user.id);
  return orgs.find((o) => o.id === orgId)?.role ?? null;
}

export type InviteState = { error?: string; email?: string; role?: string };

export async function inviteMember(_: InviteState, form: FormData): Promise<InviteState> {
  const org = String(form.get("organizationId") ?? "");
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const role = String(form.get("role") ?? "");
  if (!ID.test(org)) return { error: "Something went wrong. Reload the page and try again." };
  const mine = await myRole(org);
  if (!mine || !canManageTeam(mine)) return { error: "Only owners and admins can invite people." };
  if (!EMAIL_PATTERN.test(email) || email.length > 320) return { error: "Enter their email address, like name@company.com.", email, role };
  if (!invitableRoles.some((r) => r.value === role)) return { error: "Choose a role.", email, role };

  const supabase = await createClient();
  const { error } = await supabase.from("organization_invitations").insert({ organization_id: org, email, role });
  if (error) {
    if (error.code === "23505") return { error: "There's already an open invitation for that email.", email, role };
    console.error("invite failed:", error.code, error.message);
    return { error: "The invitation couldn't be saved. Please try again.", email, role };
  }
  back(org, "invited");
  return {};
}

export async function cancelInvitation(form: FormData): Promise<void> {
  const org = String(form.get("organizationId") ?? "");
  const id = String(form.get("invitationId") ?? "");
  if (!ID.test(org) || !ID.test(id)) redirect("/account");
  await requireUser(`/account/team?org=${org}`);
  const supabase = await createClient();
  const { error } = await supabase.rpc("close_invitation", { invitation_id: id });
  if (error) console.error("cancel invitation failed:", error.code, error.message);
  back(org, error ? "not-allowed" : "invite-cancelled");
}

export async function respondToInvitation(form: FormData): Promise<void> {
  const id = String(form.get("invitationId") ?? "");
  const accept = form.get("answer") === "accept";
  if (!ID.test(id)) redirect("/account");
  await requireUser("/account");
  const supabase = await createClient();
  const { error } = await supabase.rpc(accept ? "accept_invitation" : "close_invitation", { invitation_id: id });
  if (error) {
    console.error("invitation response failed:", error.code, error.message);
    redirect(`/account?notice=${/expired/i.test(error.message) ? "invite-expired" : "invite-unavailable"}`);
  }
  redirect(`/account?notice=${accept ? "invite-accepted" : "invite-declined"}`);
}

export async function changeMemberRole(form: FormData): Promise<void> {
  const org = String(form.get("organizationId") ?? "");
  const member = String(form.get("userId") ?? "");
  const role = String(form.get("role") ?? "") as OrgRole;
  if (!ID.test(org) || !ID.test(member)) redirect("/account");
  const mine = await myRole(org);
  if (!mine || !assignableRoles(mine).includes(role)) back(org, "not-allowed");
  const supabase = await createClient();
  const { data, error } = await supabase.from("organization_members").update({ role }).eq("organization_id", org).eq("user_id", member).select("user_id");
  if (error) {
    console.error("role change failed:", error.code, error.message);
    back(org, /owner/i.test(error.message) ? "last-owner" : "not-allowed");
  }
  back(org, data?.length ? "role-changed" : "not-allowed");
}

export async function removeMember(form: FormData): Promise<void> {
  const org = String(form.get("organizationId") ?? "");
  const member = String(form.get("userId") ?? "");
  if (!ID.test(org) || !ID.test(member)) redirect("/account");
  const user = await requireUser(`/account/team?org=${org}`);
  const supabase = await createClient();
  const { data, error } = await supabase.from("organization_members").delete().eq("organization_id", org).eq("user_id", member).select("user_id");
  if (error) {
    console.error("remove member failed:", error.code, error.message);
    back(org, /owner/i.test(error.message) ? "last-owner" : "not-allowed");
  }
  if (!data?.length) back(org, "not-allowed");
  if (member === user.id) redirect("/account?notice=left-team");
  back(org, "member-removed");
}
