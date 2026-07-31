// Cloudflare Pages Function — /api/db
// GET: KV에서 코스 DB(nested) 읽기 / POST: 통째로 저장
// db = { "골프장": { nines: { "코스명": [9] }, combos: [{out,in}] } }
// KV 바인딩: COURSE_KV / 쓰기보호: env.ADMIN_TOKEN + x-admin-token 헤더
import { validateCourseDb } from "../../lib/courseDbValidation.js";
import { assertAdminAccess } from "../_shared/adminAccess.js";
import { jsonResponse as json } from "../_shared/http.js";

const DB_KEY = "db";
const META_KEY = "db-meta";
const BACKUP_PREFIX = "db-backups/";
const AUDIT_PREFIX = "db-audit/";

function isPlainObject(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function parseJson(value, fallback = null) {
  if (!value) return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

function backupKeyFor(date = new Date()) {
  const suffix = typeof crypto !== "undefined" && crypto.randomUUID
    ? `-${crypto.randomUUID().slice(0, 8)}`
    : `-${Math.random().toString(36).slice(2, 10)}`;
  return `${BACKUP_PREFIX}${date.toISOString().replaceAll(":", "-")}${suffix}`;
}

function auditKeyFor(date = new Date(), revision = "") {
  return `${AUDIT_PREFIX}${date.toISOString().replaceAll(":", "-")}-${revision}`;
}

function newRevision(date = new Date()) {
  const suffix = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID().slice(0, 12)
    : Math.random().toString(36).slice(2, 14);
  return `${date.getTime().toString(36)}-${suffix}`;
}

async function readMeta(env) {
  return parseJson(await env.COURSE_KV.get(META_KEY), { revision: null, updatedAt: null, clubs: 0 });
}

async function listKv(env, prefix, limit = 50) {
  if (typeof env.COURSE_KV.list !== "function") return [];
  const result = await env.COURSE_KV.list({ prefix, limit });
  return (result.keys || [])
    .map((item) => ({
      key: item.name,
      metadata: item.metadata || null,
    }))
    .sort((a, b) => b.key.localeCompare(a.key));
}

function summarizeDbDiff(previous, next) {
  const before = isPlainObject(previous) ? previous : {};
  const after = isPlainObject(next) ? next : {};
  const beforeClubs = new Set(Object.keys(before));
  const afterClubs = new Set(Object.keys(after));
  const addedClubs = [...afterClubs].filter((name) => !beforeClubs.has(name));
  const removedClubs = [...beforeClubs].filter((name) => !afterClubs.has(name));
  const changedClubs = [];
  let addedNines = 0;
  let removedNines = 0;

  for (const club of afterClubs) {
    if (!beforeClubs.has(club)) {
      addedNines += Object.keys(after[club]?.nines || {}).length;
      continue;
    }
    const prevNines = new Set(Object.keys(before[club]?.nines || {}));
    const nextNines = new Set(Object.keys(after[club]?.nines || {}));
    const prevSnapshot = JSON.stringify(before[club] || {});
    const nextSnapshot = JSON.stringify(after[club] || {});
    if (prevSnapshot !== nextSnapshot) changedClubs.push(club);
    addedNines += [...nextNines].filter((name) => !prevNines.has(name)).length;
    removedNines += [...prevNines].filter((name) => !nextNines.has(name)).length;
  }
  for (const club of removedClubs) {
    removedNines += Object.keys(before[club]?.nines || {}).length;
  }

  return {
    addedClubs,
    removedClubs,
    changedClubs,
    addedNines,
    removedNines,
  };
}

function readSavePayload(body) {
  if (body?.action === "restore") {
    return {
      action: "restore",
      backupKey: String(body.backupKey || ""),
      baseRevision: body.baseRevision ?? null,
    };
  }
  if (isPlainObject(body) && Object.prototype.hasOwnProperty.call(body, "db") && Object.prototype.hasOwnProperty.call(body, "baseRevision")) {
    return { action: "save", db: body.db, baseRevision: body.baseRevision ?? null };
  }
  return { action: "save", db: body, baseRevision: undefined };
}

async function writeDbWithBackup(env, nextDb, { baseRevision, action = "save", restoredFrom = null } = {}) {
  const validation = validateCourseDb(nextDb);
  if (!validation.ok) {
    return json({ error: "잘못된 DB 형식", details: validation.errors }, 400);
  }

  const previousRaw = await env.COURSE_KV.get(DB_KEY);
  const previousDb = parseJson(previousRaw, {});
  const currentMeta = await readMeta(env);
  const currentRevision = currentMeta?.revision ?? null;
  if (baseRevision !== undefined && currentRevision !== (baseRevision ?? null)) {
    return json({
      error: "DB가 이미 변경되었습니다. 새로고침 후 다시 저장하세요.",
      currentRevision,
      updatedAt: currentMeta?.updatedAt || null,
    }, 409);
  }

  const now = new Date();
  const backupKey = previousRaw ? backupKeyFor(now) : null;
  if (backupKey) {
    await env.COURSE_KV.put(backupKey, previousRaw, {
      metadata: {
        createdAt: now.toISOString(),
        revision: currentRevision,
        clubs: Object.keys(previousDb).length,
        reason: action,
      },
    });
  }

  const revision = newRevision(now);
  const diff = summarizeDbDiff(previousDb, nextDb);
  const meta = {
    revision,
    updatedAt: now.toISOString(),
    clubs: Object.keys(nextDb).length,
    backupKey,
  };
  const audit = {
    type: action,
    at: now.toISOString(),
    baseRevision: currentRevision,
    revision,
    backupKey,
    restoredFrom,
    clubs: Object.keys(nextDb).length,
    diff,
  };
  const auditKey = auditKeyFor(now, revision);

  await env.COURSE_KV.put(DB_KEY, JSON.stringify(nextDb));
  await env.COURSE_KV.put(META_KEY, JSON.stringify(meta));
  await env.COURSE_KV.put(auditKey, JSON.stringify(audit), {
    metadata: {
      type: action,
      at: audit.at,
      revision,
      clubs: audit.clubs,
    },
  });

  return json({ ok: true, clubs: Object.keys(nextDb).length, backupKey, meta, auditKey, diff });
}

export async function onRequestGet({ request, env }) {
  if (!env.COURSE_KV) return json({ error: "KV(COURSE_KV) 미바인딩" }, 500);
  const url = new URL(request.url);
  if (url.searchParams.get("admin") !== "1") {
    return json({ error: "코스 DB 공개 조회는 현재 비활성화되어 있습니다" }, 503);
  }

  const authError = assertAdminAccess(request, env);
  if (authError) return authError;
  const raw = await env.COURSE_KV.get(DB_KEY);
  const db = parseJson(raw, {});
  const meta = await readMeta(env);
  const backups = await listKv(env, BACKUP_PREFIX, 50);
  const audit = await listKv(env, AUDIT_PREFIX, 50);
  return json({ ok: true, db, meta, backups, audit });
}

export async function onRequestPost({ request, env }) {
  if (!env.COURSE_KV) return json({ error: "KV(COURSE_KV) 미바인딩" }, 500);
  const authError = assertAdminAccess(request, env);
  if (authError) return authError;
  let body;
  try { body = await request.json(); } catch { return json({ error: "JSON 파싱 실패" }, 400); }

  const payload = readSavePayload(body);
  if (payload.action === "restore") {
    if (!payload.backupKey.startsWith(BACKUP_PREFIX)) {
      return json({ error: "잘못된 백업 키" }, 400);
    }
    const backupRaw = await env.COURSE_KV.get(payload.backupKey);
    if (!backupRaw) return json({ error: "백업을 찾을 수 없습니다" }, 404);
    return writeDbWithBackup(env, parseJson(backupRaw, {}), {
      baseRevision: payload.baseRevision,
      action: "restore",
      restoredFrom: payload.backupKey,
    });
  }

  return writeDbWithBackup(env, payload.db, {
    baseRevision: payload.baseRevision,
    action: "save",
  });
}
