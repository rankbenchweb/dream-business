"""Policy tests for the Stage 2 migration against a throwaway local PostgreSQL database.
Usage: python3 supabase/tests/stage2_policies.py supabase/migrations/20261010000000_stage2_accounts_directory_campaigns.sql supabase/tests/supabase_auth_stub.sql
Needs a local PostgreSQL superuser named after the current OS user and `pip install psycopg[binary]`."""
import subprocess, sys, uuid
import psycopg

DB = "tdb_stage2_test"
MIG = sys.argv[1]
STUB = sys.argv[2]

subprocess.run(["su", "postgres", "-c", f"dropdb --if-exists {DB} && createdb {DB}"], check=True)
for f in (STUB, MIG):
    r = subprocess.run(["su", "postgres", "-c", f"psql -q -v ON_ERROR_STOP=1 -d {DB}"], stdin=open(f), capture_output=True, text=True)
    if r.returncode:
        print("APPLY FAILED", f, r.stderr); sys.exit(1)
print("migration applied cleanly")

conn = psycopg.connect(f"dbname={DB} host=/var/run/postgresql", autocommit=True)
results = []

def run(who, sql, params=None):
    """who: None/'postgres' = admin, 'staff' = service_role, 'anon', or a user uuid."""
    with conn.cursor() as cur:
        cur.execute("reset role")
        cur.execute("select set_config('request.jwt.claim.sub', %s, false)", ("" if who in (None, "staff", "anon", "postgres") else str(who),))
        if who == "staff":
            cur.execute("set role service_role")
        elif who == "anon":
            cur.execute("set role anon")
        elif who not in (None, "postgres"):
            cur.execute("set role authenticated")
        try:
            cur.execute(sql, params)
            rows = cur.fetchall() if cur.description else None
            return ("ok", rows, cur.rowcount)
        except psycopg.Error as e:
            return ("err", str(e).splitlines()[0], 0)
        finally:
            cur.execute("reset role")

def check(name, cond):
    results.append(("PASS " if cond else "FAIL ") + name)

def ok(name, r):
    check(name, r[0] == "ok") if r[0] == "ok" else check(f"{name} -- {r[1]}", False)

def denied(name, r, contains=None):
    check(name + ("" if r[0] == "err" else " (was allowed)"), r[0] == "err" and (contains is None or contains in r[1]))

A, B, C, D, E = (uuid.uuid4() for _ in range(5))
for u in (A, B, C, D, E):
    run(None, "insert into auth.users (id) values (%s)", (u,))
check("signup creates a profile", run(None, "select count(*) from public.profiles")[1][0][0] == 5)
check("user reads own profile only", run(A, "select id from public.profiles")[1] == [(A,)])

# Organizations
r = run(A, "insert into public.organizations (name, slug) values ('Acme Supply', 'acme-supply') returning id")
ok("user creates organization", r); org1 = r[1][0][0]
check("creator becomes owner", run(A, "select role::text from public.organization_members where organization_id=%s", (org1,))[1] == [("owner",)])
denied("cannot create organization on someone else's behalf", run(D, "insert into public.organizations (name, slug, created_by) values ('X Co', 'x-co', %s)", (A,)))
r = run(D, "insert into public.organizations (name, slug) values ('Other Co', 'other-co') returning id"); org2 = r[1][0][0]
check("outsider cannot see organization", run(D, "select count(*) from public.organizations where id=%s", (org1,))[1][0][0] == 0)
ok("owner adds editor", run(A, "insert into public.organization_members values (%s, %s, 'editor')", (org1, B)))
ok("owner adds analyst", run(A, "insert into public.organization_members values (%s, %s, 'analyst')", (org1, C)))
ok("owner adds admin", run(A, "insert into public.organization_members values (%s, %s, 'admin')", (org1, E)))
denied("editor cannot add members", run(B, "insert into public.organization_members values (%s, %s, 'analyst')", (org1, D)))
denied("admin cannot create an owner", run(E, "insert into public.organization_members values (%s, %s, 'owner')", (org1, D)))
check("admin cannot demote the owner", run(E, "update public.organization_members set role='analyst' where user_id=%s and organization_id=%s", (A, org1))[2] == 0)
denied("last owner cannot step down", run(A, "update public.organization_members set role='admin' where user_id=%s and organization_id=%s", (A, org1)), "at least one owner")
denied("editor cannot rename organization (no rows)", ("err", "", 0) if run(B, "update public.organizations set name='Hacked' where id=%s", (org1,))[2] == 0 else ("ok", None, 1))

# Listings
cat = run(None, "select id from public.listing_categories where slug='manufacturers-wholesalers'")[1][0][0]
check("ten categories seeded", run("anon", "select count(*) from public.listing_categories")[1][0][0] == 10)
ins = "insert into public.business_listings (organization_id, category_id, name, slug, summary, website, status, verification, verified_at) values (%s, %s, 'Acme Supply', %s, 'Private label manufacturing for small brands.', 'https://acme.example', %s, %s, %s) returning id, status, verification"
denied("member cannot create a published listing", run(B, ins, (org1, cat, "acme-a", "published", "unverified", None)))
r = run(B, ins, (org1, cat, "acme-supply", "draft", "verified", "2026-10-01"))
ok("editor creates draft listing", r)
lst = r[1][0][0] if r[0] == "ok" else None
check("self-applied verification is stripped", r[0] == "ok" and r[1][0][2] == "unverified")
denied("analyst cannot create listings", run(C, ins, (org1, cat, "acme-c", "draft", "unverified", None)))
denied("outsider cannot create listing for another organization", run(D, ins, (org1, cat, "acme-d", "draft", "unverified", None)))
check("analyst cannot edit listings (no rows)", run(C, "update public.business_listings set summary='Analyst edit of the summary text' where id=%s", (lst,))[2] == 0)
check("draft hidden from public", run("anon", "select count(*) from public.business_listings")[1][0][0] == 0)
check("draft hidden from outsiders", run(D, "select count(*) from public.business_listings")[1][0][0] == 0)
ok("editor submits for review", run(B, "update public.business_listings set status='submitted' where id=%s", (lst,)))
denied("editor cannot publish", run(B, "update public.business_listings set status='published' where id=%s", (lst,)), "cannot change")
ok("staff publishes with a note", run("staff", "update public.business_listings set status='published', moderation_note='ok' where id=%s", (lst,)))
r = run("anon", "select status, moderation_note, published_at is not null from public.business_listings")
check("published listing visible to public, note cleared, date set", r[1] == [("published", None, True)])
denied("editor cannot self-verify", run(B, "update public.business_listings set verification='verified', verified_at=now() where id=%s", (lst,)), "Only The Dream Business staff")
ok("staff verifies", run("staff", "update public.business_listings set verification='verified', verified_at=now(), verified_scope='Company registration checked' where id=%s", (lst,)))
ok("editor edits a published listing", run(B, "update public.business_listings set summary='Private label and bulk manufacturing for brands.' where id=%s", (lst,)))
check("edit sends listing back to review and off the public directory",
      run(B, "select status from public.business_listings where id=%s", (lst,))[1] == [("submitted",)]
      and run("anon", "select count(*) from public.business_listings")[1][0][0] == 0)
run("staff", "update public.business_listings set status='published' where id=%s", (lst,))
ok("editor changes website after re-review", run(B, "update public.business_listings set website='https://acme2.example' where id=%s", (lst,)))
check("changing website removes verification", run(B, "select verification, verified_at from public.business_listings where id=%s", (lst,))[1] == [("unverified", None)])
check("owner cannot delete a submitted listing (no rows)", run(A, "delete from public.business_listings where id=%s", (lst,))[2] == 0)

# Campaigns
r = run(D, "insert into public.business_listings (organization_id, category_id, name, slug, summary, website) values (%s, %s, 'Other', 'other-co', 'Another company that offers a service.', 'https://other.example') returning id", (org2, cat))
other_lst = r[1][0][0]
cins = "insert into public.campaigns (organization_id, listing_id, name, tier, placement, destination_url, headline, status) values (%s, %s, 'Launch', 'self_service', 'directory_featured', %s, 'Private label made simple', %s) returning id"
denied("analyst cannot create campaigns", run(C, cins, (org1, lst, "https://acme.example", "draft")))
denied("cannot promote another organization's listing", run(A, cins, (org1, other_lst, "https://acme.example", "draft")), "its own organization")
denied("destination must be https", run(A, cins, (org1, lst, "http://acme.example", "draft")))
denied("member cannot create a live campaign", run(A, cins, (org1, lst, "https://acme.example", "live")))
r = run(A, cins, (org1, lst, "https://acme.example", "submitted")); ok("owner submits campaign", r); camp = r[1][0][0]
denied("owner cannot approve own campaign", run(A, "update public.campaigns set status='approved' where id=%s", (camp,)))
denied("owner cannot write review notes", run(A, "update public.campaigns set review_note='looks great' where id=%s", (camp,)))
ok("staff approves and sets live", run("staff", "update public.campaigns set status='live' where id=%s", (camp,)))
ok("owner pauses live campaign", run(A, "update public.campaigns set status='paused' where id=%s", (camp,)))
denied("owner cannot resume without review", run(A, "update public.campaigns set status='live' where id=%s", (camp,)))
run("staff", "update public.campaigns set status='live' where id=%s", (camp,))
ok("owner edits headline of live campaign", run(A, "update public.campaigns set headline='New headline for review' where id=%s", (camp,)))
check("edited campaign goes back to review", run(A, "select status from public.campaigns where id=%s", (camp,))[1] == [("submitted",)])
denied("public cannot read campaigns", run("anon", "select * from public.campaigns"), "permission denied")
check("outsider sees no campaigns", run(D, "select count(*) from public.campaigns")[1][0][0] == 0)
check("analyst can read campaigns", run(C, "select count(*) from public.campaigns")[1][0][0] == 1)

# Metrics
ok("server records metrics", run("staff", "insert into public.campaign_metrics values (%s, '2026-10-10', 100, 3)", (camp,)))
denied("members cannot write metrics", run(A, "insert into public.campaign_metrics values (%s, '2026-10-11', 100000, 5000)", (camp,)))
denied("clicks cannot exceed impressions", run("staff", "insert into public.campaign_metrics values (%s, '2026-10-12', 1, 5)", (camp,)))
check("analyst reads metrics", run(C, "select impressions from public.campaign_metrics")[1] == [(100,)])
check("outsider reads no metrics", run(D, "select count(*) from public.campaign_metrics")[1][0][0] == 0)

# Saved items
ok("user saves a result", run(B, "insert into public.saved_items (kind, ref, title, data) values ('tool_result', 'profit-margin-calculator', 'Mug pricing', '{\"price\": 20}')"))
check("others cannot see saved items", run(D, "select count(*) from public.saved_items")[1][0][0] == 0 and run(A, "select count(*) from public.saved_items")[1][0][0] == 0)
denied("cannot save on someone else's behalf", run(D, "insert into public.saved_items (user_id, kind, ref, title) values (%s, 'listing', 'x', 'x')", (B,)))

# Audit
n_owner = run(A, "select count(*) from public.audit_log")[1][0][0]
check(f"owner reads audit trail ({n_owner} entries)", n_owner >= 8)
check("editor cannot read audit trail", run(B, "select count(*) from public.audit_log")[1][0][0] == 0)
denied("nobody writes audit entries directly", run(A, "insert into public.audit_log (actor_role, entity, entity_id, action) values ('x','x',%s,'x')", (lst,)))
check("staff actions are attributed to service role", run(None, "select count(*) from public.audit_log where actor_role='service_role'")[1][0][0] >= 3)

# Lifecycle
ok("member can leave organization", run(C, "delete from public.organization_members where user_id=%s and organization_id=%s", (C, org1)))
ok("owner deletes their organization (cascade)", run(D, "delete from public.organizations where id=%s", (org2,)))
check("cascade removed its listing", run(None, "select count(*) from public.business_listings where id=%s", (other_lst,))[1][0][0] == 0)
ok("deleting an account removes its data", run(None, "delete from auth.users where id=%s", (B,)))
check("account's profile and saved items gone", run(None, "select (select count(*) from public.profiles where id=%s) + (select count(*) from public.saved_items where user_id=%s)", (B, B))[1][0][0] == 0)

F = uuid.uuid4()
run(None, "insert into auth.users (id) values (%s)", (F,))
org3 = run(F, "insert into public.organizations (name, slug) values ('Solo Co', 'solo-co') returning id")[1][0][0]
denied("sole owner still can't step down", run(F, "update public.organization_members set role='admin' where user_id=%s", (F,)), "at least one owner")
ok("sole owner can delete their whole account", run(None, "delete from auth.users where id=%s", (F,)))
check("their organization remains for staff to handle", run(None, "select count(*) from public.organizations where id=%s", (org3,))[1][0][0] == 1)

print("\n".join(results))
print(f"{sum(r.startswith('PASS') for r in results)} passed, {sum(r.startswith('FAIL') for r in results)} failed")
