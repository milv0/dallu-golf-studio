import { jsonResponse } from "./http.js";

// IP 제한을 끄고 싶을 때 ADMIN_ALLOWED_IPS에 넣는 명시적 마커.
// 빈 값(미설정)은 "제한 없음"이 아니라 "차단"으로 취급한다 — 설정을 잊었을 때
// 보호가 조용히 사라지는 것을 막기 위한 fail-closed 정책이다.
const OPEN_MARKER = "*";

// 토큰 무차별 대입 방어 — IP당 실패 허용 횟수와 창 길이(초)
const AUTH_FAIL_MAX = 8;
const AUTH_FAIL_WINDOW_S = 600;

export function adminIpPolicy(env) {
  const raw = String(env?.ADMIN_ALLOWED_IPS || "").trim();
  if (raw === "") return { mode: "unset", allowed: [] };
  const allowed = raw.split(",").map((ip) => ip.trim()).filter(Boolean);
  if (allowed.includes(OPEN_MARKER)) return { mode: "open", allowed: [] };
  if (allowed.length === 0) return { mode: "unset", allowed: [] };
  return { mode: "enforced", allowed };
}

export function adminAllowedIps(env) {
  return adminIpPolicy(env).allowed;
}

export function clientIp(request) {
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "";
}

export function isIpAllowed(request, env) {
  const { mode, allowed } = adminIpPolicy(env);
  if (mode === "open") return true;
  if (mode === "unset") return false;
  return allowed.includes(clientIp(request));
}

export function assertAdminIp(request, env) {
  const { mode } = adminIpPolicy(env);
  if (mode === "unset") {
    return jsonResponse(
      {
        error:
          "ADMIN_ALLOWED_IPS 미설정 — 관리자 접근을 차단했습니다. 허용 IP를 쉼표로 구분해 넣거나, IP 제한을 쓰지 않으려면 '*'로 설정하세요.",
        ipGate: "unset",
      },
      403
    );
  }
  if (!isIpAllowed(request, env)) {
    return jsonResponse({ error: "관리자 접근이 허용되지 않은 IP입니다", ipGate: mode }, 403);
  }
  return null;
}

// 다이제스트를 비교해 토큰 길이·내용에 따른 실행 시간 차이를 없앤다.
async function digest(value) {
  const bytes = new TextEncoder().encode(String(value));
  return new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
}

export async function timingSafeEqual(a, b) {
  const [da, db] = await Promise.all([digest(a), digest(b)]);
  let diff = 0;
  for (let i = 0; i < da.length; i++) diff |= da[i] ^ db[i];
  return diff === 0;
}

function authFailKey(request) {
  return `admin-auth-fail/${clientIp(request) || "unknown"}`;
}

async function readAuthFailures(request, env) {
  const kv = env?.COURSE_KV;
  if (!kv?.get) return 0;
  return Number(await kv.get(authFailKey(request))) || 0;
}

async function recordAuthFailure(request, env) {
  const kv = env?.COURSE_KV;
  if (!kv?.put) return;
  const next = (await readAuthFailures(request, env)) + 1;
  await kv.put(authFailKey(request), String(next), { expirationTtl: AUTH_FAIL_WINDOW_S });
}

async function clearAuthFailures(request, env) {
  const kv = env?.COURSE_KV;
  if (typeof kv?.delete !== "function") return;
  await kv.delete(authFailKey(request));
}

export async function assertAdminToken(request, env) {
  if (!env.ADMIN_TOKEN) return jsonResponse({ error: "ADMIN_TOKEN 미설정 — 저장 차단" }, 500);

  if ((await readAuthFailures(request, env)) >= AUTH_FAIL_MAX) {
    return jsonResponse(
      { error: "관리자 인증 실패가 반복되어 일시적으로 차단되었습니다. 잠시 후 다시 시도하세요.", retryAfter: AUTH_FAIL_WINDOW_S },
      429
    );
  }

  if (!(await timingSafeEqual(request.headers.get("x-admin-token"), env.ADMIN_TOKEN))) {
    await recordAuthFailure(request, env);
    return jsonResponse({ error: "인증 실패(x-admin-token)" }, 401);
  }

  await clearAuthFailures(request, env);
  return null;
}

export async function assertAdminAccess(request, env) {
  return assertAdminIp(request, env) || (await assertAdminToken(request, env));
}
