# Launch checklist

Plain steps from "code finished" to "public website". Founder steps are marked **You**;
everything else Claude does once the step before it is done.

## 1. Put the code on GitHub
- [x] **You:** create the repository `rankbenchweb/dream-business` (done 20 Oct 2026; it is public, and can be made private under Settings → General → Change visibility).
- [x] Invite `maliksajidali2` as a collaborator (done 20 Oct 2026).
- [x] Invitation accepted by maliksajidali2; Claude GitHub App installed on rankbenchweb for dream-business only (20 Oct).
- [x] Claude uploaded all the code (20 Oct).

## 2. Go live on a free Netlify address
- [x] Netlify account "rankbenchweb's team" (signs in with GitHub as rankbenchweb) created by the founder; the older account (maliksajidali) had used its free credits for October.
- [x] Project **thedreambusiness** linked to `rankbenchweb/dream-business`, branch `main`, Next.js detected automatically (20 Oct).
- [x] First deploy published in 50 seconds and made public: **https://thedreambusiness.netlify.app**
- [x] Checked live: home page, calculator results, 404 page, robots.txt blocks indexing as intended.

Every push to `main` publishes automatically. On the free plan each production deploy costs 15 of 300 monthly credits (about 20 deploys a month), so updates are grouped.

## 3. Receive inquiries
Pick one:
- [ ] Supabase: apply `supabase/migrations/20261009000000_create_inquiries.sql`, then set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Netlify.
- [ ] Or n8n: create a public webhook that saves or emails inquiries, then set `INQUIRY_WEBHOOK_URL` in Netlify.

Until one is set, the inquiry forms say they can't be sent yet. Nothing is lost silently.

## 4. Switch on business accounts
Follow `docs/accounts-setup.md`. In short:
- [ ] **You:** choose the Supabase project (the free plan allows two active projects; both are in use).
- [ ] Apply the two account migrations, run the Supabase security advisor.
- [ ] **You:** connect an email-sending service (SMTP) in Supabase. Supabase's built-in email only reaches your own team.
- [ ] Set the Supabase settings and `STAFF_EMAILS` in Netlify, redeploy.
- [ ] Claude runs the full journey on the real system: sign up, business profile, team invitation, listing, staff review, directory, campaign, sponsored placement.
- [ ] Set up the weekly database backup (n8n) agreed on 9 Oct.

## 5. Your own domain
- [ ] **You:** check the name is free to use (domain and trademark), then buy the domain.
- [ ] Add it in Netlify (Domain management) and follow Netlify's DNS steps. Changes can take up to a day or two to spread.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the domain in Netlify and redeploy. This turns on search-engine indexing and makes share links and the sitemap use the real address.
- [ ] In Supabase, set the Site URL and add `https://<domain>/auth/callback` to the redirect URLs.
- [ ] Submit the sitemap (`/sitemap.xml`) in Google Search Console.

## 6. Before accepting real accounts or payments
- [ ] **You:** have the Privacy Policy and Terms reviewed by a qualified adviser. Both pages say they are drafts until then.
- [ ] Re-check the dated data in the tools (payment providers, store platform prices); they were checked on 9 October 2026 and should be reviewed quarterly.

## Quality at hand-over (20 October 2026)
- Speed (Lighthouse, mobile): performance 95–98, accessibility 100, best practices 100 on the home, tools, a calculator, marketplace, navigator and promote pages. Search-engine score is 66 only because indexing is deliberately blocked until the domain is set.
- Automated checks: 75 public-site browser checks, 92 account, team and campaign end-to-end checks, 101 database permission checks, zero accessibility violations, no broken links.
