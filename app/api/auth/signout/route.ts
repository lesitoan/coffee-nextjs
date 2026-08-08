import { redirect } from "next/navigation";
import { clearSessionCookie } from "@/lib/auth/session";

export async function POST() {
  await clearSessionCookie();
  redirect("/admin/login");
}
