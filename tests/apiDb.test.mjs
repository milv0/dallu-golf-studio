import assert from "node:assert/strict";
import test from "node:test";
import { onRequestPost } from "../functions/api/db.js";

const validDb = {
  "테스트CC": {
    nines: {
      OUT: [4, 4, 3, 5, 4, 4, 3, 5, 4],
      IN: [5, 4, 4, 3, 4, 5, 4, 3, 4],
    },
    combos: [{ out: "OUT", in: "IN" }],
  },
};

function request(body, token = "secret") {
  return new Request("https://example.com/api/db", {
    method: "POST",
    headers: { "content-type": "application/json", "x-admin-token": token },
    body: JSON.stringify(body),
  });
}

function kv() {
  return {
    value: null,
    async put(key, value) {
      this.value = { key, value };
    },
  };
}

test("POST rejects writes when ADMIN_TOKEN is not configured", async () => {
  const response = await onRequestPost({ request: request(validDb), env: { COURSE_KV: kv() } });
  assert.equal(response.status, 500);
  assert.match((await response.json()).error, /ADMIN_TOKEN/);
});

test("POST rejects invalid admin tokens", async () => {
  const response = await onRequestPost({
    request: request(validDb, "wrong"),
    env: { COURSE_KV: kv(), ADMIN_TOKEN: "secret" },
  });
  assert.equal(response.status, 401);
});

test("POST rejects invalid course DB payloads", async () => {
  const response = await onRequestPost({
    request: request({ "bad": { nines: { OUT: [4] }, combos: [] } }),
    env: { COURSE_KV: kv(), ADMIN_TOKEN: "secret" },
  });
  const data = await response.json();
  assert.equal(response.status, 400);
  assert.equal(data.error, "잘못된 DB 형식");
  assert.ok(data.details.length > 0);
});

test("POST writes valid DB payloads to KV", async () => {
  const store = kv();
  const response = await onRequestPost({
    request: request(validDb),
    env: { COURSE_KV: store, ADMIN_TOKEN: "secret" },
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, clubs: 1 });
  assert.deepEqual(store.value, { key: "db", value: JSON.stringify(validDb) });
});
