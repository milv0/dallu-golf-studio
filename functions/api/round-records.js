import { jsonResponse } from "../_shared/http.js";

function disabled() {
  return jsonResponse({ error: "라운딩 기록 API는 현재 비활성화되어 있습니다" }, 503);
}

export async function onRequestGet() {
  return disabled();
}

export async function onRequestPost() {
  return disabled();
}

export async function onRequestDelete() {
  return disabled();
}
