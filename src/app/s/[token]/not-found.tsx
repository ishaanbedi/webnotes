import Link from "next/link";

export const metadata = { title: "Link unavailable" };

export default function SharedNotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background p-6">
      <div className="max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight">This link doesn't work</h1>
        <p className="mt-2 text-sm text-muted-foreground">It may have expired, been turned off by its owner, or the note was deleted. Ask them for a new link.</p>
        <Link href="/home" className="mt-5 inline-block text-sm font-medium hover:underline">What is Webnotes?</Link>
      </div>
    </main>
  );
}
