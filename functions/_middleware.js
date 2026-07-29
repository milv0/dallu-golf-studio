import { assertAdminIp } from "./_shared/adminAccess.js";

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const adminDbAccess = path === "/api/db" && (request.method !== "GET" || url.searchParams.get("admin") === "1");
  const protectedPath =
    path === "/admin" ||
    path.startsWith("/admin/") ||
    path === "/api/admin/session" ||
    adminDbAccess;

  if (protectedPath) {
    const blocked = assertAdminIp(request, env);
    if (blocked) return blocked;
  }

  return next();
}
