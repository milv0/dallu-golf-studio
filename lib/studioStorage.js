export const STUDIO_STORAGE_KEYS = {
  round: "sc-round",
  holeCard: "sc-holecard",
  linkedThree: "sc-linked-three",
  customSession: "sc-custom-session",
  favorites: "sc-favorites",
  parLocked: "sc-par-locked",
  legacyThreeHole: "sc-threehole",
  legacyManualNine: "sc-manual-nine",
  lastCustomRoute: "sc-last-custom-route",
};

function storage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readJsonStorage(key, fallback = null) {
  const target = storage();
  if (!target) return fallback;
  try {
    const parsed = JSON.parse(target.getItem(key) || "null");
    return parsed == null ? fallback : parsed;
  } catch {
    return fallback;
  }
}

export function writeJsonStorage(key, value) {
  const target = storage();
  if (!target) return false;
  try {
    target.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

const WRITE_DELAY_MS = 300;
const pendingWrites = new Map();

// 타이핑 한 글자마다 직렬화/저장하지 않도록 키별로 마지막 값만 지연 저장한다.
// 대기 중 값은 flushJsonStorage()로 즉시 반영되므로 취소 핸들은 반환하지 않는다.
export function scheduleJsonStorage(key, value, delay = WRITE_DELAY_MS) {
  if (typeof window === "undefined") return;
  const existing = pendingWrites.get(key);
  if (existing) window.clearTimeout(existing.timer);
  const timer = window.setTimeout(() => {
    pendingWrites.delete(key);
    writeJsonStorage(key, value);
  }, delay);
  pendingWrites.set(key, { timer, value });
}

// 탭을 닫거나 백그라운드로 갈 때 대기 중인 저장을 즉시 반영한다.
export function flushJsonStorage() {
  for (const [key, entry] of pendingWrites) {
    if (typeof window !== "undefined") window.clearTimeout(entry.timer);
    writeJsonStorage(key, entry.value);
  }
  pendingWrites.clear();
}
