import { jsonResponse } from "../../_shared/http.js";

export async function onRequestPost() {
  return jsonResponse({ error: "로그인 기능은 현재 비활성화되어 있습니다" }, 503);
}
