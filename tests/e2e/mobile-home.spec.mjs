import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 393, height: 852 } });

test("home directly selects a card and opens the install guide", async ({ page }) => {
  await page.goto("/");

  for (const name of ["18홀 스코어카드", "9홀 스코어카드", "3홀 스코어카드", "1홀 카드"]) {
    await expect(page.getByRole("link", { name })).toBeVisible();
  }
  await expect(page.getByText("직접 만들기", { exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: "홈 화면에 추가" }).click();
  await expect(page.getByRole("dialog", { name: "홈 화면에 추가" })).toBeVisible();
  await page.getByRole("button", { name: "닫기" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("standalone PWA hides the install CTA", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window.navigator, "standalone", { value: true, configurable: true });
  });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "홈 화면에 추가" })).toHaveCount(0);
});

test("selection controls expose their current state and tabs have a name", async ({ page }) => {
  await page.goto("/custom/Hole18");
  await expect(page.getByRole("navigation", { name: "카드 형식 선택" })).toBeVisible();

  const scoreMode = page.getByRole("group", { name: "스코어 입력 방식" });
  await expect(scoreMode.getByRole("button", { name: "타수" })).toHaveAttribute("aria-pressed", "true");
  await expect(scoreMode.getByRole("button", { name: "파대비" })).toHaveAttribute("aria-pressed", "false");
  await scoreMode.getByRole("button", { name: "파대비" }).click();
  await expect(scoreMode.getByRole("button", { name: "파대비" })).toHaveAttribute("aria-pressed", "true");

  await page.goto("/custom/Hole1");
  const style = page.getByRole("group", { name: "1홀 카드 스타일" });
  const clubInput = page.locator('input[placeholder="3, Driver, Putter"]');
  await expect(style.getByRole("button", { name: "Minimal" })).toHaveAttribute("aria-pressed", "true");
  await expect(clubInput).toHaveCount(0);
  await expect(page.getByText("현재 타수", { exact: true })).toBeVisible();
  await expect(page.getByText("Classic 상세 정보", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "1", exact: true })).toBeVisible();
  await style.getByRole("button", { name: "Classic" }).click();
  await expect(style.getByRole("button", { name: "Classic" })).toHaveAttribute("aria-pressed", "true");
  await expect(clubInput).toBeVisible();
  await expect(page.getByText("현재 타수", { exact: true })).toBeVisible();
  await expect(page.getByText("Classic 상세 정보", { exact: true })).toBeVisible();

  const unit = page.getByRole("group", { name: "거리 단위" });
  await expect(unit.getByRole("button", { name: "M" })).toHaveAttribute("aria-pressed", "true");
  await unit.getByRole("button", { name: "YD" }).click();
  await expect(unit.getByRole("button", { name: "YD" })).toHaveAttribute("aria-pressed", "true");
});

test("guide marks the help control as the current page", async ({ page }) => {
  await page.goto("/guide");
  await expect(page.getByRole("link", { name: "사용 방법 · Q&A" })).toHaveAttribute("aria-current", "page");
});

test("18-hole score inputs meet the 24px width minimum at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/custom/Hole18");

  const parInput = page.getByRole("textbox", { name: "1번 홀 PAR", exact: true });
  const box = await parInput.boundingBox();
  expect(box).not.toBeNull();
  expect(box.width).toBeGreaterThanOrEqual(24);
  await expect(page.locator("html")).toHaveJSProperty("scrollWidth", 320);
});
