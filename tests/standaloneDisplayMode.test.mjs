import assert from "node:assert/strict";
import test from "node:test";
import { isStandaloneApp } from "../lib/standaloneDisplayMode.js";

test("standalone display mode hides the install CTA", () => {
  assert.equal(isStandaloneApp({ displayModeStandalone: true }), true);
});

test("iOS navigator standalone flag hides the install CTA", () => {
  assert.equal(isStandaloneApp({ navigatorStandalone: true }), true);
});

test("browser mode keeps the install CTA available", () => {
  assert.equal(isStandaloneApp({ displayModeStandalone: false, navigatorStandalone: false }), false);
});
