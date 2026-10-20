# Switching on business accounts

Status: **built and tested, switched off.** With no Supabase settings, the site
hides all sign-in links and account pages say accounts open soon.

## What it does

- **Sign in by email link.** No passwords. The same link creates an account.
- **Business profiles.** A person creates a profile for their business and becomes its owner.
- **Directory listings.** Owners, admins and editors create listings, save drafts, submit for review, withdraw, archive and restore.
- **Teams.** Owners and admins invite colleagues by email as admin, editor, campaign manager or analyst, change roles, cancel invitations and remove members. Invitations are not emailed yet: the invited person signs in with that address and accepts on their account page (open for 14 days). A business always keeps at least one owner.
- **Campaigns.** Owners, admins and campaign managers submit promotion campaigns (level, placement, listing to feature, headline, link, preferred dates, budget notes), withdraw them, delete drafts and pause live ones. Analysts can view. Payment is agreed outside the platform for now: approval says so, and staff mark a campaign live only after dates and price are agreed. Changing an approved or live campaign sends it back for review.
- **Sponsored placements.** A live featured-listing campaign appears above the directory results in its category, labelled Sponsored, only between its start and end dates, and only while its listing is published. Pausing, ending or editing it takes it down immediately. Links are marked as sponsored for search engines. Impressions and clicks are not counted yet.
- **Staff review** at `/staff/review`, for the emails in `STAFF_EMAILS` only: publish, return with a note, mark verified (with a description of the check) or remove verification; for campaigns, approve, return with a note, mark live, pause, resume or end.
- **Public directory** on the Marketplace page: published listings only, with search and filters by category and market served.

Every rule that matters (who can publish, verify or see what) is enforced by the
database, not just by the screens. See `docs/database-stage2.md`.

## Steps to switch it on

1. **Choose a Supabase project.** The free plan allows two active projects.
2. **Apply the migrations** in order: `20261010000000_stage2_accounts_directory_campaigns.sql`, then
   `20261011000000_organization_invitations.sql` (and the inquiries migration if you store inquiries there). Then run the Supabase security advisor.
3. **Sign-in settings** (Supabase dashboard, Authentication):
   - URL configuration: set the Site URL to the live address, and add `https://<your-domain>/auth/callback` to the redirect URLs.
   - Email provider: enabled. The default magic-link email template works as it is.
4. **Email sending.** Supabase's built-in email service only sends to members of
   your Supabase team, has a low hourly limit and is not meant for production.
   Before opening sign-up to the public, connect an email-sending service (SMTP)
   in Authentication settings, and review the rate limits page.
5. **Website settings** (in Netlify or wherever the site is hosted):
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (from the project's API settings)
   - `SUPABASE_SERVICE_ROLE_KEY` (secret key; server only)
   - `STAFF_EMAILS` (your team's emails)
   - Redeploy. Sign-in links appear in the header and "List your business" buttons switch from the inquiry form to self-service.
6. **Check once on the real project:** sign up, create a profile, submit a listing, review it as staff, and see it in the directory.

## How it was tested

The real Supabase sign-in server couldn't be run in the build environment, so
testing used `supabase/tests/fake_supabase.py`: a small local stand-in for
Supabase's sign-in and data services, running on a real PostgreSQL database
with this project's actual security rules. 37 account checks, 24 team checks and 31 campaign checks passed end to end,
including the full sign-in link flow, used links, business profile, listing
validation, withdraw and resubmit, outsider and non-staff access blocked, staff
return with note, publish, verify, directory filters, edits sending a live
listing back to review, safe redirects, sign-out, mobile layout, and for teams: inviting, duplicate and invalid invitations, accepting, declining, cancelling, role changes taking effect, the last owner unable to leave, removal ending access, and outsiders blocked; and for campaigns: validation (featured listing required, https links, no past start dates, values kept after errors), withdraw and resubmit, staff return with note, approve, live, owner pause, resume, edits to a live campaign returning it to review, end, and deleting a draft. Account and
staff pages passed automated accessibility checks at desktop and mobile sizes.

The stand-in is not Supabase, so step 6 above is required before launch.
