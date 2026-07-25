// 코스 DB API 클라이언트 (/api/db — Cloudflare KV)
export async function fetchDb() {
  const r = await fetch("/api/db", { cache: "no-store" });
  if (!r.ok) throw new Error("fetchDb " + r.status);
  return r.json();
}

export async function pushDb(db, token) {
  const r = await fetch("/api/db", {
    method: "POST",
    headers: { "content-type": "application/json", ...(token ? { "x-admin-token": token } : {}) },
    body: JSON.stringify(db || {}),
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
