import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

// Signed-in users go straight to the app; everyone else sees the landing page.
export default async function Root() {
  redirect((await getSessionUser()) ? "/notes" : "/home");
}
