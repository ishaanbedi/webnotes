import Link from "next/link";
import { DeveloperLink } from "@/components/developer-link";
import { Playground } from "@/components/playground";
import { getSessionUser } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

const button = "inline-flex h-11 touch-manipulation items-center rounded-md px-5 text-sm font-medium transition-[colors,transform] duration-100 active:scale-[0.97]";

const points = [
  { title: "Write", body: "Type / to add headings, lists and checkboxes. Select text to format it." },
  { title: "Share", body: "Send a note as a link. Add a password or an end date if you like. Sharing needs a free account." },
  { title: "Organize", body: "Star favorites, search by title and bring anything back from the trash." },
  { title: "Saved", body: "Start without an account. Notes save on your device as you type." },
];

export const metadata = { alternates: { canonical: "/home" } };

export default async function Home({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const deleted = (await searchParams).deleted === "1";
  const signedIn = !!(await getSessionUser());
  const primary = `${button} bg-primary text-primary-foreground hover:opacity-90`;

  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <header className="flex h-16 items-center justify-between">
        <span className="font-semibold tracking-tight">Webnotes</span>
        <nav className="flex items-center gap-4 text-sm">
          {signedIn ? (
            <Link href="/notes" className="font-medium">Open notes</Link>
          ) : (
            <>
              <Link href="/auth" className="text-muted-foreground transition-colors hover:text-foreground">Sign in</Link>
            </>
          )}
        </nav>
      </header>

      <main id="main" className="flex-1">
        {deleted && (
          <p role="status" className="mt-4 rounded-md border px-4 py-3 text-sm text-muted-foreground">Your account and notes have been deleted.</p>
        )}
        <section className="pt-20 text-center sm:pt-28">
          <h1 className="mx-auto max-w-3xl text-5xl leading-[1.05] font-semibold tracking-tighter text-balance sm:text-7xl">
            A simple place for your notes.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground sm:text-xl">Write anything. Share it with a link.</p>
          <div className="mt-9 flex justify-center gap-2">
            <Link href="/notes" className={primary}>
              {signedIn ? "Open notes" : "Start writing"}
            </Link>
          </div>
        </section>

        <section aria-label="Try it" className="mt-20">
          <Playground />
        </section>

        <dl className="grid gap-8 py-20 sm:grid-cols-2 lg:grid-cols-4">
          {points.map((p) => (
            <div key={p.title}>
              <dt className="text-sm font-medium">{p.title}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.body}</dd>
            </div>
          ))}
        </dl>
      </main>

      <footer className="flex h-16 items-center border-t text-sm text-muted-foreground">
        <span>Webnotes by <DeveloperLink /></span>
      </footer>
    </div>
  );
}
