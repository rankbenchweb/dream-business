import { notFound } from "next/navigation";
import { Suspense } from "react";
import { cancelInvitation, changeMemberRole, removeMember } from "./actions";
import { InviteForm } from "@/components/account/Forms";
import { AccountsClosed, Loading, Notice } from "@/components/account/Shared";
import { PageHero, Section, TextLink } from "@/components/ui";
import { getMyOrganizations, getPendingInvites, getTeam } from "@/lib/accountData";
import { requireUser } from "@/lib/auth";
import { assignableRoles, canManageTeam, invitableRoles, roleLabel } from "@/lib/listings";
import { pageMetadata } from "@/lib/seo";
import { accountsEnabled } from "@/lib/supabase/config";

export const metadata = pageMetadata({
  title: "Team",
  description: "Manage who can work on your business profile.",
  path: "/account/team",
  noindex: true,
});

type Search = Promise<{ org?: string; notice?: string }>;

export default function TeamPage({ searchParams }: { searchParams: Search }) {
  return (
    <>
      <PageHero
        crumbs={[
          { name: "Your account", path: "/account" },
          { name: "Team", path: "/account" },
        ]}
        title="Your team"
        lead="Invite colleagues and choose what each person can do. Only owners and admins can change the team."
      />
      <Section tone="white">
        {accountsEnabled ? (
          <Suspense fallback={<Loading />}>
            <Body searchParams={searchParams} />
          </Suspense>
        ) : (
          <AccountsClosed />
        )}
      </Section>
    </>
  );
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const smallBtn = "inline-flex min-h-10 items-center justify-center rounded-[var(--radius-sm)] border border-line-strong bg-surface px-3 text-sm font-semibold text-ink hover:border-ink";
const selectCls = "h-10 rounded-[var(--radius-sm)] border border-line-strong bg-surface px-2 text-sm text-ink hover:border-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20";

async function Body({ searchParams }: { searchParams: Search }) {
  const { org: orgId = "", notice } = await searchParams;
  const user = await requireUser(`/account/team?org=${orgId}`);
  const org = (await getMyOrganizations(user.id)).find((o) => o.id === orgId);
  if (!org) notFound();
  const manage = canManageTeam(org.role);
  const [team, pending] = await Promise.all([getTeam(org.id), manage ? getPendingInvites(org.id) : Promise.resolve([])]);
  const roles = assignableRoles(org.role);

  return (
    <div className="max-w-[56rem]">
      <Notice code={notice} />
      <p className="text-sm text-muted">
        <TextLink href="/account">Your account</TextLink> / {org.name}
      </p>
      <h2 className="mt-3 text-2xl">{org.name}</h2>

      <section aria-labelledby="members-heading" className="mt-10">
        <h3 id="members-heading" className="text-lg">
          Members ({team.length})
        </h3>
        <ul className="mt-4 divide-y divide-line rounded-[var(--radius-md)] border border-line">
          {team.map((m) => {
            const self = m.user_id === user.id;
            const canChange = manage && !self && (org.role === "owner" || m.role !== "owner");
            return (
              <li key={m.user_id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <p className="break-all font-semibold text-ink">
                    {m.email}
                    {self ? <span className="ml-2 text-xs font-normal text-muted">(you)</span> : null}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    {roleLabel[m.role]} · Joined {dateFmt.format(new Date(m.joined_at))}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {canChange ? (
                    <form action={changeMemberRole} className="flex items-center gap-2">
                      <input type="hidden" name="organizationId" value={org.id} />
                      <input type="hidden" name="userId" value={m.user_id} />
                      <label htmlFor={`role-${m.user_id}`} className="sr-only">
                        Role for {m.email}
                      </label>
                      <select id={`role-${m.user_id}`} name="role" defaultValue={m.role} className={selectCls}>
                        {roles.map((r) => (
                          <option key={r} value={r}>
                            {roleLabel[r]}
                          </option>
                        ))}
                      </select>
                      <button className={smallBtn}>
                        Save<span className="sr-only"> role for {m.email}</span>
                      </button>
                    </form>
                  ) : null}
                  {canChange || self ? (
                    <form action={removeMember}>
                      <input type="hidden" name="organizationId" value={org.id} />
                      <input type="hidden" name="userId" value={m.user_id} />
                      <button className={`${smallBtn} text-danger`}>
                        {self ? "Leave this business" : "Remove"}
                        {self ? null : <span className="sr-only"> {m.email}</span>}
                      </button>
                    </form>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-muted">A business always keeps at least one owner. To hand over ownership, make someone else an owner first.</p>
      </section>

      {manage ? (
        <>
          <section aria-labelledby="invite-heading" className="mt-14 rounded-[var(--radius-md)] border border-line bg-paper p-6 sm:p-8">
            <h3 id="invite-heading" className="text-lg">
              Invite someone
            </h3>
            <p className="mt-2 max-w-[44rem] text-sm text-slate">
              We don&apos;t email invitations yet. After you invite someone, ask them to sign in at this site&apos;s sign-in page with the same email
              address; the invitation will be waiting on their account page for 14 days.
            </p>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              {invitableRoles.map((r) => (
                <div key={r.value}>
                  <dt className="font-semibold text-ink">{r.label}</dt>
                  <dd className="text-muted">{r.detail}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6">
              <InviteForm organizationId={org.id} />
            </div>
          </section>

          <section aria-labelledby="pending-heading" className="mt-12">
            <h3 id="pending-heading" className="text-lg">
              Waiting to be accepted ({pending.length})
            </h3>
            {pending.length ? (
              <ul className="mt-4 divide-y divide-line rounded-[var(--radius-md)] border border-line">
                {pending.map((i) => (
                  <li key={i.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="break-all font-semibold text-ink">{i.email}</p>
                      <p className="mt-0.5 text-sm text-muted">
                        {roleLabel[i.role]} · Expires {dateFmt.format(new Date(i.expires_at))}
                      </p>
                    </div>
                    <form action={cancelInvitation}>
                      <input type="hidden" name="organizationId" value={org.id} />
                      <input type="hidden" name="invitationId" value={i.id} />
                      <button className={smallBtn}>
                        Cancel invitation<span className="sr-only"> for {i.email}</span>
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted">No open invitations.</p>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
