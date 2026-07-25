import { summarize } from "../../lib/score.js";

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

function readEmail(request) {
  const url = new URL(request.url);
  return normalizeEmail(request.headers.get("x-user-email") || url.searchParams.get("email"));
}

function recordFromRow(row) {
  return {
    id: row.id,
    savedAt: row.created_at,
    round: JSON.parse(row.round_json),
    summary: JSON.parse(row.summary_json),
  };
}

async function ensureUser(env, email, name = "") {
  const now = new Date().toISOString();
  await env.APP_DB.prepare(`
    INSERT INTO users (id, email, name, auth_method, created_at, updated_at)
    VALUES (?, ?, ?, 'email_only', ?, ?)
    ON CONFLICT(email) DO UPDATE SET
      name = CASE WHEN excluded.name != '' THEN excluded.name ELSE users.name END,
      updated_at = excluded.updated_at
  `).bind(email, email, name, now, now).run();
}

export async function onRequestGet({ request, env }) {
  if (!env.APP_DB) return json({ error: "D1(APP_DB) 미바인딩" }, 500);
  const email = readEmail(request);
  if (!isValidEmail(email)) return json({ error: "올바른 이메일이 필요합니다" }, 400);

  const result = await env.APP_DB.prepare(`
    SELECT id, round_json, summary_json, created_at
    FROM round_records
    WHERE user_email = ?
    ORDER BY created_at DESC
    LIMIT 200
  `).bind(email).all();

  return json({ ok: true, records: (result.results || []).map(recordFromRow) });
}

export async function onRequestPost({ request, env }) {
  if (!env.APP_DB) return json({ error: "D1(APP_DB) 미바인딩" }, 500);

  let body;
  try { body = await request.json(); } catch { return json({ error: "JSON 파싱 실패" }, 400); }

  const email = normalizeEmail(body.email);
  const name = String(body.name || "").trim();
  const round = body.round && typeof body.round === "object" ? body.round : null;
  if (!isValidEmail(email)) return json({ error: "올바른 이메일이 필요합니다" }, 400);
  if (!round || !Array.isArray(round.holes)) return json({ error: "라운드 데이터가 필요합니다" }, 400);

  await ensureUser(env, email, name);

  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
  const summary = summarize(round.holes);
  const safeRound = {
    player: round.player || "",
    country: round.country || "",
    course: round.course || "",
    date: round.date || "",
    holes: round.holes.map((h) => ({ par: h.par, score: h.score })),
  };
  const now = new Date().toISOString();

  await env.APP_DB.prepare(`
    INSERT INTO round_records (id, user_email, round_json, summary_json, played_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(id, email, JSON.stringify(safeRound), JSON.stringify(summary), safeRound.date || null, now, now).run();

  return json({ ok: true, record: { id, savedAt: now, round: safeRound, summary } });
}

export async function onRequestDelete({ request, env }) {
  if (!env.APP_DB) return json({ error: "D1(APP_DB) 미바인딩" }, 500);

  const url = new URL(request.url);
  const email = readEmail(request);
  const id = url.searchParams.get("id");
  if (!isValidEmail(email)) return json({ error: "올바른 이메일이 필요합니다" }, 400);
  if (!id) return json({ error: "기록 id가 필요합니다" }, 400);

  await env.APP_DB.prepare("DELETE FROM round_records WHERE id = ? AND user_email = ?")
    .bind(id, email).run();

  return json({ ok: true });
}
