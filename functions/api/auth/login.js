function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export async function onRequestPost() {
  return json({ error: "로그인 기능은 현재 비활성화되어 있습니다" }, 503);
}
