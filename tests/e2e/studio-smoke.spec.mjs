import { expect, test } from "@playwright/test";
import { summarize } from "../../lib/score.js";

const testUser = {
  id: "test@example.com",
  email: "test@example.com",
  name: "테스트",
  createdAt: "2026-07-28T00:00:00.000Z",
};

const mockCourseDb = {
  "테스트CC": {
    nines: {
      OUT: [4, 4, 3, 5, 4, 4, 3, 5, 4],
      IN: [5, 4, 4, 3, 4, 5, 4, 3, 4],
    },
    combos: [{ out: "OUT", in: "IN" }],
  },
};

function roundFromRelative({
  player = "테스트 사용자",
  course = "테스트CC",
  date = "2026-07-28",
  relScores = [],
} = {}) {
  const pars = [...mockCourseDb["테스트CC"].nines.OUT, ...mockCourseDb["테스트CC"].nines.IN];
  return {
    player,
    country: "",
    course,
    date,
    holes: pars.map((par, i) => ({
      par,
      score: relScores[i] == null ? "" : String(par + relScores[i]),
    })),
  };
}

function remoteRecordFromRound(round, id = `round-${Date.now()}`) {
  const safeRound = {
    player: round.player || "",
    country: round.country || "",
    course: round.course || "",
    date: round.date || "",
    holes: Array.isArray(round.holes) ? round.holes.map((h) => ({ par: h.par, score: h.score })) : [],
  };
  return {
    id,
    savedAt: new Date().toISOString(),
    round: safeRound,
    summary: summarize(safeRound.holes),
  };
}

async function resetBrowserState(page) {
  await page.addInitScript(() => window.localStorage.clear());
}

async function loginTestUser(page) {
  await page.addInitScript((user) => {
    window.localStorage.clear();
    window.localStorage.setItem("sc-current-user", JSON.stringify(user));
  }, testUser);
}

async function mockCloudflareApis(page, options = {}) {
  const records = options.records || [];

  await page.route("**/api/db", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ json: mockCourseDb });
      return;
    }
    await route.fulfill({ status: 401, json: { error: "인증 실패" } });
  });

  await page.route("**/api/round-records**", async (route) => {
    const request = route.request();
    if (request.method() === "GET") {
      await route.fulfill({ json: { ok: true, records } });
      return;
    }
    if (request.method() === "POST") {
      let body = {};
      try { body = request.postDataJSON(); } catch {}
      const record = remoteRecordFromRound(body.round || {}, `round-${records.length + 1}`);
      records.unshift(record);
      await route.fulfill({ json: { ok: true, record } });
      return;
    }
    if (request.method() === "DELETE") {
      const url = new URL(request.url());
      const id = url.searchParams.get("id");
      const index = records.findIndex((record) => record.id === id);
      if (index >= 0) records.splice(index, 1);
      await route.fulfill({ json: { ok: true } });
      return;
    }
    await route.fulfill({ status: 405, json: { error: "method not allowed" } });
  });

  return records;
}

function collectBrowserErrors(page) {
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

async function fillRelativeScores(page, values) {
  for (const [index, value] of values.entries()) {
    const input = page.getByLabel(`홀 ${index + 1} 파대비`);
    await input.click();
    await input.fill(String(value));
    await input.press("Tab");
  }
}

async function loadSavedRound(page, courseName = "테스트CC") {
  await page.getByRole("button", { name: "라운드 선택" }).click();
  await page.locator("button").filter({ hasText: courseName }).first().click();
}

async function expectSvgTextWithin(locator, bounds) {
  const box = await locator.evaluate((el) => {
    const b = el.getBBox();
    return { x: b.x, y: b.y, width: b.width, height: b.height };
  });
  expect(box.x).toBeGreaterThanOrEqual(bounds.x);
  expect(box.x + box.width).toBeLessThanOrEqual(bounds.x + bounds.width);
  if (bounds.centerX != null) {
    const centerX = box.x + box.width / 2;
    expect(Math.abs(centerX - bounds.centerX)).toBeLessThanOrEqual(bounds.toleranceX ?? 6);
  }
  if (bounds.centerY != null) {
    const centerY = box.y + box.height / 2;
    expect(Math.abs(centerY - bounds.centerY)).toBeLessThanOrEqual(bounds.toleranceY ?? bounds.tolerance ?? 8);
  }
}

async function expectScoreRowAligned(page) {
  const centers = await page.locator(".preview-svg svg").first().evaluate((svg) => {
    return Array.from(svg.querySelectorAll("text"))
      .filter((el) => el.getAttribute("font-size") === "46")
      .map((el) => {
        const b = el.getBBox();
        return { text: el.textContent.trim(), y: b.y + b.height / 2 };
      })
      .filter((item) => item.text && item.y > 145);
  });
  expect(centers.length).toBeGreaterThan(18);
  const ys = centers.map((item) => item.y);
  expect(Math.max(...ys) - Math.min(...ys)).toBeLessThanOrEqual(2);
}

async function expectCompactScoreRowAligned(page, expectedCount) {
  const centers = await page.locator(".preview-svg svg").first().evaluate((svg) => {
    return Array.from(svg.querySelectorAll("text"))
      .filter((el) => el.getAttribute("font-size") === "50")
      .map((el) => {
        const b = el.getBBox();
        return { text: el.textContent.trim(), y: b.y + b.height / 2 };
      })
      .filter((item) => item.text);
  });
  expect(centers).toHaveLength(expectedCount);
  const ys = centers.map((item) => item.y);
  expect(Math.max(...ys) - Math.min(...ys)).toBeLessThanOrEqual(2);
}

test("home and Hole18 round entry flow works without console errors", async ({ page }) => {
  await resetBrowserState(page);
  await mockCloudflareApis(page);
  const consoleErrors = collectBrowserErrors(page);

  await page.goto("/");
  await expect(page.getByRole("link", { name: /Dallu Golf Studio/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "코스 DB" })).toHaveCount(0);

  await page.getByRole("link", { name: "시작하기" }).click();
  await expect(page).toHaveURL(/\/custom\/Hole18$/);

  await page.getByLabel("선수명").fill("테스트 사용자");
  await page.getByLabel("날짜").fill("2026-07-28");

  const firstScore = page.getByLabel("홀 1 파대비");
  await firstScore.click();
  await firstScore.press("ArrowLeft");
  await expect(firstScore).toHaveValue("-1");
  await firstScore.press("Tab");

  const secondScore = page.getByLabel("홀 2 파대비");
  await expect(secondScore).toBeFocused();
  await secondScore.press("Tab");
  await expect(secondScore).toHaveValue("0");

  await expect(page.locator(".preview-svg svg").first()).toBeVisible();
  await expect(page.locator(".score-meta-lock").first()).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test("complete logged-in round journey connects records and every output page", async ({ page }) => {
  const records = [];
  await loginTestUser(page);
  await mockCloudflareApis(page, { records });
  const consoleErrors = collectBrowserErrors(page);

  await page.goto("/round");
  await expect(page.getByRole("button", { name: "기록 저장" })).toBeDisabled();

  await page.getByLabel("선수명").fill("테스트 사용자");
  await page.getByLabel("골프장").fill("테스트");
  await page.getByRole("button", { name: "테스트CC" }).click();
  await page.getByRole("button", { name: /OUT\+IN/ }).click();
  await page.getByLabel("날짜").fill("2026-07-28");

  await fillRelativeScores(page, [-1, 0, 1, 2, -2, 0, 1, -1, 0, 0, 1, -1, 0, 2, -2, 0, 1, 0]);
  await expect(page.getByText(/스코어\s+73/)).toBeVisible();
  await expect(page.getByText("· 18홀")).toBeVisible();
  await expectSvgTextWithin(page.locator(".preview-svg svg text").filter({ hasText: "테스트 사용자" }).first(), { x: 14, width: 122, centerX: 75, centerY: 50, toleranceX: 8, toleranceY: 7 });
  await expectScoreRowAligned(page);

  await page.getByRole("button", { name: "기록 저장" }).click();
  await expect(page.getByText(/내 라운딩에 저장됨/)).toBeVisible();
  expect(records).toHaveLength(1);

  await page.goto("/records");
  await expect(page.getByText("Cloudflare DB")).toBeVisible();
  await expect(page.getByText("테스트CC")).toBeVisible();
  await expect(page.getByText("테스트 사용자")).toBeVisible();
  await expect(page.getByText("18/18")).toBeVisible();

  await page.goto("/round/Hole9");
  await loadSavedRound(page);
  await expect(page.getByText("테스트CC")).toBeVisible();
  await page.getByRole("button", { name: /후반 IN 9/ }).click();
  await expect(page.locator(".preview-svg svg").first()).toBeVisible();
  await expectCompactScoreRowAligned(page, 9);
  await expect(page.getByRole("button", { name: "PNG 다운로드" })).toBeEnabled();

  await page.goto("/round/Hole3");
  await loadSavedRound(page);
  await page.getByTitle("4-6번 홀 묶음 선택").click();
  await page.getByLabel("홀 번호 표시").uncheck();
  await expect(page.getByText("456", { exact: true })).toBeVisible();
  await expect(page.locator(".preview-svg svg").first()).toBeVisible();
  await expectCompactScoreRowAligned(page, 3);

  await page.goto("/round/hole");
  await loadSavedRound(page);
  await page.getByTitle(/^5번 홀/).click();
  await expect(page.getByLabel("홀 번호")).toHaveValue("5");
  await page.getByLabel("선택 클럽").fill("3");
  await page.getByLabel("선택 클럽").press("Enter");
  await expect(page.getByLabel("선택 클럽")).toHaveValue("3 Iron");
  await expect(page.locator(".preview-svg svg").first().getByText("3 IRON")).toBeVisible();
  await page.getByLabel("FOR EAGLE/BIRDIE 배너 표시").uncheck();
  await expect(page.locator(".preview-svg svg").first()).toBeVisible();

  expect(consoleErrors).toEqual([]);
});

test("manual 9-hole and 3-hole scorecards support keyboard relative input", async ({ page }) => {
  await resetBrowserState(page);
  await mockCloudflareApis(page);
  const consoleErrors = collectBrowserErrors(page);

  await page.goto("/custom/Hole3");
  await expect(page.locator(".preview-svg svg text").filter({ hasText: "-12" })).toHaveCount(0);
  await page.getByLabel("홀 번호 표시").uncheck();
  await page.getByLabel("3홀 직접입력 1번째 홀 파대비").click();
  await page.getByLabel("3홀 직접입력 1번째 홀 파대비").press("ArrowLeft");
  await expect(page.getByLabel("3홀 직접입력 1번째 홀 파대비")).toHaveValue("-1");
  await page.getByLabel("3홀 직접입력 2번째 홀 파대비").press("Tab");
  await expect(page.getByLabel("3홀 직접입력 2번째 홀 파대비")).toHaveValue("0");
  await page.getByLabel("TO PAR 직접입력").fill("-1");
  await expect(page.locator(".preview-svg svg").first()).toBeVisible();
  await expectCompactScoreRowAligned(page, 3);

  await page.goto("/custom/Hole9");
  await page.getByLabel("9홀 직접입력 1번째 홀 파대비").click();
  await page.getByLabel("9홀 직접입력 1번째 홀 파대비").press("ArrowRight");
  await expect(page.getByLabel("9홀 직접입력 1번째 홀 파대비")).toHaveValue("1");
  await page.getByLabel("9홀 직접입력 2번째 홀 파대비").fill("-2");
  await expect(page.locator(".preview-svg svg").first()).toBeVisible();

  expect(consoleErrors).toEqual([]);
});

test("records archive can delete one saved round while keeping server state", async ({ page }) => {
  const records = [
    remoteRecordFromRound(roundFromRelative({
      player: "삭제할 사용자",
      course: "삭제CC",
      relScores: [-1, 0, 0, 1, 0, 0, -1, 0, 0, 1, 0, 0, -1, 0, 0, 1, 0, 0],
    }), "delete-me"),
    remoteRecordFromRound(roundFromRelative({
      player: "남길 사용자",
      course: "남김CC",
      relScores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    }), "keep-me"),
  ];
  await loginTestUser(page);
  await mockCloudflareApis(page, { records });
  const consoleErrors = collectBrowserErrors(page);
  page.on("dialog", (dialog) => dialog.accept());

  await page.goto("/records");
  await expect(page.getByText("Cloudflare DB")).toBeVisible();
  await expect(page.locator("article")).toHaveCount(2);
  await expect(page.getByText("삭제CC")).toBeVisible();
  await expect(page.getByText("남김CC")).toBeVisible();

  await page.locator("article").filter({ hasText: "삭제CC" }).getByRole("button", { name: "삭제" }).click();
  await expect(page.getByText("삭제CC")).toHaveCount(0);
  await expect(page.getByText("남김CC")).toBeVisible();
  await expect(page.locator("article")).toHaveCount(1);
  expect(records.map((record) => record.id)).toEqual(["keep-me"]);
  expect(consoleErrors).toEqual([]);
});

test("hole card club picker handles numbered and category club input", async ({ page }) => {
  await resetBrowserState(page);
  await mockCloudflareApis(page);
  const consoleErrors = collectBrowserErrors(page);

  await page.goto("/custom/hole");
  await page.getByLabel("홀 번호").fill("7");
  await page.getByLabel("PAR").fill("4");
  await page.getByLabel("현재 타수").fill("3");

  const club = page.getByLabel("선택 클럽");
  await club.click();
  await expect(page.getByRole("button", { name: "Driver" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Putter" })).toBeVisible();

  await club.fill("3");
  await expect(page.getByRole("button", { name: "3 Wood" })).toBeVisible();
  await expect(page.getByRole("button", { name: "3 Hybrid" })).toBeVisible();
  await page.getByRole("button", { name: "3 Wood" }).click();
  await expect(club).toHaveValue("3 Wood");
  await expect(page.locator(".preview-svg svg").first().getByText("3 WOOD")).toBeVisible();

  await club.fill("10");
  await expect(page.getByRole("button", { name: "10 Iron" })).toBeVisible();
  await club.press("Enter");
  await expect(club).toHaveValue("10 Iron");
  await expect(page.locator(".preview-svg svg").first().getByText("10 IRON")).toBeVisible();

  expect(consoleErrors).toEqual([]);
});

test("linked score pages can open saved-round chooser state", async ({ page }) => {
  await loginTestUser(page);
  await mockCloudflareApis(page);
  const consoleErrors = collectBrowserErrors(page);

  await page.goto("/round/Hole9");
  await expect(page.getByRole("button", { name: "라운드 선택" })).toBeVisible();
  await page.getByRole("button", { name: "라운드 선택" }).click();
  await expect(page.getByText(/로그인이 필요합니다|라운딩 기록 불러오는 중|저장된 라운딩이 없습니다|DB 연결 실패/)).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test("admin page hides management UI before token verification", async ({ page }) => {
  await resetBrowserState(page);
  const consoleErrors = collectBrowserErrors(page);
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "관리자 인증" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "코스 DB 관리" })).toHaveCount(0);
  expect(consoleErrors).toEqual([]);
});
