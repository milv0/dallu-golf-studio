import { summarize } from "./score.js";

export const ROUND_HISTORY_KEY = "sc-round-history";

const hasStorage = () => typeof window !== "undefined" && window.localStorage;

export function loadRoundHistory() {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(ROUND_HISTORY_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeRoundHistory(records) {
  if (!hasStorage()) return;
  window.localStorage.setItem(ROUND_HISTORY_KEY, JSON.stringify(records));
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

export function saveRoundRecord(round) {
  const record = createRoundRecord(round);
  const records = [record, ...loadRoundHistory()].slice(0, 200);
  writeRoundHistory(records);
  return record;
}

export function deleteRoundRecord(id) {
  const next = loadRoundHistory().filter((record) => record.id !== id);
  writeRoundHistory(next);
  return next;
}
