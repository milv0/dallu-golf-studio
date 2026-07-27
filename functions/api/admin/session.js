function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_TOKEN) return json({ error: "ADMIN_TOKEN 미설정" }, 500);
  const token = request.headers.get("x-admin-token") || "";
  if (token !== env.ADMIN_TOKEN) return json({ error: "관리자 인증 실패" }, 401);
  return json({ ok: true });
}
