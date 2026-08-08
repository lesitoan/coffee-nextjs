import { redirect } from "next/navigation";
import { createOAuthState, getGitHubAuthorizeUrl } from "@/lib/auth/github-oauth";
import { setOAuthStateCookie } from "@/lib/auth/session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const callbackUrl = url.searchParams.get("callbackUrl") || "/admin";
  const state = createOAuthState(callbackUrl);
  await setOAuthStateCookie(state);
  redirect(getGitHubAuthorizeUrl(state));
}
