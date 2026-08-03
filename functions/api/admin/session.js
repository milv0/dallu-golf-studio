import { adminIpPolicy, assertAdminAccess } from "../../_shared/adminAccess.js";
import { jsonResponse } from "../../_shared/http.js";

export async function onRequestPost({ request, env }) {
  const authError = await assertAdminAccess(request, env);
  if (authError) return authError;
  // ipGate를 함께 돌려줘 관리자 UI에서 IP 제한이 실제로 켜져 있는지 확인할 수 있게 한다.
  return jsonResponse({ ok: true, ipGate: adminIpPolicy(env).mode });
}
