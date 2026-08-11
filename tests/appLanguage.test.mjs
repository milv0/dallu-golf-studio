import assert from "node:assert/strict";
import test from "node:test";
import { resolveInitialLang } from "../lib/appLanguage.js";

test("web URL always owns the language", () => {
  assert.equal(resolveInitialLang({ routeLang: "en", storedLang: "ko" }), "en");
  assert.equal(resolveInitialLang({ routeLang: "ko", storedLang: "en" }), "ko");
});

test("native app restores the saved language after restart", () => {
  assert.equal(resolveInitialLang({ routeLang: "ko", storedLang: "en", nativeApp: true }), "en");
  assert.equal(resolveInitialLang({ routeLang: "ko", storedLang: "ko", nativeApp: true }), "ko");
});

test("native app without a saved language follows the route", () => {
  assert.equal(resolveInitialLang({ routeLang: "ko", nativeApp: true }), "ko");
  assert.equal(resolveInitialLang({ routeLang: "ko", storedLang: "junk", nativeApp: true }), "ko");
});

test("no route and no saved language falls back to Korean", () => {
  assert.equal(resolveInitialLang({}), "ko");
});
