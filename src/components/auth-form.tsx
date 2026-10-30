"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth/client";

const field =
  "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/30";

/**
 * The only auth page. Neon Auth emails the link with its built-in mailer; clicking it signs an
 * existing user in, or creates the account the first time.
 */
export function AuthForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const addr = email.trim().toLowerCase();
    if (!addr || busy || cooldown > 0) return;
    setBusy(true);
    setError(null);
    try {
      const { error } = await authClient.signIn.magicLink({ email: addr, callbackURL: "/notes" });
      if (error) setError(error.message || "Couldn't send the link. Try again.");
      else { setSent(addr); setCooldown(30); }
    } catch {
      setError("Couldn't send the link. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <Link href="/" className="mb-10 block font-semibold tracking-tight">Webnotes</Link>

      {sent ? (
        <div role="status">
          <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We sent a link to <span className="font-medium text-foreground">{sent}</span>. Open it on this device to continue.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">Nothing there? Check your spam folder.</p>
          <div className="mt-5 flex gap-2">
            <button onClick={() => send()} disabled={busy || cooldown > 0} className="h-9 rounded-md border px-3.5 text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-50">
              {cooldown > 0 ? `Send again in ${cooldown}s` : "Send again"}
            </button>
            <button onClick={() => { setSent(null); setError(null); }} className="h-9 rounded-md px-3.5 text-sm text-muted-foreground transition-colors hover:text-foreground">Use a different email</button>
          </div>
          {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">Sign in to Webnotes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your email and we'll send you a link. New here? We'll create your account. No password needed.
          </p>
          <form onSubmit={send} className="mt-6 space-y-3">
            <input
              type="email" inputMode="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Email" aria-label="Email" autoComplete="email" autoCapitalize="none" autoCorrect="off" enterKeyHint="send" className={field}
            />
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <button disabled={busy} className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-60">
              {busy && <Loader2 className="size-4 animate-spin" />} Email me a link
            </button>
          </form>
        </>
      )}

    </div>
  );
}
