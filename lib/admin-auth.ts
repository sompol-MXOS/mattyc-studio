import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "mattyc-admin-session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

function adminPasscode() {
  return process.env.MATTYC_ADMIN_PASSCODE ?? "";
}

function sessionSecret() {
  return process.env.MATTYC_ADMIN_SESSION_SECRET ?? "";
}

function equalStrings(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function signature(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

export function getAdminConfiguration() {
  const missing: string[] = [];
  if (!adminPasscode()) missing.push("MATTYC_ADMIN_PASSCODE");
  if (!sessionSecret()) missing.push("MATTYC_ADMIN_SESSION_SECRET");
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  return { configured: missing.length === 0, missing };
}

export function verifyAdminPasscode(candidate: string) {
  const expected = adminPasscode();
  return Boolean(expected && sessionSecret() && equalStrings(candidate, expected));
}

export function createAdminSessionToken(now = Date.now()) {
  if (!sessionSecret()) throw new Error("Admin session secret is not configured.");
  const expiresAt = String(Math.floor(now / 1000) + ADMIN_SESSION_MAX_AGE);
  return `${expiresAt}.${signature(expiresAt)}`;
}

export function verifyAdminSessionToken(token: string | undefined, now = Date.now()) {
  if (!token || !sessionSecret()) return false;
  const [expiresAt, suppliedSignature, extra] = token.split(".");
  if (!expiresAt || !suppliedSignature || extra) return false;
  if (!/^\d+$/.test(expiresAt) || Number(expiresAt) <= Math.floor(now / 1000)) return false;
  return equalStrings(suppliedSignature, signature(expiresAt));
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: ADMIN_SESSION_MAX_AGE,
  priority: "high" as const,
};
