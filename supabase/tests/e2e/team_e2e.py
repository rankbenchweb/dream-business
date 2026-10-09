"""End-to-end: team invitations, roles and removal. Same setup as accounts_e2e.py.
Usage: python3 team_e2e.py <email_log> <path to axe.min.js>"""
import fnmatch, json, os, sys, time
from playwright.sync_api import sync_playwright

B = "http://localhost:3102"
EMAILS, AXE = sys.argv[1], open(sys.argv[2]).read()
results, errs = [], []
NOT_FOUND = "This page isn't on the route."

def check(name, cond):
    results.append(("PASS " if cond else "FAIL ") + name); print(results[-1], flush=True)

def seen(loc, timeout=8000):
    try:
        loc.first.wait_for(state="visible", timeout=timeout); return True
    except Exception:
        return False

def wait_path(page, pattern, timeout=15):
    end = time.time() + timeout
    while time.time() < end:
        href = page.evaluate("location.href")
        if fnmatch.fnmatch(href, pattern): return href
        time.sleep(0.15)
    raise AssertionError(f"timed out waiting for {pattern}, at {page.evaluate('location.href')}")

def sign_in(page, email, nxt="/account"):
    n = sum(1 for _ in open(EMAILS)) if os.path.exists(EMAILS) else 0
    page.goto(B + f"/sign-in?next={nxt}", wait_until="load")
    page.get_by_label("Email address").fill(email)
    page.get_by_role("button", name="Email me a sign-in link").click()
    page.get_by_role("heading", name="Check your email").wait_for()
    for _ in range(50):
        if os.path.exists(EMAILS) and sum(1 for _ in open(EMAILS)) > n: break
        time.sleep(0.1)
    link = [json.loads(l) for l in open(EMAILS) if json.loads(l)["to"] == email][-1]["link"]
    page.goto(link, wait_until="load")
    seen(page.get_by_text("Signed in as"))

def axe(page, label):
    page.add_script_tag(content=AXE)
    v = page.evaluate("async () => (await axe.run(document, {runOnly: ['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']})).violations")
    check(f"no accessibility issues: {label}" + ("" if not v else f" {[(x['id'], x['nodes'][0]['target']) for x in v]}"), not v)

with sync_playwright() as p:
    br = p.chromium.launch()
    o = br.new_context(viewport={"width": 1280, "height": 900}).new_page(); o.on("pageerror", lambda e: errs.append(str(e)))
    c = br.new_context(viewport={"width": 390, "height": 844}).new_page(); c.on("pageerror", lambda e: errs.append(str(e)))
    x = br.new_context().new_page()

    sign_in(o, "boss@beta.example")
    o.get_by_role("link", name="Create business profile").click(); wait_path(o, "**/organizations/new")
    o.get_by_label("Business name").fill("Beta Traders"); o.get_by_role("button", name="Create business profile").click()
    wait_path(o, "**notice=org-created")
    o.get_by_role("link", name="Manage team for Beta Traders").click(); wait_path(o, "**/account/team?org=*")
    team_url = o.evaluate("location.href").split("&")[0]
    check("owner sees themselves as the only member", seen(o.get_by_role("heading", name="Members (1)")) and seen(o.get_by_text("Owner · Joined")))
    o.get_by_label("Their email address").fill("not-an-email"); o.get_by_role("button", name="Send invitation").click()
    check("invalid email rejected and kept", seen(o.get_by_text("Enter their email address")) and o.get_by_label("Their email address").input_value() == "not-an-email")
    o.get_by_label("Their email address").fill("Colleague@Beta.example"); o.get_by_label("Role").select_option("editor")
    o.get_by_role("button", name="Send invitation").click(); wait_path(o, "**notice=invited")
    check("invitation listed as waiting", seen(o.get_by_role("heading", name="Waiting to be accepted (1)")) and seen(o.get_by_text("colleague@beta.example")))
    o.get_by_label("Their email address").fill("colleague@beta.example"); o.get_by_role("button", name="Send invitation").click()
    check("duplicate invitation refused", seen(o.get_by_text("There's already an open invitation for that email.")))
    o.screenshot(path="shots/team-owner.png", full_page=True)
    axe(o, "team page (owner)")

    x_email = "nosy@else.example"; sign_in(x, x_email)
    x.goto(team_url, wait_until="load")
    check("outsiders can't open another business's team page", seen(x.get_by_role("heading", name=NOT_FOUND)))
    check("invitation is not shown to other people", not x.get_by_text("Beta Traders").count())

    sign_in(c, "colleague@beta.example")
    check("invitee sees the invitation on their account", seen(c.get_by_text("invited you as editor")))
    c.screenshot(path="shots/invite-mobile.png", full_page=True)
    axe(c, "account with invitation (mobile)")
    c.get_by_role("button", name="Accept invitation from Beta Traders").click(); wait_path(c, "**notice=invite-accepted")
    check("after accepting, the business appears with the editor role", seen(c.get_by_role("heading", name="Beta Traders")) and seen(c.get_by_text("Your role: Editor")))
    check("editor can add listings", seen(c.get_by_role("link", name="Add a listing for Beta Traders")))
    c.get_by_role("link", name="View team for Beta Traders").click(); wait_path(c, "**/account/team?org=*")
    check("editor sees the team but can't invite", seen(c.get_by_role("heading", name="Members (2)")) and c.get_by_role("button", name="Send invitation").count() == 0)
    check("editor can't change roles", c.get_by_label("Role for boss@beta.example").count() == 0)

    o.goto(team_url, wait_until="load")
    check("accepted invitation leaves the waiting list", seen(o.get_by_role("heading", name="Waiting to be accepted (0)")))
    o.get_by_label("Role for colleague@beta.example").select_option("analyst")
    o.get_by_role("button", name="Save role for colleague@beta.example").click(); wait_path(o, "**notice=role-changed")
    check("owner changes the role", seen(o.get_by_text("Analyst · Joined")))
    c.goto(B + "/account", wait_until="load")
    check("analyst can no longer add listings", seen(c.get_by_text("Your role: Analyst")) and c.get_by_role("link", name="Add a listing for Beta Traders").count() == 0)

    o.get_by_role("button", name="Leave this business").click(); wait_path(o, "**notice=last-owner")
    check("the only owner can't leave", seen(o.get_by_text("A business must keep at least one owner")))

    o.get_by_label("Their email address").fill("third@beta.example"); o.get_by_role("button", name="Send invitation").click(); wait_path(o, "**notice=invited")
    o.get_by_role("button", name="Cancel invitation for third@beta.example").click(); wait_path(o, "**notice=invite-cancelled")
    check("owner cancels an invitation", seen(o.get_by_role("heading", name="Waiting to be accepted (0)")))
    t = br.new_context().new_page(); sign_in(t, "third@beta.example")
    check("cancelled invitation isn't offered", seen(t.get_by_role("heading", name="Start with your business profile")) and t.get_by_text("invited you").count() == 0)

    o.get_by_role("button", name="Remove colleague@beta.example").click(); wait_path(o, "**notice=member-removed")
    check("owner removes a member", seen(o.get_by_role("heading", name="Members (1)")))
    c.goto(B + "/account", wait_until="load")
    check("removed member loses access", seen(c.get_by_role("heading", name="Start with your business profile")))
    c.goto(team_url, wait_until="load")
    check("removed member can't open the team page", seen(c.get_by_role("heading", name=NOT_FOUND)))

    o.goto(team_url, wait_until="load")
    o.get_by_label("Their email address").fill("colleague@beta.example"); o.get_by_role("button", name="Send invitation").click(); wait_path(o, "**notice=invited")
    c.goto(B + "/account", wait_until="load")
    c.get_by_role("button", name="Decline invitation from Beta Traders").click(); wait_path(c, "**notice=invite-declined")
    check("invitee can decline", seen(c.get_by_text("Invitation declined.")) and c.get_by_text("invited you").count() == 0)

    check(f"no uncaught page errors ({len(errs)})", not errs)
    br.close()
print(f"{sum(r.startswith('PASS') for r in results)} passed, {sum(r.startswith('FAIL') for r in results)} failed")
for e in errs: print("ERR", e)
