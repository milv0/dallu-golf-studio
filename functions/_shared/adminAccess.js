function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

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

export function isIpAllowed(request, env) {
  const allowed = adminAllowedIps(env);
  if (allowed.length === 0) return true;
  return allowed.includes(clientIp(request));
}

export function assertAdminIp(request, env) {
  if (isIpAllowed(request, env)) return null;
  return json({ error: "관리자 접근이 허용되지 않은 IP입니다" }, 403);
}

export function assertAdminToken(request, env) {
  if (!env.ADMIN_TOKEN) return json({ error: "ADMIN_TOKEN 미설정 — 저장 차단" }, 500);
  if (request.headers.get("x-admin-token") !== env.ADMIN_TOKEN) {
    return json({ error: "인증 실패(x-admin-token)" }, 401);
  }
  return null;
}

export function assertAdminAccess(request, env) {
  return assertAdminIp(request, env) || assertAdminToken(request, env);
}
