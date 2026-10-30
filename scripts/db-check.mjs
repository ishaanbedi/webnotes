// Read-only check over HTTPS (port 443): node --env-file=.env.local scripts/db-check-http.mjs
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
const t0 = Date.now();
try {
  const sql = neon(url);
  const [r] = await sql`select current_database() as db`;
  const t = await sql`select table_schema||'.'||table_name as t from information_schema.tables where table_schema in ('public','neon_auth') order by 1`;
  console.log("HTTP OK in", Date.now() - t0, "ms", r.db, "| tables:", t.map((x) => x.t).join(", ") || "(none)");
  const c = await sql`select column_name from information_schema.columns where table_schema='neon_auth' and table_name='user' order by ordinal_position`;
  console.log("neon_auth.user columns:", c.map((x) => x.column_name).join(", ") || "(none)");
} catch (e) { console.log("HTTP FAIL after", Date.now() - t0, "ms:", e.message, e.sourceError?.message ?? ""); }
