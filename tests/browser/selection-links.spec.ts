import { test, expect } from "@playwright/test";

test("a filtered gallery card opens only that app breakdown", async ({
  page,
}) => {
  await page.goto("/?view=gallery&search=calibre,mame");
  await expect(page.locator(".app-chart-card")).toHaveCount(2);
  const link = page
    .locator(".app-chart-card")
    .filter({ hasText: "Calibre" })
    .getByRole("link");
  const url = new URL((await link.getAttribute("href"))!, page.url());
  expect(url.searchParams.get("snap")).toBe("calibre");
  expect(url.searchParams.get("search")).toBe("calibre");
  await link.click();
  await expect(page.locator("#dimension")).toHaveValue("architecture");
  await expect(page.locator("#coverage")).toHaveText("1 / 1");
  await expect(page.locator("#chart-title")).toHaveText("Calibre");
  await expect(page.locator("#search")).toHaveValue("calibre");
  await page.reload();
  await expect(page.locator("#coverage")).toHaveText("1 / 1");
});

test("a wildcard-filtered gallery card opens only that app breakdown", async ({
  page,
}) => {
  await page.goto("/?view=gallery&search=*-*");
  await expect(page.locator(".app-chart-card")).toHaveCount(2);
  await page
    .locator(".app-chart-card")
    .filter({ hasText: "dosbox-staging" })
    .getByRole("link")
    .click();
  await expect(page.locator("#coverage")).toHaveText("1 / 1");
  await expect(page.locator("#chart-title")).toHaveText("DOSBox Staging");
});

test("an existing single-app bookmark keeps its snap when a search is also present", async ({
  page,
}) => {
  await page.goto(
    "/?view=metrics&dimension=total&snap=dosbox-staging&search=*-*",
  );
  await expect(page.locator("#coverage")).toHaveText("1 / 1");
  await expect(page.locator("#app-legend button")).toHaveText([
    "dosbox-staging",
  ]);
  await expect(page.locator("#search")).toHaveValue("dosbox-staging");
});

for (const snap of ["all", "missing-app"]) {
  test(`a ${snap} snap parameter preserves the explicit multi-app search`, async ({
    page,
  }) => {
    await page.goto(`/?view=metrics&snap=${snap}&search=calibre,mame`);
    await expect(page.locator("#coverage")).toHaveText("2 / 2");
    await expect(page.locator("#search")).toHaveValue("calibre,mame");
    await expect(page.locator("#app-legend button")).toHaveText([
      "calibre",
      "mame",
    ]);
    await page.reload();
    await expect(page.locator("#coverage")).toHaveText("2 / 2");
  });
}
