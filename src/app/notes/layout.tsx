import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { getSessionUser } from "@/lib/auth/server";
import { realtimeEnabled, sealMine } from "@/lib/realtime";
import { GuestWorkspace } from "@/components/guest-workspace";
import { AppShell } from "@/components/app-shell";
import { storageEnabled } from "@/lib/storage";
import { WELCOME_ICON, WELCOME_TITLE, welcomeContent } from "@/lib/welcome";
import { userProfiles } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function NotesLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  // Not signed in: the same app, running on notes stored in this browser.
  if (!user) return <GuestWorkspace />;
  const userId = user.id;
  const cols = { id: notes.id, title: notes.title, icon: notes.icon, isFavorite: notes.isFavorite };

  // First visit: create the profile row and the Welcome note exactly once (the insert only
  // returns a row for whichever request creates the profile).
  let [profile] = await db().select({ onboarded: userProfiles.onboarded }).from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  if (!profile) {
    const created = await db().insert(userProfiles).values({ userId }).onConflictDoNothing().returning({ onboarded: userProfiles.onboarded });
    if (created.length) {
      await db().insert(notes).values({ ownerId: userId, title: WELCOME_TITLE, icon: WELCOME_ICON, content: welcomeContent(true) });
      profile = created[0];
    } else {
      profile = { onboarded: false };
    }
  }

  const mine = await db()
    .select(cols)
    .from(notes)
    .where(and(eq(notes.ownerId, userId), isNull(notes.trashedAt)))
    .orderBy(desc(notes.updatedAt))
    .limit(500);

  const live = realtimeEnabled();
  const sealedMine = live ? await sealMine(userId) : null;

  return (
    <AppShell
      mine={mine}
      sealedMine={sealedMine}
      user={{ name: user.name, email: user.email }}
      onboarded={profile.onboarded}
      imagesEnabled={storageEnabled()}
    >
      {children}
    </AppShell>
  );
}
