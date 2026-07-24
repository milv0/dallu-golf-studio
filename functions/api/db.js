// Cloudflare Pages Function — /api/db
// GET: KV에서 코스 DB 읽기 / POST: 코스 DB 저장
// KV 바인딩 변수명: COURSE_KV (대시보드 Settings→Functions→KV bindings 에서 연결)
// (선택) 쓰기 보호: 환경변수 ADMIN_TOKEN 설정 시 x-admin-token 헤더 필요

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export async function onRequestGet({ env }) {
  if (!env.COURSE_KV) return json({ error: "KV(COURSE_KV) 미바인딩" }, 500);
  const raw = await env.COURSE_KV.get("db");
  return json(raw ? JSON.parse(raw) : { nines: [], combos: [] });
}

export async function onRequestPost({ request, env }) {
  if (!env.COURSE_KV) return json({ error: "KV(COURSE_KV) 미바인딩" }, 500);
  if (env.ADMIN_TOKEN) {
    if (request.headers.get("x-admin-token") !== env.ADMIN_TOKEN) {
      return json({ error: "인증 실패(x-admin-token)" }, 401);
    }
  }
  let body;
  try { body = await request.json(); } catch { return json({ error: "JSON 파싱 실패" }, 400); }
  const db = { nines: body.nines || [], combos: body.combos || [] };
  await env.COURSE_KV.put("db", JSON.stringify(db));
  return json({ ok: true, nines: db.nines.length, combos: db.combos.length });
}
