import assert from "node:assert/strict";
import test from "node:test";
import { onRequestPost } from "../functions/api/auth/login.js";

test("login API is disabled while auth is paused", async () => {
  const response = await onRequestPost();
  const data = await response.json();

  assert.equal(response.status, 503);
  assert.match(data.error, /비활성화/);
});
