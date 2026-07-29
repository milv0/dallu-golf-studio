export const STUDIO_STORAGE_KEYS = {
  round: "sc-round",
  holeCard: "sc-holecard",
  linkedThree: "sc-linked-three",
  customSession: "sc-custom-session",
  favorites: "sc-favorites",
  legacyThreeHole: "sc-threehole",
  legacyManualNine: "sc-manual-nine",
  lastCustomRoute: "sc-last-custom-route",
  lastRoundRoute: "sc-last-round-route",
};

const hasStorage = () => typeof window !== "undefined" && window.localStorage;

export function readJsonStorage(key, fallback = null) {
  if (!hasStorage()) return fallback;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "null");
    return parsed == null ? fallback : parsed;
  } catch {
    return fallback;
  }
}

export function writeJsonStorage(key, value) {
  if (!hasStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}
