import assert from "node:assert/strict";
import test from "node:test";
import { shouldLoadAds } from "../lib/adsEligibility.js";

test("web keeps loading AdSense", () => {
  assert.equal(shouldLoadAds({ nativeApp: false }), true);
  assert.equal(shouldLoadAds(), true);
});

test("native app never loads AdSense", () => {
  assert.equal(shouldLoadAds({ nativeApp: true }), false);
});
