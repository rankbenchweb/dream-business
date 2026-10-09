# Stage 2 database design

Status: **written and tested locally, not applied** to any Supabase project.
Migration: `supabase/migrations/20261010000000_stage2_accounts_directory_campaigns.sql`.
It is additive: it creates new tables, functions and policies and changes nothing that exists.

## What it supports

| Need (from the Stage 2 plan) | Tables |
| --- | --- |
| User accounts | `profiles` (created automatically on sign-up) |
| Business accounts with team roles | `organizations`, `organization_members` |
| Business directory and submissions | `listing_categories`, `business_listings` |
| Moderation and verification | status and verification columns on `business_listings` |
| Advertiser campaigns with manual approval | `campaigns` |
| Initial campaign analytics | `campaign_metrics` (daily impressions and clicks) |
| Saved tools, listings and Navigator plans | `saved_items` |
| Accountability | `audit_log` |

Payments, subscriptions and invoices are deliberately left out until pricing and provider eligibility are settled.

## People and organizations

A person and the business they represent are separate. One person can belong to several organizations, each with one role:

| Role | Can do |
| --- | --- |
| Owner | Everything, including deleting the organization and managing owners |
| Admin | Edit the organization, manage members (not owners), listings and campaigns |
| Editor | Create and edit directory listings |
| Campaign manager | Create and edit campaigns |
| Analyst | Read listings, campaigns and campaign metrics |

Rules enforced by the database: the creator becomes owner; an organization always keeps at least one owner (except when that owner deletes their whole account, which is always allowed; staff then reassign or remove the profile); admins can't create or remove owners; anyone can leave.

## Trust rules the database enforces

These hold whatever the website or a browser sends, because they live in database triggers and policies rather than in the interface.

- **Members can't publish their own listings.** They move a listing between draft and submitted, or archive it. Only staff (the website's server) publish or reject.
- **Verification can only be set by staff**, and needs a date. Changing a verified listing's name or website removes verification.
- **Editing a published listing sends it back for review**, so an approved listing can't be swapped for different content.
- **Campaigns follow the same pattern:** members submit; staff approve, reject or set live. Members may pause a live campaign. Changing an approved or live campaign's content sends it back for review. A campaign can only promote its own organization's listing, and links must use https.
- **Metrics are written only by the server**, and clicks can't exceed impressions. Advertisers can't edit their own numbers.
- **Review notes are private** and cleared on publication.
- **Every status and verification change is recorded** in the audit log, with who made it. Owners and admins can read their organization's log; nobody can write to it directly.

## Who can read what

| Data | Public | Signed-in member | Outsider |
| --- | --- | --- | --- |
| Categories | Yes | Yes | Yes |
| Published listings | Yes | Yes | Yes |
| Draft, submitted or rejected listings | No | Own organization | No |
| Organizations and members | No | Own organization | No |
| Campaigns and metrics | No | Own organization | No |
| Saved items, profile | No | Own only | No |

Live sponsored placements are shown by the website's server, not read from the browser, so campaign details are never public.

## Tested

A local PostgreSQL 16 database with a stand-in for Supabase's sign-in layer ran 69 checks, all passing, covering every rule above: role limits, self-publishing and self-verification blocked, re-review on edit, cross-organization access denied, public visibility, metrics protection, saved-item privacy, audit trail, cascade deletes and account deletion. Testing found and fixed two issues: a new organization couldn't be read back in the same request that created it, and the sole owner of an organization couldn't delete their account.

Also tested end to end with the website's account screens through a local stand-in for Supabase (see `docs/accounts-setup.md`). Not yet tested against a real Supabase project.

## Before applying

1. Choose the Supabase project (the free plan allows two active projects; both are in use).
2. Apply to a development branch or a fresh project first, then run the Supabase security advisor.
3. Sign-in, listing submission and staff review are built; see `docs/accounts-setup.md`.
4. Decide who on the team counts as staff. Staff actions run on the server with the service role key, which must never reach the browser.

## Known trade-offs

- The person who created an organization can still read its basic details after leaving it. Harmless now; tighten if it matters.
- Editing a published listing hides it until re-approved, even for a small typo. Safer against misuse; revisit if review times are long.
- Category list mirrors the marketplace page; new categories are added by staff.
