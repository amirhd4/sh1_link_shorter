import re
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Login as admin
    page.goto("http://localhost:5173/pages/login")
    expect(page.get_by_role("heading", name="ورود به حساب کاربری")).to_be_visible()
    page.get_by_label("ایمیل").fill("admin@example.com")
    page.get_by_label("رمز عبور").fill("password")
    page.get_by_role("button", name="ورود").click()

    # Wait for navigation to the main links page
    expect(page).to_have_url(re.compile(".*pages/links"))

    # Go to Admin Dashboard and take a screenshot
    page.goto("http://localhost:5173/pages/admin/dashboard")
    expect(page.get_by_text("داشبورد ادمین")).to_be_visible(timeout=10000) # Increased timeout
    page.screenshot(path="jules-scratch/verification/admin_dashboard.png")

    # Go to a link's detail page and take a screenshot
    page.goto("http://localhost:5173/pages/links/0/test")
    expect(page.get_by_text("آمار و جزئیات لینک")).to_be_visible(timeout=10000) # Increased timeout
    ad_stats_section = page.get_by_text("آمار تبلیغاتی لینک")
    ad_stats_section.scroll_into_view_if_needed()
    expect(ad_stats_section).to_be_visible()
    page.screenshot(path="jules-scratch/verification/link_details_ad_stats.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)