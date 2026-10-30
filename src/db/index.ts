import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const g = globalThis as unknown as { __db?: ReturnType<typeof create> };

function create() {
  // Neon's serverless driver talks HTTPS (443), so it works behind firewalls that block 5432
  // and on serverless runtimes. Prefer the pooled URL at runtime.
  const url = process.env.DATABASE_URL_POOLED ?? process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return drizzle(neon(url), { schema });
}

/** Lazy so `next build` works without DATABASE_URL; cached across HMR reloads. */
export function db() {
  return (g.__db ??= create());
}
