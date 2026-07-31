export const STUDIO_STORAGE_KEYS = {
  round: "sc-round",
  holeCard: "sc-holecard",
  linkedThree: "sc-linked-three",
  customSession: "sc-custom-session",
  favorites: "sc-favorites",
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
