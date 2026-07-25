import { summarize } from "./score.js";

export const ROUND_HISTORY_KEY = "sc-round-history";

const hasStorage = () => typeof window !== "undefined" && window.localStorage;
const userHistoryKey = (user) => user?.email ? `${ROUND_HISTORY_KEY}:${String(user.email).trim().toLowerCase()}` : ROUND_HISTORY_KEY;

export function loadRoundHistory(user = null) {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(userHistoryKey(user));
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeRoundHistory(records, user = null) {
  if (!hasStorage()) return;
  window.localStorage.setItem(userHistoryKey(user), JSON.stringify(records));
}

export function createRoundRecord(round) {
  const summary = summarize(round.holes || []);
  const now = new Date().toISOString();
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
  return {
    id,
    savedAt: now,
    round: {
      player: round.player || "",
      country: round.country || "",
      course: round.course || "",
      date: round.date || "",
      holes: Array.isArray(round.holes) ? round.holes.map((h) => ({ par: h.par, score: h.score })) : [],
    },
    summary,
  };
}

export function saveRoundRecord(round, user = null) {
  const record = createRoundRecord(round);
  const records = [record, ...loadRoundHistory(user)].slice(0, 200);
  writeRoundHistory(records, user);
  return record;
}

export function deleteRoundRecord(id, user = null) {
  const next = loadRoundHistory(user).filter((record) => record.id !== id);
  writeRoundHistory(next, user);
  return next;
}

export function migrateLegacyRoundHistory(user) {
  if (!hasStorage() || !user?.email) return [];
  const legacy = loadRoundHistory(null);
  if (legacy.length === 0) return loadRoundHistory(user);
  const existing = loadRoundHistory(user);
  const seen = new Set(existing.map((record) => record.id));
  const merged = [...existing, ...legacy.filter((record) => !seen.has(record.id))].slice(0, 200);
  writeRoundHistory(merged, user);
  window.localStorage.removeItem(ROUND_HISTORY_KEY);
  return merged;
}
