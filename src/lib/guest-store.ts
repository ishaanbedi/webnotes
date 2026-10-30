// Local-only notes for people who haven't made an account. Lives in localStorage; nothing
// here touches the server until the user signs up and chooses to import.

import { WELCOME_ICON, WELCOME_TITLE, welcomeContent } from "./welcome";

export type GuestNote = {
  id: string;
  title: string;
  icon: string | null;
  content: string;
  isFavorite: boolean;
  trashedAt: number | null;
  updatedAt: number;
};

export const GUEST_KEY = "webnotes:guest:v1";
export const GUEST_TOUR_KEY = "webnotes:guest:toured";
export const MAX_GUEST_NOTES = 100;
export const MAX_GUEST_CHARS = 200_000;

const SAMPLES: Pick<GuestNote, "id" | "title" | "icon" | "content">[] = [
  { id: "sample-welcome", title: WELCOME_TITLE, icon: WELCOME_ICON, content: welcomeContent(false) },
];

export function defaultGuestNotes(): GuestNote[] {
  const now = Date.now();
  return SAMPLES.map((s, i) => ({ ...s, isFavorite: false, trashedAt: null, updatedAt: now - i }));
}

export function newGuestNote(): GuestNote {
  return { id: crypto.randomUUID(), title: "", icon: null, content: "", isFavorite: false, trashedAt: null, updatedAt: Date.now() };
}

export type GuestState = { notes: GuestNote[]; active: string };

export function loadGuest(): GuestState | null {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as { notes?: Partial<GuestNote>[]; active?: string };
    const notes: GuestNote[] = (d.notes ?? [])
      .filter((n) => n && typeof n.id === "string" && typeof n.title === "string" && typeof n.content === "string")
      .slice(0, MAX_GUEST_NOTES)
      .map((n) => ({
        id: n.id!,
        title: n.title!,
        icon: typeof n.icon === "string" ? n.icon : null,
        content: n.content!,
        isFavorite: !!n.isFavorite,
        trashedAt: typeof n.trashedAt === "number" ? n.trashedAt : null,
        updatedAt: typeof n.updatedAt === "number" ? n.updatedAt : Date.now(),
      }));
    if (!notes.length) return null;
    const live = notes.filter((n) => !n.trashedAt);
    const active = notes.some((n) => n.id === d.active && !n.trashedAt) ? d.active! : (live[0]?.id ?? notes[0].id);
    return { notes, active };
  } catch {
    return null;
  }
}

/** Returns false when storage is blocked or full, so the UI can say so. */
export function saveGuest(state: GuestState): boolean {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

/** Notes worth importing: not trashed, and not an untouched starter sample. */
export function importableNotes(notes: GuestNote[]) {
  const samples = new Map(SAMPLES.map((s) => [s.id, s]));
  return notes.filter((n) => {
    if (n.trashedAt) return false;
    const s = samples.get(n.id);
    if (s && s.title === n.title && s.content === n.content) return false;
    return n.title.trim() !== "" || n.content.trim() !== "";
  });
}
