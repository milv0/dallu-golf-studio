import { assertAdminAccess } from "../../_shared/adminAccess.js";
import { jsonResponse } from "../../_shared/http.js";

export async function onRequestPost({ request, env }) {
  const authError = assertAdminAccess(request, env);
  if (authError) return authError;
  return jsonResponse({ ok: true });
}
