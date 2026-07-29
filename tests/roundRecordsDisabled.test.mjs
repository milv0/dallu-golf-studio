import assert from "node:assert/strict";
import test from "node:test";
import { onRequestDelete, onRequestGet, onRequestPost } from "../functions/api/round-records.js";

test("round records API is disabled for reads", async () => {
  const response = await onRequestGet();
  const data = await response.json();

  assert.equal(response.status, 503);
  assert.match(data.error, /비활성화/);
});

test("round records API is disabled for writes", async () => {
  const response = await onRequestPost();
  const data = await response.json();

  assert.equal(response.status, 503);
  assert.match(data.error, /비활성화/);
});

test("round records API is disabled for deletes", async () => {
  const response = await onRequestDelete();
  const data = await response.json();

  assert.equal(response.status, 503);
  assert.match(data.error, /비활성화/);
});
