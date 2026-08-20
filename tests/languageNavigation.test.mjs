import assert from "node:assert/strict";
import test from "node:test";
import { shouldNavigateForLanguage } from "../lib/languageNavigation.js";

test("web language switch navigates to its SEO URL", () => {
  assert.equal(shouldNavigateForLanguage({ pathname: "/", target: "/en" }), true);
  assert.equal(shouldNavigateForLanguage({ pathname: "/en", target: "/" }), true);
});

test("native language switch keeps the current static page", () => {
  assert.equal(shouldNavigateForLanguage({ nativeApp: true, pathname: "/", target: "/en" }), false);
  assert.equal(shouldNavigateForLanguage({ nativeApp: true, pathname: "/en/custom/Hole1", target: "/custom/Hole1" }), false);
});

test("same URL never navigates", () => {
  assert.equal(shouldNavigateForLanguage({ pathname: "/admin", target: "/admin" }), false);
});
