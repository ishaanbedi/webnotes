import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAccess } from "@/lib/access";
import { getSessionUser } from "@/lib/auth/server";
import { getPublicNote, isUnlocked } from "@/lib/public";
import { FILE_NAME_RE } from "@/lib/files";
import { noteKey, presignDownload, storageEnabled } from "@/lib/storage";

/**
 * Stable, authorized URL for note images (what the Markdown stores). Access is granted to
 * the owner of the note, or to anyone holding its (valid, unlocked) public share token.
 * The bucket stays private; we redirect to a 60-second presigned URL.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ noteId: string; name: string }> }) {
  const { noteId, name } = await params;
  const notFound = () => new NextResponse("Not found", { status: 404 });
  if (!storageEnabled() || !z.string().uuid().safeParse(noteId).success || !FILE_NAME_RE.test(name)) return notFound();

  const token = req.nextUrl.searchParams.get("t");
  let allowed = false;
  if (token) {
    // Public link: valid, unexpired, unlocked (if password protected), and it must be this note's link.
    const n = await getPublicNote(token);
    allowed = !!n && n.id === noteId && (await isUnlocked(token, n.sharePasswordHash));
  }
  if (!allowed) {
    const user = await getSessionUser();
    allowed = !!user && !!(await getAccess(noteId, user.id));
  }
  if (!allowed) return notFound();

  const url = await presignDownload(noteKey(noteId, name));
  return NextResponse.redirect(url, { status: 302, headers: { "Cache-Control": "private, max-age=30" } });
}
