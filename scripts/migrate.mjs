// Applies ./drizzle/*.sql over Neon's HTTPS driver (no port 5432 needed).
// Usage: npm run db:migrate   (reads .env.local)
import { neon } from "@neondatabase/serverless";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");
const sql = neon(url);

await sql.query(`CREATE TABLE IF NOT EXISTS public._migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`);
const done = new Set((await sql.query(`SELECT name FROM public._migrations`)).map((r) => r.name));

const dir = "drizzle";
const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
for (const f of files) {
  if (done.has(f)) continue;
  const stmts = (await readFile(join(dir, f), "utf8")).split("--> statement-breakpoint").map((s) => s.trim()).filter(Boolean);
  // One atomic batch per migration file.
  await sql.transaction([...stmts.map((s) => sql.query(s)), sql.query(`INSERT INTO public._migrations (name) VALUES ('${f}')`)]);
  console.log("applied", f);
}
console.log(files.length ? "database is up to date" : "no migrations found");
