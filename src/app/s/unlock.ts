"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { rateLimit } from "@/lib/rate-limit";
import { getPublicNote, unlockCookieName, unlockCookieValue, verifyPassword } from "@/lib/public";

export async function unlockSharedNote(token: string, _prev: { error: string } | null, formData: FormData) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  // Slows down password guessing, per visitor and per link.
  if (!rateLimit(`unlock:${ip}:${token.slice(0, 12)}`, 8, 10 * 60_000)) return { error: "Too many attempts. Try again in a few minutes." };

  const password = String(formData.get("password") ?? "").slice(0, 128);
  const note = await getPublicNote(token);
  if (!note?.sharePasswordHash) redirect(`/s/${token}`);
  if (!verifyPassword(password, note.sharePasswordHash)) return { error: "That password isn't right." };

  (await cookies()).set(unlockCookieName(token), unlockCookieValue(token, note.sharePasswordHash), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect(`/s/${token}`);
}
