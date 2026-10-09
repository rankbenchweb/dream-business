"""End-to-end: sign-in, business profile, listing, staff review, public directory.
Run the site built with NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_test,
started on port 3102 with SUPABASE_SERVICE_ROLE_KEY=sb_secret_test STAFF_EMAILS=staff@example.com, and fake_supabase.py running.
Usage: python3 accounts_e2e.py <email_log> <screenshot_dir>"""
import json, re, sys, time
from playwright.sync_api import sync_playwright, expect

B = "http://localhost:3102"
EMAILS = sys.argv[1]
OUT = sys.argv[2]
results, errs = [], []


def check(name, cond):
    results.append(("PASS " if cond else "FAIL ") + name); print(results[-1], flush=True)


def seen(loc, timeout=8000):
    try:
        loc.first.wait_for(state="visible", timeout=timeout)
        return True
    except Exception:
        return False


def wait_path(page, pattern, timeout=15):
    import fnmatch
    end = time.time() + timeout
    while time.time() < end:
        try:
            href = page.evaluate("location.href")
            if fnmatch.fnmatch(href, pattern):
                return href
        except Exception:
            pass
        time.sleep(0.15)
    raise AssertionError(f"timed out waiting for {pattern}, at {page.evaluate('location.href')}")


def last_link(email):
    for _ in range(30):
        try:
            lines = [json.loads(l) for l in open(EMAILS)]
            mine = [l for l in lines if l["to"] == email]
            if mine:
                return mine[-1]
        except FileNotFoundError:
            pass
        time.sleep(0.2)
    raise RuntimeError("no email for " + email)


def sign_in(page, email, next_path="/account"):
    page.goto(B + f"/sign-in?next={next_path}", wait_until="load")
    n_before = sum(1 for _ in open(EMAILS)) if __import__("os").path.exists(EMAILS) else 0
    page.get_by_label("Email address").fill(email)
    page.get_by_role("button", name="Email me a sign-in link").click()
    page.get_by_role("heading", name="Check your email").wait_for()
    for _ in range(30):
        if sum(1 for _ in open(EMAILS)) > n_before:
            break
        time.sleep(0.2)
    mail = last_link(email)
    page.goto(mail["link"], wait_until="load")
    return mail


with sync_playwright() as p:
    br = p.chromium.launch()

    # ---- Owner signs up -------------------------------------------------
    ctx = br.new_context(viewport={"width": 1280, "height": 900})
    pg = ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(B + "/account", wait_until="load")
    wait_path(pg, "**/sign-in?next=%2Faccount")
    check("signed-out visitor sent from account to sign-in", True)
    pg.get_by_role("button", name="Email me a sign-in link").click()
    pg.get_by_text("Enter your email address, like name@company.com.").wait_for(timeout=5000)
    check("email required", True)
    mail = sign_in(pg, "owner@example.com")
    check("sign-in email uses secure PKCE flow", mail["pkce"])
    check("link signs in and returns to account", pg.evaluate("location.pathname") == "/account" and seen(pg.get_by_text("Signed in as owner@example.com")))
    check("new account prompted to create business profile", seen(pg.get_by_role("heading", name="Start with your business profile")))
    pg.screenshot(path=f"{OUT}/account-empty.png", full_page=True)

    # Reusing the link fails cleanly
    fresh = br.new_context().new_page()
    fresh.goto(mail["link"], wait_until="load")
    fresh.get_by_text("That sign-in link has expired or was already used").wait_for(timeout=10000)
    check("used link shows clear error", True)
    fresh.context.close()
    pg.goto(B + "/sign-in", wait_until="load")
    check("signed-in visitor to sign-in page sees continue option", seen(pg.get_by_role("heading", name="You're signed in")))
    pg.goto(B + "/account", wait_until="load")

    # ---- Business profile ----------------------------------------------
    pg.get_by_role("link", name="Create business profile").click()
    wait_path(pg, "**/account/organizations/new")
    pg.get_by_label("Business name").fill("Acme Supply Co")
    pg.locator("main").get_by_role("textbox", name=re.compile(r"^Website")).fill("http://acme.example")
    pg.get_by_role("button", name="Create business profile").click()
    pg.get_by_text("Enter a secure website address").wait_for()
    check("insecure website rejected, name kept", pg.get_by_label("Business name").input_value() == "Acme Supply Co")
    pg.locator("main").get_by_role("textbox", name=re.compile(r"^Website")).fill("acme.example")
    pg.get_by_role("button", name="Create business profile").click()
    wait_path(pg, "**/account?notice=org-created")
    check("profile created, owner role shown", seen(pg.get_by_role("heading", name="Acme Supply Co")) and seen(pg.get_by_text("Your role: Owner")))

    # ---- Listing ----------------------------------------------------------
    pg.get_by_role("link", name="Add a listing").click()
    wait_path(pg, "**/account/listings/new**")
    pg.get_by_label("Listing name").fill("Acme Private Label")
    pg.get_by_role("button", name="Submit for review").click()
    pg.get_by_text("Check the highlighted fields.").wait_for()
    check("listing validation shows field errors", seen(pg.get_by_text("Choose the category that fits best.")) and seen(pg.get_by_text("Choose at least one market you serve.")))
    check("typed name kept after failed submit", pg.get_by_label("Listing name").input_value() == "Acme Private Label")
    pg.get_by_label("Category").select_option(label="Manufacturers and wholesalers")
    pg.get_by_role("button", name="Save as draft").click()
    pg.get_by_role("button", name="Working…").first.wait_for(state="detached", timeout=10000)
    pg.wait_for_timeout(300)
    check("chosen category kept after errors", pg.get_by_label("Category").input_value() != "")
    pg.get_by_label("Summary").fill("Private label manufacturing of home goods for small brands, from 200 units.")
    pg.locator("main").get_by_role("textbox", name=re.compile(r"^Website")).fill("acme.example")
    pg.get_by_label("Pakistan").check()
    pg.get_by_label("United Kingdom").check()
    check("fixed fields lose their error highlight", pg.get_by_text("Choose at least one market you serve.").count() == 0 and pg.get_by_text("Choose the category that fits best.").count() == 0)
    pg.screenshot(path=f"{OUT}/listing-form.png", full_page=True)
    pg.get_by_role("button", name="Submit for review").click()
    wait_path(pg, "**/account?notice=listing-submitted")
    check("listing submitted and shown as in review", seen(pg.get_by_text("In review", exact=True)))
    pg.screenshot(path=f"{OUT}/account-listing.png", full_page=True)
    pg.get_by_role("link", name="Acme Private Label", exact=True).click()
    wait_path(pg, "**/account/listing?id=**")
    listing_url = pg.evaluate("location.href")
    pg.get_by_role("button", name="Withdraw from review").click()
    wait_path(pg, "**/account?notice=listing-withdrawn")
    check("withdraw returns listing to draft", seen(pg.get_by_text("Draft", exact=True)))
    pg.goto(listing_url, wait_until="load")
    check("draft keeps saved values", pg.get_by_label("Summary").input_value().startswith("Private label manufacturing") and pg.get_by_label("Pakistan").is_checked())
    pg.get_by_role("button", name="Submit for review").click()
    wait_path(pg, "**/account?notice=listing-submitted")

    # ---- Outsider -------------------------------------------------------------
    octx = br.new_context()
    op = octx.new_page()
    sign_in(op, "other@example.com")
    op.goto(listing_url, wait_until="load")
    check("other users cannot open the listing", seen(op.get_by_role("heading", name="This page isn't on the route.")))
    op.goto(B + "/staff/review", wait_until="load")
    check("non-staff cannot open review queue", seen(op.get_by_role("heading", name="This page isn't on the route.")) and not op.get_by_role("button", name="Publish").count())
    op.goto(B + "/marketplace#directory", wait_until="load")
    seen(op.get_by_text("The first listings are in review"))
    check("listing in review is not public", op.get_by_text("Acme Private Label").count() == 0)

    # ---- Staff review --------------------------------------------------------
    sctx = br.new_context(viewport={"width": 1280, "height": 900})
    sp = sctx.new_page()
    sp.on("pageerror", lambda e: errs.append(str(e)))
    sign_in(sp, "staff@example.com", "/staff/review")
    wait_path(sp, "**/staff/review")
    check("staff sees the queue with one listing", seen(sp.get_by_role("heading", name="Waiting for review (1)")))
    sp.get_by_role("button", name="Return with note").click()
    wait_path(sp, "**notice=note-needed**")
    check("returning needs a note", seen(sp.get_by_text("Add a note of at least 10 characters")))
    sp.get_by_label("Note to the business (needed to return it)").fill("Please add your minimum order quantity and lead time.")
    sp.get_by_role("button", name="Return with note").click()
    wait_path(sp, "**notice=reject")
    check("returned listing leaves the queue", seen(sp.get_by_role("heading", name="Waiting for review (0)")))

    pg.goto(listing_url, wait_until="load")
    check("owner sees changes needed and reviewer note", seen(pg.get_by_text("Changes needed", exact=True).first) and seen(pg.get_by_text("Please add your minimum order quantity")))
    pg.get_by_label("Full description").fill("Minimum order 200 units. Lead time 30 days. Factory audited annually.")
    pg.get_by_role("button", name="Submit for review").click()
    wait_path(pg, "**/account?notice=listing-submitted")

    sp.goto(B + "/staff/review", wait_until="load")
    sp.get_by_role("button", name="Publish").click()
    wait_path(sp, "**notice=publish")
    check("staff publishes", seen(sp.get_by_role("heading", name="Live listings (1)")))

    op.goto(B + "/marketplace", wait_until="load")
    check("published listing appears in public directory", seen(op.get_by_role("heading", name="Acme Private Label")))
    check("not marked verified yet", op.locator("#directory").get_by_text("Verified", exact=True).count() == 0)

    sp.get_by_role("button", name="Mark as verified").click()
    wait_path(sp, "**notice=scope-needed**")
    sp.get_by_label("What was verified (needed to verify)").fill("Company registration and website ownership checked")
    sp.get_by_role("button", name="Mark as verified").click()
    wait_path(sp, "**notice=verify")
    op.goto(B + "/about", wait_until="load")
    op.goto(B + "/marketplace#directory", wait_until="load")

    check("verified label and scope shown publicly", seen(op.locator("#directory").get_by_text("Verified", exact=True)) and seen(op.get_by_text("Checked: Company registration")))
    op.get_by_label("Serves").select_option("us")
    check("market filter hides listings that don't serve the US", seen(op.get_by_text("No listings match these filters yet.")))
    op.get_by_label("Serves").select_option("pk")
    check("market filter shows Pakistan listing", seen(op.get_by_role("heading", name="Acme Private Label")))
    op.screenshot(path=f"{OUT}/directory.png", full_page=True)

    # ---- Owner edits a live listing -------------------------------------------
    pg.goto(listing_url, wait_until="load")
    check("live listing warns that edits go back to review", seen(pg.get_by_text("Saving changes sends it back for review")))
    pg.get_by_label("Summary").fill("Private label manufacturing of home and kitchen goods for brands, from 200 units.")
    pg.get_by_role("button", name="Save changes").click()
    wait_path(pg, "**/account?notice=listing-submitted")
    check("edited live listing is back in review", seen(pg.get_by_text("In review", exact=True)))
    op.goto(B + "/marketplace", wait_until="load")
    check("edited listing leaves the public directory immediately", op.get_by_role("heading", name="Acme Private Label").count() == 0)

    # ---- Safety checks ---------------------------------------------------------
    r = op.request.post(B + "/auth/callback?code=bad&next=//evil.example", max_redirects=0)
    g = op.request.get(B + "/auth/callback?code=bad&next=//evil.example", max_redirects=0)
    check("callback never redirects off-site", "evil.example" not in (g.headers.get("location") or "").split("?")[0])
    check("sign-out only accepts POST", op.request.get(B + "/auth/sign-out", max_redirects=0).status in (404, 405))

    # ---- Sign out -------------------------------------------------------------
    pg.goto(B + "/account", wait_until="load")
    pg.get_by_role("button", name="Sign out").click()
    wait_path(pg, "**/?signed-out=1")
    pg.goto(B + "/account", wait_until="load")
    wait_path(pg, "**/sign-in**")
    check("signed out user can't reach account", True)

    # Mobile layout of account page
    m = br.new_context(viewport={"width": 390, "height": 844}).new_page()
    sign_in(m, "owner@example.com")
    seen(m.get_by_text("Signed in as owner@example.com"))
    m.screenshot(path=f"{OUT}/account-mobile.png", full_page=True)
    check("account page has no sideways scroll on mobile", m.evaluate("document.documentElement.scrollWidth <= window.innerWidth"))

    check(f"no uncaught page errors ({len(errs)})", not errs)
    br.close()

print("\n".join(results))
for e in errs:
    print("ERR", e)
print(f"{sum(r.startswith('PASS') for r in results)} passed, {sum(r.startswith('FAIL') for r in results)} failed")
