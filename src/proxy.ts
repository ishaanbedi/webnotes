import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";

// Neon Auth's middleware refreshes the session cookie, but it also redirects signed-out visitors
// to the sign-in page. /notes is open to guests (they get the local workspace), so swallow that
// redirect and let the request through. Every server action and route still checks the session.
const refresh = auth.middleware({ loginUrl: "/auth" });
const { GET: authGet } = auth.handler();

// Magic links come back as /notes?neon_auth_session_verifier=…. The middleware only exchanges that
// verifier when an OAuth challenge cookie is present, which magic links never set, so do the
// exchange here: get-session with the verifier returns the session cookies.
async function completeMagicLink(req: NextRequest) {
  const url = req.nextUrl.clone();
  const verifier = url.searchParams.get("neon_auth_session_verifier");
  if (!verifier) return null;
  const upstream = new Request(new URL(`/api/auth/get-session?neon_auth_session_verifier=${encodeURIComponent(verifier)}`, url.origin), {
    headers: req.headers,
  });
  const res = await authGet(upstream, { params: Promise.resolve({ path: ["get-session"] }) });
  url.searchParams.delete("neon_auth_session_verifier");
  const out = NextResponse.redirect(url);
  if (!res.ok) return out; // expired or used link: land on /notes signed out
  for (const c of res.headers.getSetCookie()) out.headers.append("set-cookie", c);
  return out;
}

export default async function proxy(req: NextRequest) {
  const done = await completeMagicLink(req);
  if (done) return done;
  const res = await refresh(req);
  const to = res.headers.get("location");
  if (to && new URL(to, req.url).pathname === "/auth") return NextResponse.next();
  return res;
}

export const config = { matcher: ["/notes/:path*"] };
