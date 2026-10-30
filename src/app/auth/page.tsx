import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getSessionUser } from "@/lib/auth/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in" };

// One page for everyone: the emailed link signs existing users in and creates new accounts.
export default async function Page() {
  if (await getSessionUser()) redirect("/notes");
  return (
    <main className="grid min-h-dvh place-items-center bg-background p-6 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
      <AuthForm />
    </main>
  );
}
