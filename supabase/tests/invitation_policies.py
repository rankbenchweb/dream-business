"""Policy tests for team invitations against a throwaway local PostgreSQL database.
Usage: python3 supabase/tests/invitation_policies.py supabase/tests/supabase_auth_stub.sql supabase/migrations/*.sql
Needs a local PostgreSQL superuser named after the current OS user and `pip install psycopg[binary]`."""
import json, subprocess, sys, uuid
import psycopg

DB = "tdb_invitation_test"
subprocess.run(["psql", "-h", "/var/run/postgresql", "-d", "postgres", "-qc", f"drop database if exists {DB}", "-c", f"create database {DB}"], check=True, capture_output=True)
for f in sys.argv[1:]:
    r = subprocess.run(["psql", "-h", "/var/run/postgresql", "-q", "-v", "ON_ERROR_STOP=1", "-d", DB, "-f", f], capture_output=True, text=True)
    if r.returncode:
        print("APPLY FAILED", f, r.stderr)
        sys.exit(1)
print("migrations applied cleanly")

conn = psycopg.connect(f"dbname={DB} host=/var/run/postgresql", autocommit=True)
results = []
EMAIL = {}


def run(who, sql, params=None):
    """who: None = admin, 'anon', or a user uuid (signed in with their email)."""
    with conn.cursor() as cur:
        cur.execute("reset role")
        claims = {} if who in (None, "anon") else {"sub": str(who), "email": EMAIL[who], "role": "authenticated"}
        cur.execute("select set_config('request.jwt.claim.sub', %s, false), set_config('request.jwt.claims', %s, false)", (claims.get("sub", ""), json.dumps(claims) if claims else ""))
        if who == "anon":
            cur.execute("set role anon")
        elif who is not None:
            cur.execute("set role authenticated")
        try:
            cur.execute(sql, params)
            return ("ok", cur.fetchall() if cur.description else None, cur.rowcount)
        except psycopg.Error as e:
            return ("err", str(e).splitlines()[0], 0)
        finally:
            cur.execute("reset role")


def check(name, cond):
    results.append(("PASS " if cond else "FAIL ") + name)


def ok(name, r):
    check(name if r[0] == "ok" else f"{name} -- {r[1]}", r[0] == "ok")


def denied(name, r, contains=None):
    check(name + ("" if r[0] == "err" else " (was allowed)"), r[0] == "err" and (contains is None or contains in r[1]))


OWNER, ADMIN, EDITOR, NEWBIE, STRANGER = (uuid.uuid4() for _ in range(5))
for u, e in ((OWNER, "owner@acme.example"), (ADMIN, "admin@acme.example"), (EDITOR, "editor@acme.example"), (NEWBIE, "new.person@acme.example"), (STRANGER, "stranger@other.example")):
    EMAIL[u] = e
    run(None, "insert into auth.users (id, email) values (%s, %s)", (u, e))

org = run(OWNER, "insert into public.organizations (name, slug) values ('Acme', 'acme') returning id")[1][0][0]
run(OWNER, "insert into public.organization_members values (%s, %s, 'admin')", (org, ADMIN))
run(OWNER, "insert into public.organization_members values (%s, %s, 'editor')", (org, EDITOR))
INV = "insert into public.organization_invitations (organization_id, email, role) values (%s, %s, %s) returning id"

denied("editor can't invite", run(EDITOR, INV, (org, "x@acme.example", "analyst")))
denied("outsider can't invite", run(STRANGER, INV, (org, "x@acme.example", "analyst")))
denied("nobody can invite an owner", run(OWNER, INV, (org, "x@acme.example", "owner")))
denied("email must be lower case and valid", run(OWNER, INV, (org, "Not An Email", "analyst")))
denied("can't fake who sent the invitation", run(ADMIN, "insert into public.organization_invitations (organization_id, email, role, invited_by) values (%s, 'x@acme.example', 'analyst', %s)", (org, OWNER)))
denied("can't create an already-accepted invitation", run(OWNER, "insert into public.organization_invitations (organization_id, email, role, accepted_at) values (%s, 'x@acme.example', 'analyst', now())", (org,)))
r = run(ADMIN, INV, (org, "new.person@acme.example", "editor"))
ok("admin invites a colleague", r)
inv = r[1][0][0] if r[0] == "ok" else None
denied("only one open invitation per email", run(OWNER, INV, (org, "new.person@acme.example", "analyst")))

check("owner sees pending invitation", run(OWNER, "select count(*) from public.organization_invitations")[1][0][0] == 1)
check("editor can't see invitations", run(EDITOR, "select count(*) from public.organization_invitations")[1][0][0] == 0)
check("stranger can't see invitations", run(STRANGER, "select count(*) from public.organization_invitations")[1][0][0] == 0)
check("invitee sees it with the business name", run(NEWBIE, "select organization_name, role::text from public.my_invitations()")[1] == [("Acme", "editor")])
check("invitee can't read the business before joining", run(NEWBIE, "select count(*) from public.organizations")[1][0][0] == 0)
denied("invitations can't be edited directly", run(NEWBIE, "update public.organization_invitations set role='admin' where id=%s", (inv,)), "permission denied")
denied("stranger can't accept someone else's invitation", run(STRANGER, "select public.accept_invitation(%s)", (inv,)), "not found")
denied("public can't call invitation functions", run("anon", "select public.accept_invitation(%s)", (inv,)), "permission denied")

ok("invitee accepts", run(NEWBIE, "select public.accept_invitation(%s)", (inv,)))
check("invitee joins with the invited role", run(NEWBIE, "select role::text from public.organization_members where user_id=%s", (NEWBIE,))[1] == [("editor",)])
check("invitee now sees the business", run(NEWBIE, "select name from public.organizations")[1] == [("Acme",)])
denied("an invitation works only once", run(NEWBIE, "select public.accept_invitation(%s)", (inv,)), "no longer open")
check("accepted invitation no longer listed", run(NEWBIE, "select count(*) from public.my_invitations()")[1][0][0] == 0)

team = run(EDITOR, "select email, role::text from public.organization_team(%s)", (org,))
check("members see the team with emails", team[0] == "ok" and len(team[1]) == 4 and ("new.person@acme.example", "editor") in team[1])
check("outsiders get no team list", run(STRANGER, "select count(*) from public.organization_team(%s)", (org,))[1][0][0] == 0)

r = run(OWNER, INV, (org, "stranger@other.example", "analyst")); inv2 = r[1][0][0]
ok("invitee can decline", run(STRANGER, "select public.close_invitation(%s)", (inv2,)))
denied("declined invitation can't be accepted", run(STRANGER, "select public.accept_invitation(%s)", (inv2,)), "no longer open")
r = run(OWNER, INV, (org, "stranger@other.example", "analyst")); inv3 = r[1][0][0]
check("a new invitation can follow a closed one", r[0] == "ok")
denied("editor can't cancel invitations", run(EDITOR, "select public.close_invitation(%s)", (inv3,)), "not found")
ok("admin cancels an invitation", run(ADMIN, "select public.close_invitation(%s)", (inv3,)))
check("cancelled invitation disappears for invitee", run(STRANGER, "select count(*) from public.my_invitations()")[1][0][0] == 0)

r = run(OWNER, INV, (org, "stranger@other.example", "analyst")); inv4 = r[1][0][0]
run(None, "update public.organization_invitations set expires_at = now() - interval '1 minute' where id=%s", (inv4,))
denied("expired invitation can't be accepted", run(STRANGER, "select public.accept_invitation(%s)", (inv4,)), "expired")

ok("deleting the organization removes its invitations", run(OWNER, "delete from public.organizations where id=%s", (org,)))
check("no invitations left", run(None, "select count(*) from public.organization_invitations")[1][0][0] == 0)

print("\n".join(results))
print(f"{sum(r.startswith('PASS') for r in results)} passed, {sum(r.startswith('FAIL') for r in results)} failed")
