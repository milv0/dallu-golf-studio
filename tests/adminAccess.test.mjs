import assert from "node:assert/strict";
import test from "node:test";
import {
  adminIpPolicy,
  assertAdminIp,
  assertAdminToken,
  clientIp,
  isIpAllowed,
  timingSafeEqual,
} from "../functions/_shared/adminAccess.js";

function req(headers = {}) {
  return new Request("https://example.com/admin", { headers });
}

function kv() {
  return {
    values: new Map(),
    deletes: [],
    async get(key) { return this.values.get(key) ?? null; },
    async put(key, value) { this.values.set(key, value); },
    async delete(key) { this.deletes.push(key); this.values.delete(key); },
  };
}

test("empty ADMIN_ALLOWED_IPS is treated as unset, not as open", () => {
  for (const value of [undefined, "", "   ", " , ,"]) {
    assert.equal(adminIpPolicy({ ADMIN_ALLOWED_IPS: value }).mode, "unset", JSON.stringify(value));
  }
});

test("'*' is the explicit opt-out that disables the IP gate", () => {
  const policy = adminIpPolicy({ ADMIN_ALLOWED_IPS: "*" });
  assert.equal(policy.mode, "open");
  assert.deepEqual(policy.allowed, []);
  assert.equal(isIpAllowed(req(), { ADMIN_ALLOWED_IPS: "*" }), true);
  // 목록 안에 '*'가 섞여 있어도 해제로 간주한다.
  assert.equal(adminIpPolicy({ ADMIN_ALLOWED_IPS: "203.0.113.7, *" }).mode, "open");
});

test("explicit IPs are parsed and enforced", () => {
  const env = { ADMIN_ALLOWED_IPS: " 203.0.113.7 , 198.51.100.4 " };
  assert.deepEqual(adminIpPolicy(env).allowed, ["203.0.113.7", "198.51.100.4"]);
  assert.equal(isIpAllowed(req({ "cf-connecting-ip": "198.51.100.4" }), env), true);
  assert.equal(isIpAllowed(req({ "cf-connecting-ip": "203.0.113.8" }), env), false);
  assert.equal(isIpAllowed(req(), env), false);
});

test("unset ADMIN_ALLOWED_IPS fails closed and names the variable to set", async () => {
  const blocked = assertAdminIp(req({ "cf-connecting-ip": "203.0.113.7" }), {});
  assert.equal(blocked.status, 403);
  const data = await blocked.json();
  assert.match(data.error, /ADMIN_ALLOWED_IPS/);
  // 복구 방법(허용 IP 또는 '*')이 메시지에 그대로 들어 있어야 한다.
  assert.match(data.error, /\*/);
  assert.equal(data.ipGate, "unset");
});

test("clientIp prefers the Cloudflare header over x-forwarded-for", () => {
  assert.equal(clientIp(req({ "cf-connecting-ip": " 203.0.113.7 " })), "203.0.113.7");
  assert.equal(clientIp(req({ "x-forwarded-for": "198.51.100.4, 10.0.0.1" })), "198.51.100.4");
  assert.equal(clientIp(req()), "");
});

test("timingSafeEqual compares by digest", async () => {
  assert.equal(await timingSafeEqual("secret", "secret"), true);
  assert.equal(await timingSafeEqual("secret", "secreu"), false);
  assert.equal(await timingSafeEqual("secret", "secret-long"), false);
  assert.equal(await timingSafeEqual(null, ""), false);
  assert.equal(await timingSafeEqual("", ""), true);
});

test("repeated token failures throttle the IP", async () => {
  const store = kv();
  const env = { COURSE_KV: store, ADMIN_TOKEN: "secret", ADMIN_ALLOWED_IPS: "*" };
  const bad = () => req({ "x-admin-token": "wrong", "cf-connecting-ip": "203.0.113.9" });

  for (let i = 0; i < 8; i++) {
    assert.equal((await assertAdminToken(bad(), env)).status, 401, `시도 ${i + 1}`);
  }
  const throttled = await assertAdminToken(bad(), env);
  assert.equal(throttled.status, 429);
  // 스로틀은 올바른 토큰에도 적용된다 — 창이 지나야 풀린다.
  const withGoodToken = req({ "x-admin-token": "secret", "cf-connecting-ip": "203.0.113.9" });
  assert.equal((await assertAdminToken(withGoodToken, env)).status, 429);
});

test("throttling is per-IP and cleared by a successful auth", async () => {
  const store = kv();
  const env = { COURSE_KV: store, ADMIN_TOKEN: "secret", ADMIN_ALLOWED_IPS: "*" };
  await assertAdminToken(req({ "x-admin-token": "wrong", "cf-connecting-ip": "203.0.113.9" }), env);
  assert.equal(store.values.get("admin-auth-fail/203.0.113.9"), "1");
  // 다른 IP는 영향을 받지 않는다.
  assert.equal(await assertAdminToken(req({ "x-admin-token": "secret", "cf-connecting-ip": "198.51.100.4" }), env), null);
  assert.equal(await assertAdminToken(req({ "x-admin-token": "secret", "cf-connecting-ip": "203.0.113.9" }), env), null);
  assert.ok(store.deletes.includes("admin-auth-fail/203.0.113.9"));
});

test("throttling degrades gracefully without a KV binding", async () => {
  const env = { ADMIN_TOKEN: "secret", ADMIN_ALLOWED_IPS: "*" };
  assert.equal(await assertAdminToken(req({ "x-admin-token": "secret" }), env), null);
  assert.equal((await assertAdminToken(req({ "x-admin-token": "wrong" }), env)).status, 401);
});
