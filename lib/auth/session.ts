import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "classic_coffee_admin";
const OAUTH_STATE_COOKIE = "classic_coffee_oauth_state";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
// TODO: Set this back to false to re-enable GitHub admin login.
const TEMP_DISABLE_ADMIN_AUTH = true;

export type AdminSession = {
  login: string;
  name?: string;
  avatarUrl?: string;
  iat: number;
  exp: number;
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is missing.");
  return secret;
}

export function getBaseUrl() {
  return (
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://127.0.0.1:3000"
  ).replace(/\/$/, "");
}

function base64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function sign(value: string) {
  return base64url(crypto.createHmac("sha256", getAuthSecret()).update(value).digest());
}

export function createSessionToken(input: Omit<AdminSession, "iat" | "exp">) {
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminSession = {
    ...input,
    iat: now,
    exp: now + SESSION_MAX_AGE
  };
  const body = base64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token?: string) {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature || sign(body) !== signature) return null;

  try {
    const payload = JSON.parse(Buffer.from(body.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")) as AdminSession;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function requireAdmin() {
  if (TEMP_DISABLE_ADMIN_AUTH) {
    const now = Math.floor(Date.now() / 1000);
    return {
      login: "local-admin",
      name: "Local Admin",
      iat: now,
      exp: now + SESSION_MAX_AGE
    } satisfies AdminSession;
  }

  const admin = await getCurrentAdmin();
  if (!admin) redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent("/admin")}`);
  return admin;
}

export async function assertAdminApi() {
  if (TEMP_DISABLE_ADMIN_AUTH) return null;

  const admin = await getCurrentAdmin();
  if (!admin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function setOAuthStateCookie(state: string) {
  const cookieStore = await cookies();
  cookieStore.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10
  });
}

export async function consumeOAuthStateCookie() {
  const cookieStore = await cookies();
  const state = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  cookieStore.delete(OAUTH_STATE_COOKIE);
  return state;
}

export function getAllowedAdminLogins() {
  return (process.env.ADMIN_GITHUB_LOGINS || "")
    .split(",")
    .map((login) => login.trim().toLowerCase())
    .filter(Boolean);
}

export const adminSessionCookieName = SESSION_COOKIE;
