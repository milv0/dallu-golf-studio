import { jsonResponse } from "./http.js";

export function adminAllowedIps(env) {
  return String(env.ADMIN_ALLOWED_IPS || "")
    .split(",")
    .map((ip) => ip.trim())
    .filter(Boolean);
}

export function clientIp(request) {
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "";
}

// 의도적 fail-open: ADMIN_ALLOWED_IPS가 비어 있으면 IP 검사를 건너뛴다.
// 이유 — 이 값을 설정하지 않은 환경(로컬/프리뷰)에서 관리자가 스스로 잠기는 것을 막기 위함.
// 쓰기 경로는 항상 ADMIN_TOKEN(assertAdminToken)으로 별도 차단되므로 IP만으로 인증하지 않는다.
// 운영에서 IP 제한을 걸려면 Cloudflare 환경변수에 ADMIN_ALLOWED_IPS를 반드시 설정해야 한다.
export function isIpAllowed(request, env) {
  const allowed = adminAllowedIps(env);
  if (allowed.length === 0) return true;
  return allowed.includes(clientIp(request));
}

export function assertAdminIp(request, env) {
  if (isIpAllowed(request, env)) return null;
  return jsonResponse({ error: "관리자 접근이 허용되지 않은 IP입니다" }, 403);
}

export function assertAdminToken(request, env) {
  if (!env.ADMIN_TOKEN) return jsonResponse({ error: "ADMIN_TOKEN 미설정 — 저장 차단" }, 500);
  if (request.headers.get("x-admin-token") !== env.ADMIN_TOKEN) {
    return jsonResponse({ error: "인증 실패(x-admin-token)" }, 401);
  }
  return null;
}

export function assertAdminAccess(request, env) {
  return assertAdminIp(request, env) || assertAdminToken(request, env);
}
