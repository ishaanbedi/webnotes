import Link from "next/link";

export const metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background p-6">
      <div className="max-w-sm">
        <p className="text-sm text-muted-foreground">404</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">We can't find that page</h1>
        <p className="mt-2 text-sm text-muted-foreground">It may have been deleted, or the link may be wrong.</p>
        <Link href="/" className="mt-5 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90">Go to Webnotes</Link>
      </div>
    </main>
  );
}
