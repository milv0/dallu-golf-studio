export const CURRENT_USER_KEY = "sc-current-user";

const hasStorage = () => typeof window !== "undefined" && window.localStorage;

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

export function loadCurrentUser() {
  if (!hasStorage()) return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CURRENT_USER_KEY) || "null");
    if (!parsed || !isValidEmail(parsed.email)) return null;
    return {
      id: normalizeEmail(parsed.email),
      name: String(parsed.name || "").trim(),
      email: normalizeEmail(parsed.email),
      createdAt: parsed.createdAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveCurrentUser({ name, email }) {
  if (!hasStorage()) return null;
  const user = {
    id: normalizeEmail(email),
    name: String(name || "").trim(),
    email: normalizeEmail(email),
    createdAt: new Date().toISOString(),
  };
  window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
}

export function clearCurrentUser() {
  if (!hasStorage()) return;
  window.localStorage.removeItem(CURRENT_USER_KEY);
}
