// Cloudflare Pages Function — /api/db
// GET: KV에서 코스 DB(nested) 읽기 / POST: 통째로 저장
// db = { "골프장": { nines: { "코스명": [9] }, combos: [{out,in}] } }
// KV 바인딩: COURSE_KV / 쓰기보호: env.ADMIN_TOKEN + x-admin-token 헤더
import { validateCourseDb } from "../../lib/courseDbValidation.js";

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function backupKeyFor(date = new Date()) {
  return `db-backups/${date.toISOString().replaceAll(":", "-")}`;
}

export async function onRequestGet({ env }) {
  if (!env.COURSE_KV) return json({ error: "KV(COURSE_KV) 미바인딩" }, 500);
  const raw = await env.COURSE_KV.get("db");
  return json(raw ? JSON.parse(raw) : {});
}

export async function onRequestPost({ request, env }) {
  if (!env.COURSE_KV) return json({ error: "KV(COURSE_KV) 미바인딩" }, 500);
  if (!env.ADMIN_TOKEN) {
    return json({ error: "ADMIN_TOKEN 미설정 — 저장 차단" }, 500);
  }
  if (request.headers.get("x-admin-token") !== env.ADMIN_TOKEN) {
    return json({ error: "인증 실패(x-admin-token)" }, 401);
  }
  let body;
  try { body = await request.json(); } catch { return json({ error: "JSON 파싱 실패" }, 400); }
  const validation = validateCourseDb(body);
  if (!validation.ok) {
    return json({ error: "잘못된 DB 형식", details: validation.errors }, 400);
  }
  const previous = await env.COURSE_KV.get("db");
  let backupKey = null;
  if (previous) {
    backupKey = backupKeyFor();
    await env.COURSE_KV.put(backupKey, previous);
  }
  await env.COURSE_KV.put("db", JSON.stringify(body));
  return json({ ok: true, clubs: Object.keys(body).length, backupKey });
}
