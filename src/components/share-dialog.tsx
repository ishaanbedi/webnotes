"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { regeneratePublicLink, setPublicLink, updateShareSettings } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { Dialog } from "./ui";

type Expiry = "never" | "1h" | "1d" | "7d" | "30d";

const field = "h-9 rounded-md border bg-background px-3 text-sm outline-none focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/30";

function expiryLabel(iso: string | null) {
  if (!iso) return "Never expires";
  const d = new Date(iso);
  if (d.getTime() <= Date.now()) return "Expired";
  return `Expires ${d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}`;
}

export function ShareDialog({
  open, onClose, noteId, initialToken, initialExpiresAt, initialHasPassword,
}: {
  open: boolean; onClose: () => void; noteId: string;
  initialToken: string | null; initialExpiresAt: string | null; initialHasPassword: boolean;
}) {
  const [token, setToken] = useState(initialToken);
  const [expiresAt, setExpiresAt] = useState(initialExpiresAt);
  const [hasPassword, setHasPassword] = useState(initialHasPassword);
  const [password, setPassword] = useState("");
  const [pending, start] = useTransition();
  const [origin, setOrigin] = useState("");

  useEffect(() => setOrigin(process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || window.location.origin), []);
  useEffect(() => { setToken(initialToken); setExpiresAt(initialExpiresAt); setHasPassword(initialHasPassword); }, [initialToken, initialExpiresAt, initialHasPassword]);

  const url = token ? `${origin}/s/${token}` : "";

  const togglePublic = () =>
    start(async () => {
      const res = await setPublicLink(noteId, !token);
      if (!res.ok) return void toast.error(res.error);
      setToken(res.token);
      if (!res.token) { setExpiresAt(null); setHasPassword(false); setPassword(""); }
    });

  const regenerate = () =>
    start(async () => {
      const res = await regeneratePublicLink(noteId);
      if (res.ok) { setToken(res.token); toast.success("New link created. The old one no longer works."); }
      else toast.error(res.error);
    });

  const apply = (input: { expires?: Expiry; password?: string | null }, done?: string) =>
    start(async () => {
      const res = await updateShareSettings(noteId, input);
      if (!res.ok) return void toast.error(res.error);
      setExpiresAt(res.expiresAt);
      setHasPassword(res.hasPassword);
      if (done) toast.success(done);
    });

  return (
    <Dialog open={open} onClose={onClose} title="Share" description="Only people with the link can open this note. They can read it, not edit it.">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium">Anyone with the link</p>
          <p className="text-xs text-muted-foreground">{token ? "The link is on" : "The note is private"}</p>
        </div>
        <button
          role="switch" aria-checked={!!token} aria-label="Share with a link" onClick={togglePublic} disabled={pending}
          className={cn("relative h-6 w-10 rounded-full transition-colors", token ? "bg-foreground" : "bg-input")}
        >
          <span className={cn("absolute top-0.5 left-0.5 size-5 rounded-full bg-background transition-transform", token && "translate-x-4")} />
        </button>
      </div>

      {token && (
        <div className="mt-4 space-y-5">
          <div className="flex gap-2">
            <input readOnly value={url} aria-label="Link" onFocus={(e) => e.currentTarget.select()} className={cn(field, "min-w-0 flex-1 font-mono text-xs")} />
            <button
              className="h-9 rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
              onClick={() => navigator.clipboard.writeText(url).then(() => toast.success("Link copied"), () => toast.error("Couldn't copy"))}
            >
              Copy
            </button>
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <label htmlFor="expiry" className="text-sm font-medium">Link expires</label>
                <p className="text-xs text-muted-foreground">{expiryLabel(expiresAt)}</p>
              </div>
              <select
                id="expiry" disabled={pending} defaultValue="" className={field}
                onChange={(e) => { const v = e.target.value as Expiry; if (v) apply({ expires: v }, v === "never" ? "The link won't expire" : "Expiry set"); e.target.value = ""; }}
              >
                <option value="" disabled>{expiresAt ? "Change" : "Set"}</option>
                <option value="1h">In 1 hour</option>
                <option value="1d">In 1 day</option>
                <option value="7d">In 7 days</option>
                <option value="30d">In 30 days</option>
                {expiresAt && <option value="never">Never</option>}
              </select>
            </div>

            <div>
              <label htmlFor="pw" className="text-sm font-medium">Password</label>
              <p className="text-xs text-muted-foreground">{hasPassword ? "A password is required to open the link" : "Anyone with the link can open it"}</p>
              <form
                className="mt-2 flex gap-2"
                onSubmit={(e) => { e.preventDefault(); apply({ password }, hasPassword ? "Password changed" : "Password set"); setPassword(""); }}
              >
                <input
                  id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder={hasPassword ? "New password" : "Add a password"} minLength={4} maxLength={128}
                  autoComplete="new-password" className={cn(field, "min-w-0 flex-1")}
                />
                <button disabled={pending || password.length < 4} className="h-9 rounded-md border px-3.5 text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-50">
                  {hasPassword ? "Change" : "Set"}
                </button>
                {hasPassword && (
                  <button type="button" disabled={pending} onClick={() => apply({ password: null }, "Password removed")} className="h-9 rounded-md border px-3.5 text-sm font-medium transition-colors hover:bg-secondary">
                    Remove
                  </button>
                )}
              </form>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Reset the link</p>
                <p className="text-xs text-muted-foreground">Makes a new address. The old one stops working.</p>
              </div>
              <button disabled={pending} onClick={regenerate} className="h-9 rounded-md border px-3.5 text-sm font-medium transition-colors hover:bg-secondary">Reset</button>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}
