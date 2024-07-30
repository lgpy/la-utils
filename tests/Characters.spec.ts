import { test, expect, type Page } from "@playwright/test";

test.describe("Characters", () => {
  test.describe.configure({ mode: "serial" });
  let page: Page;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test("navigate to Characters", async () => {
    await page.goto("http://localhost:3000/");
    await page.click("text=Characters");
    await page.getByRole("link", { name: "Characters" }).click();
    await expect(page).toHaveURL("http://localhost:3000/characters");
  });

  test("no characters message", async () => {
    await page.goto("http://localhost:3000/characters");
    await page.getByText("You have no characters").isVisible();
    await expect(page.getByText("You have no characters")).toBeVisible();
  });

  test("create character", async () => {
    await page.goto("http://localhost:3000/characters");
    await page.getByRole("button", { name: "Create Character" }).click();
    await page.fill('input[name="name"]', "Test Character");
    await page.getByLabel("Class").click();
    await page.getByRole("option", { name: "Berserker" }).click();
    await page.fill('input[name="itemLevel"]', "1600");
    await page.click('text="Confirm"');
    await expect(page.getByText("Test Character")).toBeVisible();
    await expect(page.getByText("Berserker")).toBeVisible();
    await expect(page.getByText("1600")).toBeVisible();
    await expect(page.getByText("You have no characters")).not.toBeVisible();
  });

  test("edit character", async () => {
    await page.goto("http://localhost:3000/characters");
    await page.getByRole("main").getByRole("button").first().click();
    await page.getByPlaceholder("Your character's name...").fill("testtest");
    await page.getByLabel("Class").click();
    await page.getByRole("option", { name: "Breaker" }).click();
    await page.getByPlaceholder("Your character's item level...").fill("1640");
    await page.getByRole("button", { name: "Confirm" }).click();
    await expect(page.getByRole("main")).toContainText("1640");
    await expect(page.getByRole("heading")).toContainText("testtest");
    await expect(page.getByRole("main")).toContainText("Breaker");
  });

  test("add raid", async () => {
    await page.goto("http://localhost:3000/characters");
    await page.getByRole("button", { name: "Add raid" }).click();
    await page.getByLabel("Raid", { exact: true }).click();
    await page.getByRole("option", { name: "Brelshaza" }).click();
    await page
      .getByLabel("Select difficulty for G1")
      .getByLabel("Normal")
      .click();
    await page
      .getByLabel("Select difficulty for G2")
      .getByLabel("Hard")
      .click();
    await page
      .getByLabel("Select difficulty for G3")
      .getByLabel("Normal")
      .click();
    await page.getByRole("button", { name: "Confirm" }).click();
    await expect(page.getByRole("main")).toContainText("Brelshaza");
    await expect(page.getByRole("main")).toContainText("NHN");
  });

  test("edit raid", async () => {
    await page.goto("http://localhost:3000/characters");
    await page.getByRole("main").getByRole("button").nth(2).click();
    await page.getByText("Edit").click();
    await page
      .getByLabel("Select difficulty for G1")
      .getByLabel("Hard")
      .click();
    await page
      .getByLabel("Select difficulty for G3")
      .getByLabel("Hard")
      .click();
    await page
      .getByLabel("Select difficulty for G4")
      .getByLabel("Normal")
      .click();
    await page.getByRole("button", { name: "Confirm" }).click();
    await expect(page.getByRole("main")).toContainText("Brelshaza");
    await expect(page.getByRole("main")).toContainText("HHHN");
  });

  test("delete raid", async () => {
    await page.goto("http://localhost:3000/characters");
    await page.getByRole("main").getByRole("button").nth(2).click();
    await page.getByText("Delete Raid").click();
    await expect(page.getByRole("main")).not.toContainText("Brelshaza");
    await expect(page.getByRole("main")).not.toContainText("HHHN");
  });

  test("delete character and undo", async () => {
    await page.getByRole("button").nth(2).click();
    page.once("dialog", (dialog) => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.accept().catch(() => {});
    });
    await page.getByRole("button").first().click();
    await expect(page.getByRole("main")).not.toContainText("testtest");
    await page.getByRole("button", { name: "Undo" }).click();
    await expect(page.getByRole("heading")).toContainText("testtest");
    await expect(page.getByRole("main")).toContainText("Breaker");
    await expect(page.getByRole("main")).toContainText("1640");
  });
});
