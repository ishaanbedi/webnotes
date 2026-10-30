"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

// Sign-in is passwordless: the email link is requested from the browser (see AuthForm).
export async function signOutAction() {
  await auth.signOut();
  redirect("/home");
}
