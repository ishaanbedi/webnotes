import { NewNoteButton } from "@/components/new-note-button";
import { createNote } from "@/lib/actions";

export const metadata = { title: "Notes" };

export default function NotesHome() {
  return (
    <main className="grid min-h-full place-items-center p-6">
      <div className="max-w-sm">
        <h1 className="text-xl font-semibold tracking-tight">Pick a note, or start a new one</h1>
        <p className="mt-2 text-sm text-muted-foreground">Everything you write is saved automatically as Markdown.</p>
        <form action={createNote} className="mt-5">
          <NewNoteButton className="mx-auto h-9 rounded-md px-4 text-sm" />
        </form>
      </div>
    </main>
  );
}
