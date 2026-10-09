-- The Dream Business: team invitations for business profiles.
-- NOT YET APPLIED. Additive only; requires 20261010000000_stage2_accounts_directory_campaigns.sql.
--
-- An owner or admin invites a colleague by email with a role. No email is sent
-- by the database: the invited person signs in with that email address and
-- accepts the invitation from their account page. Owners can't be invited;
-- an owner promotes a member after they join.

create table public.organization_invitations (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  email            text not null check (email = lower(email) and email ~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' and char_length(email) <= 320),
  role             public.org_role not null check (role <> 'owner'),
  invited_by       uuid references auth.users (id) on delete set null default auth.uid(),
  created_at       timestamptz not null default now(),
  expires_at       timestamptz not null default now() + interval '14 days',
  accepted_at      timestamptz,
  closed_at        timestamptz,
  check (accepted_at is null or closed_at is null)
);

-- One open invitation per email per organization.
create unique index organization_invitations_open_idx
  on public.organization_invitations (organization_id, email)
  where accepted_at is null and closed_at is null;
create index organization_invitations_email_idx on public.organization_invitations (email) where accepted_at is null and closed_at is null;

-- The signed-in person's email, from their verified session.
create or replace function private.my_email()
returns text
language sql
stable
set search_path = ''
as $$
  select lower(nullif((select auth.jwt()) ->> 'email', ''));
$$;
revoke all on function private.my_email() from public;
grant execute on function private.my_email() to authenticated, service_role;

alter table public.organization_invitations enable row level security;

create policy "invitations: owners and admins see their organization's" on public.organization_invitations
  for select to authenticated
  using (private.has_org_role(organization_id, array['owner', 'admin']::public.org_role[]));
create policy "invitations: invitees see their own" on public.organization_invitations
  for select to authenticated
  using (email = private.my_email());
create policy "invitations: owners and admins invite" on public.organization_invitations
  for insert to authenticated
  with check (
    invited_by = (select auth.uid())
    and accepted_at is null and closed_at is null
    and private.has_org_role(organization_id, array['owner', 'admin']::public.org_role[])
  );
-- No update or delete policies: invitations change only through the functions below.

-- Accept: adds the signed-in person to the organization with the invited role.
create or replace function public.accept_invitation(invitation_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  inv public.organization_invitations;
begin
  select * into inv from public.organization_invitations where id = invitation_id for update;
  if inv.id is null or inv.email is distinct from private.my_email() then
    raise exception 'Invitation not found' using errcode = 'P0002';
  end if;
  if inv.accepted_at is not null or inv.closed_at is not null then
    raise exception 'This invitation is no longer open' using errcode = 'P0001';
  end if;
  if inv.expires_at < now() then
    raise exception 'This invitation has expired' using errcode = 'P0001';
  end if;
  insert into public.organization_members (organization_id, user_id, role)
  values (inv.organization_id, (select auth.uid()), inv.role)
  on conflict (organization_id, user_id) do nothing;
  update public.organization_invitations set accepted_at = now() where id = inv.id;
  return inv.organization_id;
end;
$$;

-- Close: the invitee declines, or an owner/admin cancels.
create or replace function public.close_invitation(invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  inv public.organization_invitations;
begin
  select * into inv from public.organization_invitations where id = invitation_id for update;
  if inv.id is null or not (
       inv.email = private.my_email()
       or private.has_org_role(inv.organization_id, array['owner', 'admin']::public.org_role[])
     ) then
    raise exception 'Invitation not found' using errcode = 'P0002';
  end if;
  if inv.accepted_at is null and inv.closed_at is null then
    update public.organization_invitations set closed_at = now() where id = inv.id;
  end if;
end;
$$;

-- Team list with emails, for members of the organization only.
create or replace function public.organization_team(org uuid)
returns table (user_id uuid, email text, role public.org_role, joined_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select m.user_id, u.email::text, m.role, m.created_at
  from public.organization_members m
  join auth.users u on u.id = m.user_id
  where m.organization_id = org and private.is_org_member(org)
  order by m.created_at;
$$;

-- Open invitations for the signed-in person, with the business name (which
-- they can't otherwise read before joining).
create or replace function public.my_invitations()
returns table (id uuid, organization_name text, role public.org_role, expires_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select i.id, o.name, i.role, i.expires_at
  from public.organization_invitations i
  join public.organizations o on o.id = i.organization_id
  where i.email = private.my_email() and i.accepted_at is null and i.closed_at is null and i.expires_at > now()
  order by i.created_at;
$$;

revoke all on function public.my_invitations() from public, anon;
grant execute on function public.my_invitations() to authenticated;
revoke all on function public.accept_invitation(uuid) from public, anon;
revoke all on function public.close_invitation(uuid) from public, anon;
revoke all on function public.organization_team(uuid) from public, anon;
grant execute on function public.accept_invitation(uuid) to authenticated;
grant execute on function public.close_invitation(uuid) to authenticated;
grant execute on function public.organization_team(uuid) to authenticated;

revoke all on public.organization_invitations from anon, authenticated;
grant select, insert on public.organization_invitations to authenticated;
