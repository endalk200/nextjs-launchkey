import { expect, test } from "@playwright/test";

test("manages posts through the browser", async ({ page }) => {
	await page.goto("/");

	await expect(
		page.getByRole("heading", { name: "No posts yet" }),
	).toBeVisible();

	await page.getByTestId("posts-empty-new-button").click();
	await page.getByTestId("post-form-title-input").fill("Playwright post");
	await page
		.getByTestId("post-form-content-input")
		.fill("Created from an E2E test.");
	await page.getByTestId("post-form-save-button").click();

	const createdRow = page
		.getByTestId("post-row")
		.filter({ hasText: "Playwright post" });
	await expect(createdRow).toBeVisible();
	await expect(page.getByText("Showing 1 to 1 of 1 post")).toBeVisible();

	await createdRow.getByTestId("post-row-title-button").click();
	await expect(page.getByTestId("post-detail")).toContainText(
		"Playwright post",
	);
	await expect(page.getByTestId("post-detail")).toContainText(
		"Created from an E2E test.",
	);

	await page.getByTestId("post-detail-edit-button").click();
	await page
		.getByTestId("post-form-title-input")
		.fill("Updated Playwright post");
	await page
		.getByTestId("post-form-content-input")
		.fill("Updated from an E2E test.");
	await page.getByTestId("post-form-save-button").click();

	await expect(page.getByTestId("post-detail")).toContainText(
		"Updated Playwright post",
	);
	await expect(page.getByTestId("post-detail")).toContainText(
		"Updated from an E2E test.",
	);

	await page.getByTestId("post-detail-delete-button").click();
	await expect(page.getByTestId("delete-post-dialog")).toBeVisible();
	await page.getByTestId("delete-post-confirm-button").click();

	await expect(
		page.getByRole("heading", { name: "No posts yet" }),
	).toBeVisible();
});
