// 코스 DB API 클라이언트 (/api/db — Cloudflare KV)
export async function fetchDb() {
  const r = await fetch("/api/db", { cache: "no-store" });
  if (!r.ok) throw new Error("fetchDb " + r.status);
  return r.json();
}

export async function fetchDbAdmin(token) {
  const r = await fetch("/api/db?admin=1", {
    cache: "no-store",
    headers: { ...(token ? { "x-admin-token": token } : {}) },
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || `관리자 DB 조회 실패 ${r.status}`);
  return data;
}

export async function pushDb(db, token, options = {}) {
  const r = await fetch("/api/db", {
    method: "POST",
    headers: { "content-type": "application/json", ...(token ? { "x-admin-token": token } : {}) },
    body: JSON.stringify({ db: db || {}, baseRevision: options.baseRevision ?? null }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const details = Array.isArray(data.details) && data.details.length
      ? `\n- ${data.details.slice(0, 10).join("\n- ")}`
      : "";
    throw new Error((data.error || ("저장 실패 " + r.status)) + details);
  }
  return data;
}

export async function restoreDbBackup(backupKey, token, options = {}) {
  const r = await fetch("/api/db", {
    method: "POST",
    headers: { "content-type": "application/json", ...(token ? { "x-admin-token": token } : {}) },
    body: JSON.stringify({ action: "restore", backupKey, baseRevision: options.baseRevision ?? null }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || `백업 복구 실패 ${r.status}`);
  return data;
}

export async function verifyAdminToken(token) {
  const r = await fetch("/api/admin/session", {
    method: "POST",
    headers: { "content-type": "application/json", ...(token ? { "x-admin-token": token } : {}) },
    body: JSON.stringify({}),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || `관리자 인증 실패 ${r.status}`);
  return data;
}

export async function loginEmailUser({ name, email }) {
  const r = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name, email }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || `로그인 실패 ${r.status}`);
  return data.user;
}

export async function fetchRoundRecords(user) {
  const email = user?.email || "";
  const r = await fetch("/api/round-records", {
    headers: { "x-user-email": email },
    cache: "no-store",
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || `라운딩 기록 조회 실패 ${r.status}`);
  return data.records || [];
}

export async function createRoundRecordRemote(user, round) {
  const r = await fetch("/api/round-records", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: user?.email, name: user?.name, round }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || `라운딩 기록 저장 실패 ${r.status}`);
  return data.record;
}

export async function deleteRoundRecordRemote(user, id) {
  const r = await fetch(`/api/round-records?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { "x-user-email": user?.email || "" },
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || `라운딩 기록 삭제 실패 ${r.status}`);
  return data;
}
