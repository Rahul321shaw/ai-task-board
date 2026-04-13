import { test, expect } from "@playwright/test";

const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = "testpassword123";
const TEST_NAME = "Test User";

// Flow 1: Sign up a new user
test("user can sign up", async ({ page }) => {
  await page.goto("/signup");
  await page.getByTestId("name-input").fill(TEST_NAME);
  await page.getByTestId("email-input").fill(TEST_EMAIL);
  await page.getByTestId("password-input").fill(TEST_PASSWORD);
  await page.getByTestId("signup-button").click();
  await expect(page).toHaveURL("/dashboard");
});

// Flow 2: User can create a goal (without AI decomposition to avoid OpenAI dependency)
test("user can create a goal", async ({ page }) => {
  await page.goto("/login");
  await page.getByTestId("email-input").fill(TEST_EMAIL);
  await page.getByTestId("password-input").fill(TEST_PASSWORD);
  await page.getByTestId("login-button").click();
  await expect(page).toHaveURL("/dashboard");

  await page.getByTestId("new-goal-button").click();
  await page.getByTestId("goal-title-input").fill("Launch AI task board MVP");
  await page.getByTestId("goal-description-input").fill("Ship a working product in 6 weeks");

  // Uncheck AI decomposition to avoid requiring OpenAI key in tests
  const decomposeCheckbox = page.locator("#decompose");
  if (await decomposeCheckbox.isChecked()) {
    await decomposeCheckbox.uncheck();
  }

  await page.getByTestId("create-goal-button").click();
  await expect(page.locator("text=Launch AI task board MVP")).toBeVisible();
});

// Flow 3: User can sign out and sign in again
test("user can sign out and sign back in", async ({ page }) => {
  await page.goto("/login");
  await page.getByTestId("email-input").fill(TEST_EMAIL);
  await page.getByTestId("password-input").fill(TEST_PASSWORD);
  await page.getByTestId("login-button").click();
  await expect(page).toHaveURL("/dashboard");

  await page.locator("text=Sign out").click();
  await expect(page).toHaveURL("/login");

  // Sign back in
  await page.getByTestId("email-input").fill(TEST_EMAIL);
  await page.getByTestId("password-input").fill(TEST_PASSWORD);
  await page.getByTestId("login-button").click();
  await expect(page).toHaveURL("/dashboard");
});
