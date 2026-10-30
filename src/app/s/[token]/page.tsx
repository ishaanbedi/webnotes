import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeveloperLink } from "@/components/developer-link";
import { SharedNote } from "@/components/shared-note";
import { getPublicNote, isUnlocked } from "@/lib/public";
import { UnlockForm } from "@/components/unlock-form";
import { realtimeEnabled, sealPublicNote } from "@/lib/realtime";
import { withShareToken } from "@/lib/files";
import { ThemeToggle } from "@/components/theme-toggle";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shared note", robots: { index: false, follow: false } };

export default async function SharedNotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const note = await getPublicNote(token);
  if (!note) notFound();

  if (!(await isUnlocked(token, note.sharePasswordHash))) {
    return (
      <div className="min-h-dvh px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        <header className="flex h-12 items-center"><Link href="/" className="text-sm font-semibold tracking-tight">Webnotes</Link></header>
        <UnlockForm token={token} />
      </div>
    );
  }

  const sealed = realtimeEnabled() ? await sealPublicNote(token) : null;

  return (
    <div className="min-h-dvh pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <header className="flex h-12 items-center justify-between border-b px-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">Webnotes</Link>
        <ThemeToggle />
      </header>
      <main className="mx-auto max-w-3xl px-6 pt-14 pb-10 sm:px-10">
        <SharedNote
          token={token}
          sealed={sealed}
          initial={{ id: note.id, title: note.title, icon: note.icon, content: withShareToken(note.content, token), trashed: false }}
        />
        <p className="mt-12 border-t pt-4 text-xs text-muted-foreground">
          Last edited {note.updatedAt.toLocaleDateString(undefined, { dateStyle: "medium" })}. Webnotes by <DeveloperLink />
        </p>
      </main>
    </div>
  );
}
