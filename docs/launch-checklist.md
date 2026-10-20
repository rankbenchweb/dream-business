# Launch checklist

Plain steps from "code finished" to "public website". Founder steps are marked **You**;
everything else Claude does once the step before it is done.

## 1. Put the code on GitHub
- [x] **You:** create the repository `rankbenchweb/dream-business` (done 20 Oct 2026; it is public, and can be made private under Settings → General → Change visibility).
- [x] Invite `maliksajidali2` as a collaborator (done 20 Oct 2026).
- [ ] **You:** accept the invitation while signed in as maliksajidali2: https://github.com/rankbenchweb/dream-business/invitations
- [ ] Claude uploads all the code.

## 2. Go live on a free Netlify address
- [ ] **You:** in Netlify, open the project "the-dream-business" → Site configuration → Build & deploy → Link repository → GitHub → choose `rankbenchweb/dream-business`. Netlify asks once for permission to read the repository.
- [ ] Build settings (Netlify usually detects them): build command `npm run build`, publish directory `.next`.
- [ ] Claude checks the live site: every page loads, tools work, forms show the right messages, nothing is indexed by search engines yet.

At this point the site is public at a netlify.app address, with accounts switched off.

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
