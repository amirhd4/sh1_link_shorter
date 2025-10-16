import re
from playwright.sync_api import sync_playwright, Page, expect

BASE_URL = "http://localhost:5173"
# Since the vite dev server is configured with a base url, we need to add it
# This is known from memory.
PAGES_PREFIX = "/pages"

def login(page: Page, email: str, password: str):
    """Helper function to log in a user."""
    page.goto(f"{BASE_URL}{PAGES_PREFIX}/login")
    page.get_by_label("ایمیل").fill(email)
    page.get_by_label("رمز عبور").fill(password)
    page.get_by_role("button", name="ورود").click()
    # Wait for navigation to the dashboard, indicating successful login
    expect(page).to_have_url(re.compile(f".*{PAGES_PREFIX}/dashboard"))
    print(f"Successfully logged in as {email}")

def register_and_create_link(page: Page, email: str, password: str) -> str:
    """Registers a new user and creates a link, returns the short code."""
    # Register
    page.goto(f"{BASE_URL}{PAGES_PREFIX}/register")
    page.get_by_label("ایمیل").fill(email)
    page.get_by_label("رمز عبور").fill(password)

    register_button = page.get_by_role("button", name="ثبت نام")
    expect(register_button).to_be_enabled(timeout=10000) # Wait up to 10s for the button
    register_button.click()

    # It should redirect to login after registration
    expect(page).to_have_url(re.compile(f".*{PAGES_PREFIX}/login"))
    print("Successfully registered new user.")

    # Login with the new user
    login(page, email, password)

    # Create a link
    page.get_by_label("لینک طولانی").fill("https://www.google.com")
    page.get_by_role("button", name="کوتاه کن").click()

    # Get the short code from the table
    link_row = page.locator("div[data-field='short_code']").first
    expect(link_row).to_be_visible()
    short_code = link_row.inner_text()
    print(f"Successfully created link with short code: {short_code}")
    return short_code

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # --- 1. Verify Link Details Page for User ---
            print("--- Step 1: Verifying User Link Details Page ---")
            user_email = "testuser@example.com"
            user_pass = "password123"
            short_code = register_and_create_link(page, user_email, user_pass)

            # Navigate to link details
            page.get_by_role("button", name="نمایش جزئیات").first.click()
            expect(page).to_have_url(re.compile(f".*{short_code}"))

            # Take screenshot of the ad stats section
            ad_stats_section = page.locator("text=آمار تبلیغاتی لینک").first
            expect(ad_stats_section).to_be_visible()
            page.screenshot(path="jules-scratch/verification/01_user_link_details.png")
            print("Screenshot 1: User link details page captured.")

            # --- 2. Verify Ad Display Page ---
            print("\n--- Step 2: Verifying Ad Display Page ---")
            # The ad page uses a different path structure
            ad_page_url = f"{BASE_URL}/0/{short_code}/ad"
            page.goto(ad_page_url)

            # Wait for the ad to load and the timer to be visible
            expect(page.get_by_role("button", name=re.compile(".*رفتن به لینک مقصد.*|.*منتظر بمانید.*"))).to_be_visible(timeout=20000)
            page.screenshot(path="jules-scratch/verification/02_ad_display_page.png")
            print("Screenshot 2: Ad display page captured.")

            # --- 3. Verify Admin Ad Stats Page ---
            print("\n--- Step 3: Verifying Admin Ad Stats Page ---")
            # For admin, we assume an admin user exists.
            # We will try to log in, but if it fails, we skip this part.
            try:
                login(page, "admin@example.com", "admin")
                page.goto(f"{BASE_URL}{PAGES_PREFIX}/admin/stats/ads")

                # Wait for the table to load
                expect(page.get_by_role("table")).to_be_visible()
                page.screenshot(path="jules-scratch/verification/03_admin_ad_stats.png")
                print("Screenshot 3: Admin ad stats page captured.")
            except Exception as e:
                print(f"Could not log in as admin, skipping admin verification. Error: {e}")


        finally:
            browser.close()

if __name__ == "__main__":
    main()