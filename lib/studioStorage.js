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

export const WORK_STORAGE_KEYS = [
  STUDIO_STORAGE_KEYS.round,
  STUDIO_STORAGE_KEYS.holeCard,
  STUDIO_STORAGE_KEYS.linkedThree,
  STUDIO_STORAGE_KEYS.customSession,
  STUDIO_STORAGE_KEYS.legacyThreeHole,
  STUDIO_STORAGE_KEYS.legacyManualNine,
  STUDIO_STORAGE_KEYS.lastCustomRoute,
  STUDIO_STORAGE_KEYS.lastRoundRoute,
];

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

export function removeStorageKeys(keys) {
  if (!hasStorage()) return;
  for (const key of keys) window.localStorage.removeItem(key);
}

export function clearStudioWorkStorage() {
  removeStorageKeys(WORK_STORAGE_KEYS);
}
