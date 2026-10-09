# The Dream Business

The Business Builder. *Where businesses build their future.*

Phase 1 foundation: brand design system, global navigation, homepage, six division
pages, Business Promotion with a working inquiry flow, two live calculators,
standards and policy pages, and SEO foundations.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
npm run lint
```

Requires Node.js 20.9 or newer. Built on Next.js 16 (App Router, Cache Components),
React 19, TypeScript and Tailwind CSS 4. Fonts are self-hosted via Fontsource, so the
build needs no access to Google Fonts.

## Configuration

Copy `.env.example` to `.env.local` and fill in what you need.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Production URL. Sets canonicals and the sitemap. **While unset, robots.txt blocks indexing.** |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Store inquiries in Supabase (apply `supabase/migrations/20261009000000_create_inquiries.sql` first). Server-only. |
| `INQUIRY_WEBHOOK_URL` | Alternatively, or as well, POST each inquiry as JSON to a webhook such as n8n. |

With no storage configured, the form validates normally but the API answers
`503` and tells the visitor inquiries aren't switched on yet. Nothing is silently lost.

## Structure

```
src/app/                 Routes (one folder per page), sitemap.ts, robots.ts, api/inquiries
src/components/ui.tsx   Design-system primitives: Container, Section, SectionHeading,
                         ButtonLink/Button, TextLink, StatusBadge, StatusKey, PageHero,
                         Breadcrumbs (+JSON-LD), CapabilityList, GridTexture, JsonLd
src/components/layout/   SiteHeader (mega menu, mobile nav), SiteFooter, Logo,
                         MarketSelector, SearchDialog
src/components/          DivisionPage, PolicyPage, Disclosure labels, home/, tools/, forms/
src/lib/                 Single sources of truth: site.ts (nav), divisions.ts, tools.ts,
                         marketplace.ts, markets.ts, inquiry.ts (shared validation), seo.ts
src/app/globals.css      Design tokens (@theme): colour, type scale, radii, shadows
```

## Rules this codebase follows

- **Status is honest.** Every capability and tool carries `live`, `building` or
  `planned` in `src/lib/divisions.ts` / `src/lib/tools.ts`. Only `live` items link to a
  working page. Change the status when the feature ships, not before.
- **One accent.** Gold (from the brand emblem) is the only accent; silver is the secondary metal; brass marks enterprise.
- **Disclosure labels mean one thing each** (`Disclosure.tsx`): Verified, Editorial
  pick, Sponsored, Affiliate link, Estimate. Never combine paid and verified.
- **No fabricated content:** no statistics, testimonials, partner logos or listings.
- Add a page: create the route, export `metadata` via `pageMetadata()`, add it to
  `sitemap.ts`, and to `site.ts` if it belongs in navigation.

## Deployment

Any host that runs Next.js 16 on Node works. Netlify is the simplest fit with the
existing account (zero-config Next.js support). Cloudflare requires the OpenNext
adapter; check Cache Components compatibility before choosing it.

## Database plan

The Stage 2 schema (accounts, organizations, directory listings, campaigns, saved items) is written and tested but not applied. See `docs/database-stage2.md` before applying it.

## Business accounts

Sign-in, business profiles, listing submission, staff review and the public directory are built and switched off until Supabase is configured. See `docs/accounts-setup.md`. Tests: `supabase/tests/stage2_policies.py` (database rules) and `supabase/tests/fake_supabase.py` (local stand-in used for end-to-end tests).
