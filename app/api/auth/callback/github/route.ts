import { redirect } from "next/navigation";
import { exchangeCodeForGitHubUser, parseOAuthState } from "@/lib/auth/github-oauth";
import { consumeOAuthStateCookie, createSessionToken, setSessionCookie } from "@/lib/auth/session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const storedState = await consumeOAuthStateCookie();

  if (!code || !returnedState || !storedState || returnedState !== storedState) {
    redirect("/admin/login?error=oauth_state");
  }

  let callbackUrl = "/admin";

  try {
    const user = await exchangeCodeForGitHubUser(code);
    await setSessionCookie(createSessionToken(user));
    callbackUrl = parseOAuthState(returnedState).callbackUrl;
  } catch (error) {
    const message = error instanceof Error ? error.message : "github_login_failed";
    redirect(`/admin/login?error=${encodeURIComponent(message)}`);
  }

  redirect(callbackUrl);
}
