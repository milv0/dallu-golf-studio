import { assertAdminAccess } from "../../_shared/adminAccess.js";

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export async function onRequestPost({ request, env }) {
  const authError = assertAdminAccess(request, env);
  if (authError) return authError;
  return json({ ok: true });
}
