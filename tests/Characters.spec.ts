import { Class } from "@/lib/classes";
import { Difficulty } from "@/lib/raids";
import type { MainState } from "@/stores/main";
import { type Page, expect, test } from "@playwright/test";

const setCharacterState = async (
	page: Page,
	...characters: Partial<MainState["characters"][number]>[]
) => {
	await page.evaluate((characters) => {
		localStorage.setItem(
			"characters",
			JSON.stringify({
				state: {
					characters: characters.map((c, index) => ({
						assignedRaids: {},
						tasks: [],
						...c,
						id: index.toFixed(0),
					})),
				},
				version: 3,
			}),
		);
	}, characters);
	await page.reload();
};

test("navigate to Characters", async ({ page }) => {
	await page.goto("/");
	await page.click("text=Characters");
	await page.getByRole("link", { name: "Characters" }).click();
	await expect(page).toHaveURL("/characters");
});

test("no characters message", async ({ page }) => {
	await page.goto("/characters");
	await page.getByText("You have no characters").isVisible();
	await expect(page.getByText("You have no characters")).toBeVisible();
});

test("create character", async ({ page }) => {
	await page.goto("/characters");
	await page.getByTestId("create-character").click();
	await page.getByTestId("char-name").fill("Test Character");
	await page.getByLabel("Class").click();
	await page.getByRole("option", { name: "Berserker" }).click();
	await page.getByTestId("char-item-level").fill("1600");
	await page.getByTestId("confirm-button").click();
	const characterCard = await page.getByTestId("character-0");
	await expect(characterCard.getByTestId("character-class")).toContainText(
		"Berserker",
	);
	await expect(characterCard.getByTestId("character-name")).toContainText(
		"Test Character",
	);
	await expect(characterCard.getByTestId("character-item-level")).toContainText(
		"1600",
	);
	await expect(page.getByText("You have no characters")).not.toBeVisible();
});

test("edit character", async ({ page }) => {
	await page.goto("/characters");
	await setCharacterState(page, {
		name: "Test Character",
		class: Class.Berserker,
		itemLevel: 1600,
	});
	let characterCard = await page.getByTestId("character-0");
	await characterCard.getByTestId("edit-character").click();
	await page.getByTestId("char-name").fill("testtest");
	await page.getByLabel("Class").click();
	await page.getByRole("option", { name: "Breaker" }).click();
	await page.getByTestId("char-item-level").fill("1640");
	await page.getByTestId("confirm-button").click();
	characterCard = await page.getByTestId("character-0");
	await expect(characterCard.getByTestId("character-class")).toContainText(
		"Breaker",
	);
	await expect(characterCard.getByTestId("character-name")).toContainText(
		"testtest",
	);
	await expect(characterCard.getByTestId("character-item-level")).toContainText(
		"1640",
	);
});

test("add raid", async ({ page }) => {
	await page.goto("/characters");
	await setCharacterState(page, {
		name: "Test Character",
		class: Class.Berserker,
		itemLevel: 1600,
	});
	let characterCard = await page.getByTestId("character-0");
	await characterCard.getByTestId("character-add-raid").click();
	await page.getByLabel("Raid", { exact: true }).click();
	await page.getByRole("option", { name: "Brelshaza" }).click();
	await page.getByTestId("difficulties-G1").getByLabel("Normal").click();
	await page.getByTestId("difficulties-G2").getByLabel("Hard").click();
	await page.getByTestId("difficulties-G3").getByLabel("Normal").click();
	await page.getByTestId("form-submit").click();
	await page.reload();
	characterCard = await page.getByTestId("character-0");
	await expect(
		characterCard.getByTestId("character-assigned-raid-0"),
	).toContainText("Brelshaza");
	await expect(
		characterCard.getByTestId("character-assigned-raid-0"),
	).toContainText("NHN");
});

test("edit raid", async ({ page }) => {
	await page.goto("/characters");
	await setCharacterState(page, {
		name: "Test Character",
		class: Class.Berserker,
		itemLevel: 1600,
		assignedRaids: {
			brel: {
				G1: { difficulty: Difficulty.normal },
				G2: { difficulty: Difficulty.hard },
				G3: { difficulty: Difficulty.normal },
			},
		},
	});
	let characterCard = await page.getByTestId("character-0");
	await characterCard
		.getByTestId("character-assigned-raid-0")
		.getByTestId("assigned-raid-ellipsis")
		.click();
	await page.getByTestId("assigned-raid-edit").click();
	await page.getByTestId("difficulties-G1").getByLabel("Hard").click();
	await page.getByTestId("difficulties-G3").getByLabel("Hard").click();
	await page.getByTestId("difficulties-G4").getByLabel("Normal").click();
	await page.getByTestId("form-submit").click();
	await page.reload();
	characterCard = await page.getByTestId("character-0");
	await expect(
		characterCard.getByTestId("character-assigned-raid-0"),
	).toContainText("HHHN");
	await expect(
		characterCard.getByTestId("character-assigned-raid-0"),
	).toContainText("Brelshaza");
});

test("delete raid", async ({ page }) => {
	await page.goto("/characters");
	await setCharacterState(page, {
		name: "Test Character",
		class: Class.Berserker,
		itemLevel: 1600,
		assignedRaids: {
			brel: {
				G1: { difficulty: Difficulty.normal },
				G2: { difficulty: Difficulty.hard },
				G3: { difficulty: Difficulty.normal },
			},
		},
	});
	let characterCard = await page.getByTestId("character-0");
	await characterCard
		.getByTestId("character-assigned-raid-0")
		.getByTestId("assigned-raid-ellipsis")
		.click();
	await page.getByTestId("assigned-raid-delete").click();
	await page.reload();
	characterCard = await page.getByTestId("character-0");
	await expect(
		characterCard.getByTestId("character-assigned-raid-0"),
	).toHaveCount(0);
});

test("delete character and undo", async ({ page }) => {
	await page.goto("/characters");
	await setCharacterState(page, {
		name: "Test Character",
		class: Class.Berserker,
		itemLevel: 1600,
	});
	let characterCard = await page.getByTestId("character-0");
	await characterCard.getByTestId("edit-character").click();
	page.once("dialog", (dialog) => {
		dialog.accept().catch(() => {});
	});
	await page.getByTestId("char-delete-button").click();
	characterCard = await page.getByTestId("character-0");
	await expect(characterCard).toHaveCount(0);
	await page.getByRole("button", { name: "Undo" }).click();
	await page.reload();
	characterCard = await page.getByTestId("character-0");
	await expect(characterCard.getByTestId("character-class")).toContainText(
		"Berserker",
	);
	await expect(characterCard.getByTestId("character-name")).toContainText(
		"Test Character",
	);
	await expect(characterCard.getByTestId("character-item-level")).toContainText(
		"1600",
	);
});
