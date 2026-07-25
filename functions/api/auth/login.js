function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

export async function onRequestPost({ request, env }) {
  if (!env.APP_DB) return json({ error: "D1(APP_DB) 미바인딩" }, 500);

  let body;
  try { body = await request.json(); } catch { return json({ error: "JSON 파싱 실패" }, 400); }

  const email = normalizeEmail(body.email);
  const name = String(body.name || "").trim();
  if (!name) return json({ error: "이름을 입력하세요" }, 400);
  if (!isValidEmail(email)) return json({ error: "올바른 이메일을 입력하세요" }, 400);

  const id = email;
  const now = new Date().toISOString();
  await env.APP_DB.prepare(`
    INSERT INTO users (id, email, name, auth_method, created_at, updated_at)
    VALUES (?, ?, ?, 'email_only', ?, ?)
    ON CONFLICT(email) DO UPDATE SET
      name = excluded.name,
      auth_method = 'email_only',
      updated_at = excluded.updated_at
  `).bind(id, email, name, now, now).run();

  return json({ ok: true, user: { id, email, name, authMethod: "email_only" } });
}
