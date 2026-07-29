function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function disabled() {
  return json({ error: "라운딩 기록 API는 현재 비활성화되어 있습니다" }, 503);
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
