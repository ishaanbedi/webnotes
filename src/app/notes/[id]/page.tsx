import { notFound } from "next/navigation";
import { z } from "zod";
import { getAccess, requireUserId } from "@/lib/access";
import { realtimeEnabled, sealNote } from "@/lib/realtime";
import { storageEnabled } from "@/lib/storage";
import { NoteView } from "@/components/note-view";


export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const userId = await requireUserId();
  const access = await getAccess(id, userId);
  if (!access) notFound();
  const { note } = access;

  const sealed = realtimeEnabled() ? await sealNote(note.id) : null;

  return (
    <NoteView
      key={note.id}
      note={{
        id: note.id,
        title: note.title,
        icon: note.icon,
        content: note.content,
        isFavorite: note.isFavorite,
        trashed: !!note.trashedAt,
        shareToken: note.shareToken,
        shareExpiresAt: note.shareExpiresAt?.toISOString() ?? null,
        hasSharePassword: !!note.sharePasswordHash,
        updatedAt: note.updatedAt.toISOString(),
      }}
      sealed={sealed}
      imagesEnabled={storageEnabled()}
    />
  );
}
