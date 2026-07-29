import assert from "node:assert/strict";
import test from "node:test";
import { onRequestPost } from "../functions/api/db.js";
import { onRequest as onMiddlewareRequest } from "../functions/_middleware.js";

const validDb = {
  "테스트CC": {
    nines: {
      OUT: [4, 4, 3, 5, 4, 4, 3, 5, 4],
      IN: [5, 4, 4, 3, 4, 5, 4, 3, 4],
    },
    combos: [{ out: "OUT", in: "IN" }],
  },
};

function request(body, token = "secret", headers = {}) {
  return new Request("https://example.com/api/db", {
    method: "POST",
    headers: { "content-type": "application/json", "x-admin-token": token, ...headers },
    body: JSON.stringify(body),
  });
}

function kv() {
  return {
    values: new Map(),
    metadata: new Map(),
    puts: [],
    async get(key) {
      return this.values.get(key) || null;
    },
    async put(key, value, options = {}) {
      this.values.set(key, value);
      if (options.metadata) this.metadata.set(key, options.metadata);
      this.puts.push({ key, value });
    },
    async list({ prefix, limit = 100 }) {
      const keys = [...this.values.keys()]
        .filter((key) => key.startsWith(prefix))
        .slice(0, limit)
        .map((name) => ({ name, metadata: this.metadata.get(name) || null }));
      return { keys };
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

test("POST rejects admin writes from non-allowlisted IPs", async () => {
  const response = await onRequestPost({
    request: request(validDb, "secret", { "cf-connecting-ip": "198.51.100.10" }),
    env: { COURSE_KV: kv(), ADMIN_TOKEN: "secret", ADMIN_ALLOWED_IPS: "203.0.113.7" },
  });
  const data = await response.json();
  assert.equal(response.status, 403);
  assert.match(data.error, /IP/);
});

test("POST allows admin writes from allowlisted IPs", async () => {
  const response = await onRequestPost({
    request: request(validDb, "secret", { "cf-connecting-ip": "203.0.113.7" }),
    env: { COURSE_KV: kv(), ADMIN_TOKEN: "secret", ADMIN_ALLOWED_IPS: "203.0.113.7" },
  });
  assert.equal(response.status, 200);
});

test("middleware blocks static admin page outside IP allowlist", async () => {
  const response = await onMiddlewareRequest({
    request: new Request("https://example.com/admin", {
      headers: { "cf-connecting-ip": "198.51.100.10" },
    }),
    env: { ADMIN_ALLOWED_IPS: "203.0.113.7" },
    next: async () => new Response("ok"),
  });
  assert.equal(response.status, 403);
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
  const data = await response.json();
  assert.equal(data.ok, true);
  assert.equal(data.clubs, 1);
  assert.equal(data.backupKey, null);
  assert.ok(data.meta.revision);
  assert.deepEqual(store.puts.map((item) => item.key), ["db", "db-meta", data.auditKey]);
});

test("POST backs up existing DB before overwriting KV", async () => {
  const previousDb = {
    "이전CC": {
      nines: { OLD: [4, 4, 4, 4, 4, 4, 4, 4, 4] },
      combos: [],
    },
  };
  const store = kv();
  store.values.set("db", JSON.stringify(previousDb));
  store.values.set("db-meta", JSON.stringify({ revision: "rev-1", updatedAt: "2026-07-28T00:00:00.000Z", clubs: 1 }));

  const response = await onRequestPost({
    request: request({ db: validDb, baseRevision: "rev-1" }),
    env: { COURSE_KV: store, ADMIN_TOKEN: "secret" },
  });
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.ok, true);
  assert.equal(data.clubs, 1);
  assert.match(data.backupKey, /^db-backups\/\d{4}-\d{2}-\d{2}T/);
  assert.equal(store.values.get(data.backupKey), JSON.stringify(previousDb));
  assert.equal(store.values.get("db"), JSON.stringify(validDb));
  assert.deepEqual(store.puts.map((item) => item.key), [data.backupKey, "db", "db-meta", data.auditKey]);
  assert.equal(store.metadata.get(data.backupKey).revision, "rev-1");
});

test("POST rejects stale course DB revisions", async () => {
  const store = kv();
  store.values.set("db", JSON.stringify(validDb));
  store.values.set("db-meta", JSON.stringify({ revision: "latest", updatedAt: "2026-07-28T00:00:00.000Z", clubs: 1 }));

  const response = await onRequestPost({
    request: request({ db: validDb, baseRevision: "old" }),
    env: { COURSE_KV: store, ADMIN_TOKEN: "secret" },
  });
  const data = await response.json();

  assert.equal(response.status, 409);
  assert.match(data.error, /새로고침/);
  assert.equal(data.currentRevision, "latest");
  assert.equal(store.puts.length, 0);
});

test("POST restores a DB backup through the protected API", async () => {
  const previousDb = {
    "복구CC": {
      nines: { OLD: [4, 4, 4, 4, 4, 4, 4, 4, 4] },
      combos: [],
    },
  };
  const store = kv();
  store.values.set("db", JSON.stringify(validDb));
  store.values.set("db-meta", JSON.stringify({ revision: "current", updatedAt: "2026-07-28T00:00:00.000Z", clubs: 1 }));
  store.values.set("db-backups/saved", JSON.stringify(previousDb));

  const response = await onRequestPost({
    request: request({ action: "restore", backupKey: "db-backups/saved", baseRevision: "current" }),
    env: { COURSE_KV: store, ADMIN_TOKEN: "secret" },
  });
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.ok, true);
  assert.equal(data.clubs, 1);
  assert.equal(store.values.get("db"), JSON.stringify(previousDb));
  assert.match(data.backupKey, /^db-backups\//);
  assert.equal(store.values.get(data.backupKey), JSON.stringify(validDb));
});
