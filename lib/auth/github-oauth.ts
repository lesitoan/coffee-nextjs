import "server-only";

import crypto from "node:crypto";
import { getAllowedAdminLogins, getBaseUrl } from "@/lib/auth/session";

type GitHubTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GitHubUser = {
  login: string;
  name?: string;
  avatar_url?: string;
};

export function createOAuthState(callbackUrl: string) {
  const nonce = crypto.randomBytes(18).toString("base64url");
  return Buffer.from(JSON.stringify({ nonce, callbackUrl })).toString("base64url");
}

export function parseOAuthState(state: string | null) {
  if (!state) return { callbackUrl: "/admin" };
  try {
    const parsed = JSON.parse(Buffer.from(state, "base64url").toString("utf8")) as { callbackUrl?: string };
    return {
      callbackUrl: parsed.callbackUrl?.startsWith("/") ? parsed.callbackUrl : "/admin"
    };
  } catch {
    return { callbackUrl: "/admin" };
  }
}

export function getGitHubAuthorizeUrl(state: string) {
  const clientId = process.env.AUTH_GITHUB_ID;
  if (!clientId) throw new Error("AUTH_GITHUB_ID is missing.");

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", `${getBaseUrl()}/api/auth/callback/github`);
  url.searchParams.set("scope", "read:user user:email");
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeCodeForGitHubUser(code: string) {
  const clientId = process.env.AUTH_GITHUB_ID;
  const clientSecret = process.env.AUTH_GITHUB_SECRET;
  if (!clientId || !clientSecret) throw new Error("GitHub OAuth env vars are missing.");

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${getBaseUrl()}/api/auth/callback/github`
    })
  });

  const tokenJson = (await tokenResponse.json()) as GitHubTokenResponse;
  if (!tokenResponse.ok || !tokenJson.access_token) {
    throw new Error(tokenJson.error_description || tokenJson.error || "Could not exchange GitHub OAuth code.");
  }

  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${tokenJson.access_token}`,
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });

  if (!userResponse.ok) throw new Error("Could not fetch GitHub user.");
  const user = (await userResponse.json()) as GitHubUser;
  const allowed = getAllowedAdminLogins();
  if (!allowed.includes(user.login.toLowerCase())) {
    throw new Error(`GitHub user ${user.login} is not allowed to access admin.`);
  }

  return {
    login: user.login,
    name: user.name,
    avatarUrl: user.avatar_url
  };
}
