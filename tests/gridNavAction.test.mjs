import assert from "node:assert/strict";
import test from "node:test";
import { gridNavAction } from "../lib/gridNavAction.js";

const at = (over) => gridNavAction({ idx: 1, hasNext: true, ...over });

test("horizontal arrows move between cells", () => {
  assert.equal(at({ key: "ArrowLeft" }), "prev");
  assert.equal(at({ key: "ArrowRight" }), "next");
});

test("first cell does not move left", () => {
  assert.equal(at({ key: "ArrowLeft", idx: 0 }), null);
});

test("Tab and Enter fall through on the last cell so focus can leave", () => {
  for (const key of ["Tab", "Enter", "ArrowRight"]) {
    assert.equal(at({ key, hasNext: false }), null, key);
  }
});

test("Tab advances only forward", () => {
  assert.equal(at({ key: "Tab" }), "next");
  assert.equal(at({ key: "Tab", shiftKey: true }), null);
  assert.equal(at({ key: "Tab", shiftKey: true, hasNext: false }), null);
});

test("vertical arrows only act when a handler exists", () => {
  assert.equal(at({ key: "ArrowUp" }), null);
  assert.equal(at({ key: "ArrowDown" }), null);
  assert.equal(at({ key: "ArrowUp", hasUp: true }), "up");
  assert.equal(at({ key: "ArrowDown", hasDown: true }), "down");
});

test("unrelated keys are left to the browser", () => {
  for (const key of ["a", "1", "Backspace", "Escape", "Home", " "]) {
    assert.equal(at({ key }), null, key);
  }
});
