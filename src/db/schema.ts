import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Neon Auth user id of the owner (`neon_auth.user.id`, stored as text). */
    ownerId: text("owner_id").notNull(),
    title: text("title").notNull().default(""),
    icon: text("icon"),
    /** Markdown source of truth. */
    content: text("content").notNull().default(""),
    isFavorite: boolean("is_favorite").notNull().default(false),
    trashedAt: timestamp("trashed_at", { withTimezone: true }),
    /** Unguessable capability token for the public read-only link; null = not shared. */
    shareToken: text("share_token").unique(),
    /** Optional link expiry; null = never. */
    shareExpiresAt: timestamp("share_expires_at", { withTimezone: true }),
    /** Optional scrypt hash (`salt:hash`) required to open the public link. */
    sharePasswordHash: text("share_password_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("notes_owner_idx").on(t.ownerId, t.updatedAt)],
);

/**
 * App-owned per-user data. Neon Auth's `neon_auth.user` table is managed by Neon, so the
 * onboarding flag lives here, keyed by the same user id. No row means a brand-new user.
 */
export const userProfiles = pgTable("user_profiles", {
  userId: text("user_id").primaryKey(),
  onboarded: boolean("onboarded").notNull().default(false),
  onboardedAt: timestamp("onboarded_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Note = typeof notes.$inferSelect;
