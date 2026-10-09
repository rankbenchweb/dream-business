"""End-to-end: advertiser campaigns from submission to end. Same setup as accounts_e2e.py.
Usage: python3 campaigns_e2e.py <email_log> <path to axe.min.js>"""
import fnmatch, json, os, re, sys, time
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

import datetime
FUTURE = (datetime.date.today() + datetime.timedelta(days=10)).isoformat()
LATER = (datetime.date.today() + datetime.timedelta(days=40)).isoformat()
PAST = (datetime.date.today() - datetime.timedelta(days=3)).isoformat()

with sync_playwright() as p:
    br = p.chromium.launch()
    o = br.new_context(viewport={"width": 1280, "height": 900}).new_page(); o.on("pageerror", lambda e: errs.append(str(e)))
    s = br.new_context(viewport={"width": 1280, "height": 900}).new_page(); s.on("pageerror", lambda e: errs.append(str(e)))
    x = br.new_context().new_page()

    sign_in(o, "ads@gamma.example")
    o.get_by_role("link", name="Create business profile").click(); wait_path(o, "**/organizations/new")
    o.get_by_label("Business name").fill("Gamma Goods"); o.get_by_role("button", name="Create business profile").click(); wait_path(o, "**notice=org-created")
    check("campaign section offered to the owner", seen(o.get_by_role("heading", name="Promotion campaigns")) and seen(o.get_by_text("No campaigns yet.")))

    # A live listing to feature
    o.get_by_role("link", name="Add a listing for Gamma Goods").click(); wait_path(o, "**/account/listings/new**")
    o.get_by_label("Listing name").fill("Gamma Kitchenware"); o.get_by_label("Category").select_option(label="Dropshipping suppliers")
    o.get_by_label("Summary").fill("Kitchenware dropshipping with 3 to 5 day delivery across the UAE and Saudi Arabia.")
    o.locator("main").get_by_role("textbox", name=re.compile(r"^Website")).fill("gamma.example"); o.get_by_label("United Arab Emirates").check()
    o.get_by_role("button", name="Submit for review").click(); wait_path(o, "**notice=listing-submitted")
    sign_in(s, "staff@example.com", "/staff/review"); wait_path(s, "**/staff/review")
    s.locator("li", has_text="Gamma Kitchenware").get_by_role("button", name="Publish").click(); wait_path(s, "**notice=publish")

    # Validation
    o.goto(B + "/account", wait_until="load")
    o.get_by_role("link", name="New campaign for Gamma Goods").click(); wait_path(o, "**/account/campaigns/new**")
    o.get_by_role("button", name="Submit for review").click()
    check("empty campaign shows errors", seen(o.get_by_text("Choose an advertising level.")) and seen(o.get_by_text("Choose a placement.")) and seen(o.get_by_text("Write a headline")))
    axe(o, "campaign form with errors")
    o.get_by_label("Campaign name").fill("Autumn feature")
    o.get_by_label("Growth advertising").check()
    o.get_by_label("Placement").select_option("directory_featured")
    o.get_by_label("Headline").fill("Kitchenware delivered in 3 to 5 days across the Gulf")
    o.get_by_label("Link destination").fill("http://gamma.example/offer")
    o.get_by_label("Preferred start date").fill(PAST)
    o.get_by_role("button", name="Submit for review").click()
    check("featured listing must be chosen", seen(o.get_by_text("A featured listing needs one of your published listings.")))
    check("insecure link rejected", seen(o.get_by_text("Enter the secure (https) page")))
    check("past start date rejected", seen(o.get_by_text("Choose today or a later date.")))
    check("typed values kept after errors", o.get_by_label("Campaign name").input_value() == "Autumn feature" and o.get_by_label("Growth advertising").is_checked())
    check("chosen placement kept after errors", o.get_by_label("Placement").input_value() == "directory_featured")
    o.get_by_label("Listing to promote").select_option(label="Gamma Kitchenware")
    o.get_by_label("Link destination").fill("gamma.example/offer")
    o.get_by_label("Preferred start date").fill(FUTURE); o.get_by_label("Preferred end date").fill(LATER)
    o.get_by_label("Budget and notes").fill("Around 300 dollars for the month.")
    o.screenshot(path="shots/campaign-form.png", full_page=True)
    o.get_by_role("button", name="Submit for review").click(); wait_path(o, "**notice=campaign-submitted")
    check("campaign listed as in review", seen(o.get_by_role("link", name="Autumn feature")) and seen(o.get_by_text("In review", exact=True)))
    o.get_by_role("link", name="Autumn feature").click(); wait_path(o, "**/account/campaign?id=**")
    camp_url = o.evaluate("location.href")
    axe(o, "campaign page")
    o.get_by_role("button", name="Withdraw from review").click(); wait_path(o, "**notice=campaign-withdrawn")
    o.goto(camp_url, wait_until="load")
    check("withdrawn campaign is editable again", seen(o.get_by_label("Headline")) and o.get_by_label("Headline").input_value().startswith("Kitchenware delivered"))
    o.get_by_role("button", name="Submit for review").click(); wait_path(o, "**notice=campaign-submitted")

    sign_in(x, "outsider@nowhere.example"); x.goto(camp_url, wait_until="load")
    check("outsiders can't open the campaign", seen(x.get_by_role("heading", name=NOT_FOUND)))

    # Staff review
    s.goto(B + "/staff/review", wait_until="load")
    check("staff sees the campaign waiting", seen(s.get_by_role("heading", name="Campaigns (1)")) and seen(s.get_by_text("Around 300 dollars")))
    axe(s, "staff review with campaign")
    s.get_by_role("button", name="Return with note campaign Autumn feature").click(); wait_path(s, "**notice=note-needed**")
    check("returning a campaign needs a note", seen(s.get_by_text("Add a note of at least 10 characters")))
    s.get_by_label("Note to the advertiser (needed to return it)").fill("Please remove the delivery claim or show how it's measured.")
    s.get_by_role("button", name="Return with note campaign Autumn feature").click(); wait_path(s, "**notice=return-campaign**")
    o.goto(camp_url, wait_until="load")
    check("owner sees changes needed and the note", seen(o.get_by_text("Changes needed", exact=True)) and seen(o.get_by_text("Please remove the delivery claim")))
    o.get_by_label("Headline").fill("Kitchenware for Gulf online stores")
    o.get_by_role("button", name="Submit for review").click(); wait_path(o, "**notice=campaign-submitted")

    s.goto(B + "/staff/review", wait_until="load")
    s.get_by_role("button", name="Approve campaign Autumn feature").click(); wait_path(s, "**notice=approve**")
    o.goto(camp_url, wait_until="load")
    check("owner sees approval and that payment is agreed first", seen(o.get_by_text("We'll contact you to confirm dates and payment before it goes live.")))
    s.get_by_role("button", name="Mark as live campaign Autumn feature").click(); wait_path(s, "**notice=go-live**")
    o.goto(camp_url, wait_until="load")
    check("owner sees the campaign live", seen(o.get_by_text("Running now.")))
    o.get_by_role("button", name="Pause campaign").click(); wait_path(o, "**notice=campaign-paused")
    check("owner pauses a live campaign", seen(o.get_by_text("Paused", exact=True)))
    s.goto(B + "/staff/review", wait_until="load")
    s.get_by_role("button", name="Resume campaign Autumn feature").click(); wait_path(s, "**notice=go-live**")
    o.goto(camp_url, wait_until="load")
    o.get_by_label("Headline").fill("Kitchenware for online stores across the Gulf")
    o.get_by_role("button", name="Save changes").click(); wait_path(o, "**notice=campaign-submitted")
    check("changing a live campaign sends it back to review", seen(o.get_by_text("In review", exact=True)))
    s.goto(B + "/staff/review", wait_until="load")
    s.get_by_role("button", name="Approve campaign Autumn feature").click(); wait_path(s, "**notice=approve**")
    s.get_by_role("button", name="End campaign Autumn feature").click(); wait_path(s, "**notice=end**")
    check("ended campaign leaves the staff list", seen(s.get_by_role("heading", name="Campaigns (0)")))
    o.goto(camp_url, wait_until="load")
    check("owner sees the campaign ended, read-only", seen(o.get_by_text("Ended", exact=True)) and o.get_by_label("Headline").count() == 0)

    # A draft can be deleted
    o.goto(B + "/account/campaigns/new", wait_until="load")
    o.get_by_label("Campaign name").fill("Test draft"); o.get_by_label("Self-service promotion").check(); o.get_by_label("Placement").select_option("sponsored_article")
    o.get_by_label("Headline").fill("A draft to delete"); o.get_by_label("Link destination").fill("gamma.example")
    o.get_by_role("button", name="Save as draft").click(); wait_path(o, "**notice=campaign-saved")
    o.get_by_role("link", name="Test draft").click(); wait_path(o, "**/account/campaign?id=**")
    o.get_by_role("button", name="Delete draft").click(); wait_path(o, "**notice=campaign-deleted")
    check("draft campaign deleted", o.get_by_role("link", name="Test draft").count() == 0)

    check(f"no uncaught page errors ({len(errs)})", not errs)
    br.close()
print(f"{sum(r.startswith('PASS') for r in results)} passed, {sum(r.startswith('FAIL') for r in results)} failed")
for e in errs: print("ERR", e)
