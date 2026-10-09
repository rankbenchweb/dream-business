-- The Dream Business, Stage 2: accounts, organizations, directory listings,
-- campaigns and saved items.
--
-- NOT YET APPLIED. Additive only: creates new types, tables, functions and
-- policies; changes nothing that already exists. Review docs/database-stage2.md
-- before applying.
--
-- Principles
-- * A person (auth user + profile) is separate from the organization they
--   represent. Permissions come from organization_members.role.
-- * RLS is enabled on every table. The browser (anon or signed-in key) can only
--   do what a policy allows. Staff actions (approval, verification, metrics)
--   happen server-side with the service role, which bypasses RLS.
-- * Members can never publish, verify or approve their own records: guard
--   triggers block those columns for non-staff roles, whatever the client sends.
-- * No payment data is stored here.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

create type public.org_role as enum ('owner', 'admin', 'editor', 'campaign_manager', 'analyst');

-- True when the current request comes from the website's own server (service
-- role) or a database administrator rather than a browser session.
create or replace function private.is_staff()
returns boolean
language sql
stable
set search_path = ''
as $$
  select current_user not in ('anon', 'authenticated');
$$;

revoke all on function private.is_staff() from public;
grant execute on function private.is_staff() to anon, authenticated, service_role;

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles: one per signed-in person
-- ---------------------------------------------------------------------------

create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text check (char_length(display_name) between 1 and 120),
  market        text check (market ~ '^[a-z]{2,6}$'),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger profiles_touch before update on public.profiles
  for each row execute function private.touch_updated_at();

-- Create the profile when someone signs up.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "profiles: update own" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Organizations and membership
-- ---------------------------------------------------------------------------

create table public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 2 and 160),
  slug        text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$'),
  website     text check (website ~ '^https?://' and char_length(website) <= 500),
  country     text check (char_length(country) <= 80),
  created_by  uuid references auth.users (id) on delete set null default auth.uid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.organization_members (
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  user_id          uuid not null references auth.users (id) on delete cascade,
  role             public.org_role not null,
  created_at       timestamptz not null default now(),
  primary key (organization_id, user_id)
);
create index organization_members_user_idx on public.organization_members (user_id);

-- Does the signed-in user hold one of these roles in the organization?
-- SECURITY DEFINER so policies on organization_members don't recurse.
create or replace function private.has_org_role(org uuid, roles public.org_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = org
      and m.user_id = (select auth.uid())
      and m.role = any (roles)
  );
$$;

create or replace function private.is_org_member(org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = org and m.user_id = (select auth.uid())
  );
$$;

revoke all on function private.has_org_role(uuid, public.org_role[]) from public;
revoke all on function private.is_org_member(uuid) from public;
grant execute on function private.has_org_role(uuid, public.org_role[]) to anon, authenticated, service_role;
grant execute on function private.is_org_member(uuid) to anon, authenticated, service_role;

create trigger organizations_touch before update on public.organizations
  for each row execute function private.touch_updated_at();

-- Whoever creates an organization becomes its owner.
create or replace function private.add_creator_as_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.created_by is not null then
    insert into public.organization_members (organization_id, user_id, role)
    values (new.id, new.created_by, 'owner');
  end if;
  return new;
end;
$$;

create trigger organizations_add_owner after insert on public.organizations
  for each row execute function private.add_creator_as_owner();

-- An organization must always keep at least one owner.
create or replace function private.keep_an_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role = 'owner'
     and (tg_op = 'DELETE' or new.role <> 'owner')
     and exists (select 1 from public.organizations o where o.id = old.organization_id)
     and not exists (
       select 1 from public.organization_members m
       where m.organization_id = old.organization_id and m.role = 'owner' and m.user_id <> old.user_id
     ) then
    raise exception 'An organization must keep at least one owner';
  end if;
  return coalesce(new, old);
end;
$$;

create trigger organization_members_keep_owner before update or delete on public.organization_members
  for each row execute function private.keep_an_owner();

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

-- The creator can read the row too, so "insert ... returning" works before the
-- owner membership (added by the trigger below) is visible.
create policy "organizations: members and creator read" on public.organizations
  for select to authenticated using (private.is_org_member(id) or created_by = (select auth.uid()));
create policy "organizations: signed-in users create, as themselves" on public.organizations
  for insert to authenticated with check (created_by = (select auth.uid()));
create policy "organizations: owners and admins edit" on public.organizations
  for update to authenticated
  using (private.has_org_role(id, array['owner', 'admin']::public.org_role[]))
  with check (private.has_org_role(id, array['owner', 'admin']::public.org_role[]));
create policy "organizations: owners delete" on public.organizations
  for delete to authenticated using (private.has_org_role(id, array['owner']::public.org_role[]));

create policy "members: members see their colleagues" on public.organization_members
  for select to authenticated using (private.is_org_member(organization_id));
-- Owners manage every role. Admins manage everyone except owners, and can't create owners.
create policy "members: owners and admins add" on public.organization_members
  for insert to authenticated with check (
    private.has_org_role(organization_id, array['owner']::public.org_role[])
    or (role <> 'owner' and private.has_org_role(organization_id, array['admin']::public.org_role[]))
  );
create policy "members: owners and admins change roles" on public.organization_members
  for update to authenticated
  using (
    private.has_org_role(organization_id, array['owner']::public.org_role[])
    or (role <> 'owner' and private.has_org_role(organization_id, array['admin']::public.org_role[]))
  )
  with check (
    private.has_org_role(organization_id, array['owner']::public.org_role[])
    or (role <> 'owner' and private.has_org_role(organization_id, array['admin']::public.org_role[]))
  );
create policy "members: owners and admins remove, anyone can leave" on public.organization_members
  for delete to authenticated using (
    user_id = (select auth.uid())
    or private.has_org_role(organization_id, array['owner']::public.org_role[])
    or (role <> 'owner' and private.has_org_role(organization_id, array['admin']::public.org_role[]))
  );

-- ---------------------------------------------------------------------------
-- Directory: categories and listings
-- ---------------------------------------------------------------------------

create table public.listing_categories (
  id          smallint generated always as identity primary key,
  slug        text not null unique check (slug ~ '^[a-z0-9-]{2,64}$'),
  name        text not null check (char_length(name) between 2 and 80),
  detail      text check (char_length(detail) <= 200),
  sort_order  smallint not null default 0
);

insert into public.listing_categories (slug, name, detail, sort_order) values
  ('manufacturers-wholesalers', 'Manufacturers and wholesalers', 'Production, private label and bulk supply.', 1),
  ('dropshipping-suppliers', 'Dropshipping suppliers', 'Suppliers that ship directly to your customers.', 2),
  ('business-software', 'Business software', 'SaaS for commerce, finance, operations and teams.', 3),
  ('shipping-fulfillment', 'Shipping and fulfillment', 'Freight, warehousing, last-mile and returns.', 4),
  ('payment-services', 'Payment services', 'Payment processing, payouts and cross-border settlement.', 5),
  ('marketing-agencies', 'Marketing agencies', 'Advertising, SEO, content and brand.', 6),
  ('store-web-development', 'Store and web development', 'Store builds, integrations and maintenance.', 7),
  ('consultants-freelancers', 'Consultants and freelancers', 'Specialists for finance, operations and growth.', 8),
  ('courses-training', 'Courses and training', 'Business education from independent providers.', 9),
  ('partnerships-affiliate', 'Partnerships and affiliate programs', 'Distribution, reseller and referral partnerships.', 10);

alter table public.listing_categories enable row level security;
create policy "categories: everyone reads" on public.listing_categories
  for select to anon, authenticated using (true);

create table public.business_listings (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references public.organizations (id) on delete cascade,
  category_id       smallint not null references public.listing_categories (id),
  name              text not null check (char_length(name) between 2 and 160),
  slug              text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,78}[a-z0-9]$'),
  summary           text not null check (char_length(summary) between 20 and 280),
  description       text check (char_length(description) <= 5000),
  website           text not null check (website ~ '^https://' and char_length(website) <= 500),
  headquarters      text check (char_length(headquarters) <= 80),
  serves_markets    text[] not null default '{}' check (cardinality(serves_markets) <= 20),
  -- Moderation: members move draft <-> submitted and can archive; staff publish or reject.
  status            text not null default 'draft'
                    check (status in ('draft', 'submitted', 'published', 'rejected', 'archived')),
  moderation_note   text check (char_length(moderation_note) <= 1000),
  submitted_at      timestamptz,
  published_at      timestamptz,
  -- Verification is separate from publication and can only be set by staff.
  verification      text not null default 'unverified' check (verification in ('unverified', 'verified')),
  verified_scope    text check (char_length(verified_scope) <= 300),
  verified_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  check ((verification = 'verified') = (verified_at is not null))
);
create index business_listings_org_idx on public.business_listings (organization_id);
create index business_listings_public_idx on public.business_listings (category_id, published_at desc) where status = 'published';

create trigger business_listings_touch before update on public.business_listings
  for each row execute function private.touch_updated_at();

create or replace function private.guard_listing()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if private.is_staff() then
    if new.status = 'published' and (tg_op = 'INSERT' or old.status <> 'published') then
      new.published_at := now();
      new.moderation_note := null; -- notes are for the member while in review, never public
    end if;
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.status not in ('draft', 'submitted') then
      raise exception 'New listings start as a draft or are submitted for review';
    end if;
    new.verification := 'unverified';
    new.verified_scope := null;
    new.verified_at := null;
    new.moderation_note := null;
    new.published_at := null;
    new.submitted_at := case when new.status = 'submitted' then now() end;
    return new;
  end if;

  -- Members can't touch staff-owned fields.
  if new.verification is distinct from old.verification
     or new.verified_scope is distinct from old.verified_scope
     or new.verified_at is distinct from old.verified_at
     or new.moderation_note is distinct from old.moderation_note
     or new.published_at is distinct from old.published_at
     or new.organization_id is distinct from old.organization_id then
    raise exception 'Only The Dream Business staff can change verification, moderation or ownership';
  end if;

  -- Allowed status moves for members.
  if new.status <> old.status and not (
       (old.status in ('draft', 'rejected') and new.status = 'submitted')
    or (old.status = 'submitted' and new.status = 'draft')
    or (new.status = 'archived')
    or (old.status = 'archived' and new.status = 'draft')
  ) then
    raise exception 'Listing status cannot change from % to %', old.status, new.status;
  end if;

  -- Any content edit to a published listing goes back for review, and a
  -- listing that changes its content loses verification.
  if old.status = 'published' and new.status = 'published' and (
       new.name, new.slug, new.summary, new.description, new.website, new.category_id, new.headquarters, new.serves_markets)
       is distinct from
       (old.name, old.slug, old.summary, old.description, old.website, old.category_id, old.headquarters, old.serves_markets) then
    new.status := 'submitted';
  end if;
  if new.status = 'submitted' and old.status <> 'submitted' then
    new.submitted_at := now();
  end if;
  if new.status <> 'published' and old.verification = 'verified'
     and (new.name, new.website) is distinct from (old.name, old.website) then
    new.verification := 'unverified';
    new.verified_scope := null;
    new.verified_at := null;
  end if;
  return new;
end;
$$;

create trigger business_listings_guard before insert or update on public.business_listings
  for each row execute function private.guard_listing();

alter table public.business_listings enable row level security;

create policy "listings: everyone reads published" on public.business_listings
  for select to anon, authenticated using (status = 'published');
create policy "listings: members read their own" on public.business_listings
  for select to authenticated using (private.is_org_member(organization_id));
create policy "listings: editors create" on public.business_listings
  for insert to authenticated
  with check (private.has_org_role(organization_id, array['owner', 'admin', 'editor']::public.org_role[]));
create policy "listings: editors update" on public.business_listings
  for update to authenticated
  using (private.has_org_role(organization_id, array['owner', 'admin', 'editor']::public.org_role[]))
  with check (private.has_org_role(organization_id, array['owner', 'admin', 'editor']::public.org_role[]));
create policy "listings: owners and admins delete drafts" on public.business_listings
  for delete to authenticated
  using (status in ('draft', 'rejected') and private.has_org_role(organization_id, array['owner', 'admin']::public.org_role[]));

-- ---------------------------------------------------------------------------
-- Campaigns: submitted by advertisers, approved manually by staff
-- ---------------------------------------------------------------------------

create table public.campaigns (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  listing_id       uuid references public.business_listings (id) on delete set null,
  name             text not null check (char_length(name) between 2 and 120),
  tier             text not null check (tier in ('self_service', 'growth', 'enterprise')),
  placement        text not null check (placement in ('directory_featured', 'category_sponsor', 'tool_page_sponsor', 'sponsored_article', 'custom')),
  destination_url  text not null check (destination_url ~ '^https://' and char_length(destination_url) <= 500),
  headline         text not null check (char_length(headline) between 5 and 90),
  body             text check (char_length(body) <= 280),
  starts_on        date,
  ends_on          date,
  budget_note      text check (char_length(budget_note) <= 300),
  status           text not null default 'draft'
                   check (status in ('draft', 'submitted', 'approved', 'rejected', 'live', 'paused', 'ended')),
  review_note      text check (char_length(review_note) <= 1000),
  submitted_at     timestamptz,
  reviewed_at      timestamptz,
  created_by       uuid references auth.users (id) on delete set null default auth.uid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  check (ends_on is null or starts_on is null or ends_on >= starts_on)
);
create index campaigns_org_idx on public.campaigns (organization_id);
create index campaigns_status_idx on public.campaigns (status);

create trigger campaigns_touch before update on public.campaigns
  for each row execute function private.touch_updated_at();

create or replace function private.guard_campaign()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if private.is_staff() then
    if new.status in ('approved', 'rejected') and (tg_op = 'INSERT' or old.status <> new.status) then
      new.reviewed_at := now();
    end if;
    return new;
  end if;

  if new.listing_id is not null and not exists (
    select 1 from public.business_listings l where l.id = new.listing_id and l.organization_id = new.organization_id
  ) then
    raise exception 'A campaign can only promote its own organization''s listing';
  end if;

  if tg_op = 'INSERT' then
    if new.status not in ('draft', 'submitted') then
      raise exception 'New campaigns start as a draft or are submitted for review';
    end if;
    new.review_note := null;
    new.reviewed_at := null;
    new.created_by := (select auth.uid());
    new.submitted_at := case when new.status = 'submitted' then now() end;
    return new;
  end if;

  if new.review_note is distinct from old.review_note
     or new.reviewed_at is distinct from old.reviewed_at
     or new.organization_id is distinct from old.organization_id
     or new.created_by is distinct from old.created_by then
    raise exception 'Only The Dream Business staff can change review fields or ownership';
  end if;

  if new.status <> old.status and not (
       (old.status in ('draft', 'rejected') and new.status = 'submitted')
    or (old.status = 'submitted' and new.status = 'draft')
    or (old.status = 'live' and new.status = 'paused')
  ) then
    raise exception 'Campaign status cannot change from % to %', old.status, new.status;
  end if;

  -- Changing an approved, live or paused campaign's content sends it back for review.
  if old.status in ('approved', 'live', 'paused') and (
       new.listing_id, new.placement, new.destination_url, new.headline, new.body, new.starts_on, new.ends_on, new.tier)
       is distinct from
       (old.listing_id, old.placement, old.destination_url, old.headline, old.body, old.starts_on, old.ends_on, old.tier) then
    new.status := 'submitted';
  end if;
  if new.status = 'submitted' and old.status <> 'submitted' then
    new.submitted_at := now();
  end if;
  return new;
end;
$$;

create trigger campaigns_guard before insert or update on public.campaigns
  for each row execute function private.guard_campaign();

alter table public.campaigns enable row level security;

-- Campaigns are never readable by the public; the website renders live
-- placements server-side.
create policy "campaigns: members read" on public.campaigns
  for select to authenticated using (private.is_org_member(organization_id));
create policy "campaigns: campaign managers create" on public.campaigns
  for insert to authenticated
  with check (private.has_org_role(organization_id, array['owner', 'admin', 'campaign_manager']::public.org_role[]));
create policy "campaigns: campaign managers update" on public.campaigns
  for update to authenticated
  using (private.has_org_role(organization_id, array['owner', 'admin', 'campaign_manager']::public.org_role[]))
  with check (private.has_org_role(organization_id, array['owner', 'admin', 'campaign_manager']::public.org_role[]));
create policy "campaigns: campaign managers delete drafts" on public.campaigns
  for delete to authenticated
  using (status in ('draft', 'rejected') and private.has_org_role(organization_id, array['owner', 'admin', 'campaign_manager']::public.org_role[]));

-- Daily counts recorded by the website itself. Written only by the server.
create table public.campaign_metrics (
  campaign_id  uuid not null references public.campaigns (id) on delete cascade,
  day          date not null,
  impressions  integer not null default 0 check (impressions >= 0),
  clicks       integer not null default 0 check (clicks >= 0 and clicks <= impressions),
  primary key (campaign_id, day)
);

alter table public.campaign_metrics enable row level security;
create policy "metrics: members read their campaigns" on public.campaign_metrics
  for select to authenticated using (
    exists (select 1 from public.campaigns c where c.id = campaign_id and private.is_org_member(c.organization_id))
  );

-- ---------------------------------------------------------------------------
-- Saved items: a person's saved tool results, listings and Navigator plans
-- ---------------------------------------------------------------------------

create table public.saved_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade default auth.uid(),
  kind        text not null check (kind in ('tool_result', 'listing', 'navigator_plan')),
  ref         text not null check (char_length(ref) between 1 and 200),
  title       text not null check (char_length(title) between 1 and 160),
  data        jsonb check (data is null or pg_column_size(data) <= 32768),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index saved_items_user_idx on public.saved_items (user_id, created_at desc);

create trigger saved_items_touch before update on public.saved_items
  for each row execute function private.touch_updated_at();

alter table public.saved_items enable row level security;
create policy "saved: own only" on public.saved_items
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Audit log: status and verification changes, written by triggers only
-- ---------------------------------------------------------------------------

create table public.audit_log (
  id               bigint generated always as identity primary key,
  at               timestamptz not null default now(),
  actor            uuid,
  actor_role       text not null,
  organization_id  uuid references public.organizations (id) on delete cascade,
  entity           text not null,
  entity_id        uuid not null,
  action           text not null,
  detail           jsonb
);
create index audit_log_org_idx on public.audit_log (organization_id, at desc);

create or replace function private.audit_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  changed boolean;
begin
  if tg_op = 'INSERT' then
    changed := true;
  elsif tg_table_name = 'business_listings' then
    changed := new.status <> old.status or new.verification <> old.verification;
  else
    changed := new.status <> old.status;
  end if;
  if changed then
    insert into public.audit_log (actor, actor_role, organization_id, entity, entity_id, action, detail)
    values (
      (select auth.uid()),
      current_setting('role', true),
      new.organization_id,
      tg_table_name,
      new.id,
      lower(tg_op),
      jsonb_build_object(
        'from', case when tg_op = 'UPDATE' then old.status end,
        'to', new.status,
        'verification', case when tg_table_name = 'business_listings' then to_jsonb(new) ->> 'verification' end
      )
    );
  end if;
  return new;
end;
$$;

create trigger business_listings_audit after insert or update on public.business_listings
  for each row execute function private.audit_status();
create trigger campaigns_audit after insert or update on public.campaigns
  for each row execute function private.audit_status();

alter table public.audit_log enable row level security;
create policy "audit: owners and admins read their organization" on public.audit_log
  for select to authenticated
  using (private.has_org_role(organization_id, array['owner', 'admin']::public.org_role[]));

-- ---------------------------------------------------------------------------
-- Table privileges (explicit, so access doesn't depend on project defaults)
-- ---------------------------------------------------------------------------

revoke all on public.profiles, public.organizations, public.organization_members, public.listing_categories,
  public.business_listings, public.campaigns, public.campaign_metrics, public.saved_items, public.audit_log
  from anon, authenticated;

grant select on public.listing_categories, public.business_listings to anon;
grant select on public.listing_categories, public.campaign_metrics, public.audit_log to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.organizations, public.organization_members, public.business_listings,
  public.campaigns, public.saved_items to authenticated;
grant usage on type public.org_role to anon, authenticated;
