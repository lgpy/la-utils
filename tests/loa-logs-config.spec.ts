import { expect, test } from "@playwright/test";

const dropFile = async (
	page: import("@playwright/test").Page,
	name: string
): Promise<void> => {
	await page.getByTestId("loa-logs-drop-zone").evaluate((element, fileName) => {
		const dataTransfer = new DataTransfer();
		dataTransfer.items.add(
			new File(["not a database"], fileName, {
				type: "application/octet-stream",
			})
		);
		element.dispatchEvent(
			new DragEvent("drop", {
				dataTransfer,
				bubbles: true,
				cancelable: true,
			})
		);
	}, name);
};

test("shows the connect card", async ({ page }) => {
	await page.goto("/loa-logs-config");
	await expect(
		page.getByRole("heading", { name: "LOA Logs Integration" })
	).toBeVisible();
	await expect(page.getByText("Connect Database")).toBeVisible();
	await expect(page.getByText("Not configured")).toBeVisible();
});

for (const fileName of ["encounters.db-wal", "encounters.db-shm", "other.db"]) {
	test(`rejects ${fileName}`, async ({ page }) => {
		await page.goto("/loa-logs-config");
		await dropFile(page, fileName);
		await expect(
			page.getByText(
				"Please select the encounters.db file from your LOA Logs database folder."
			)
		).toBeVisible();
	});
}
