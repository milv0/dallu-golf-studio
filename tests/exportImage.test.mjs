import assert from "node:assert/strict";
import test from "node:test";
import { exportFileName, isShareCancelError } from "../lib/exportImage.js";

test("share cancel from the web share sheet is not a failure", () => {
  assert.equal(isShareCancelError({ name: "AbortError" }), true);
});

test("share cancel from the Capacitor share sheet is not a failure", () => {
  assert.equal(isShareCancelError({ message: "Share canceled" }), true);
});

test("real share errors still surface", () => {
  assert.equal(isShareCancelError(new Error("Filesystem write failed")), false);
  assert.equal(isShareCancelError(undefined), false);
});

test("export file name follows the card mode", () => {
  assert.equal(exportFileName({ isHole: true }), "Hole1.png");
  assert.equal(exportFileName({ isScore3: true }), "Hole3.png");
  assert.equal(exportFileName({ isScore9: true }), "Hole9.png");
  assert.equal(exportFileName({}), "Hole18.png");
});
