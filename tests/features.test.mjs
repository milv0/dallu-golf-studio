import assert from "node:assert/strict";
import test from "node:test";
import sitemap from "../app/sitemap.js";
import { FEATURE_FLAGS } from "../lib/features.js";

test("My Round remains disabled in the public release", () => {
  assert.equal(FEATURE_FLAGS.myRound, false);
});

test("disabled My Round routes are excluded from the public sitemap", () => {
  const urls = sitemap().map((entry) => new URL(entry.url).pathname);

  assert.equal(urls.some((path) => path === "/round" || path.startsWith("/round/")), false);
  assert.equal(urls.includes("/custom/Hole18"), true);
});
