"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { updateNote } from "@/lib/actions";

export type SaveStatus = "idle" | "saving" | "saved" | "error";
type Patch = { title?: string; icon?: string | null; content?: string };

/** Debounced, serialized autosave: patches are merged and flushed in order, and on tab hide/unmount. */
export function useAutosave(noteId: string, delay = 800) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const pending = useRef<Patch>({});
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const chain = useRef<Promise<void>>(Promise.resolve());
  const inFlight = useRef(0);

  const flush = useCallback(() => {
    clearTimeout(timer.current);
    const patch = pending.current;
    if (!Object.keys(patch).length) return chain.current;
    pending.current = {};
    setStatus("saving");
    inFlight.current++;
    chain.current = chain.current.then(async () => {
      try {
        const res = await updateNote(noteId, patch);
        if (res.ok) {
          setError(null);
          setStatus(Object.keys(pending.current).length ? "saving" : "saved");
        } else {
          setError(res.error);
          pending.current = { ...patch, ...pending.current }; // keep the edit so Retry can resend it
          setStatus("error");
        }
      } catch {
        setError("Couldn't reach the server.");
        pending.current = { ...patch, ...pending.current };
        setStatus("error");
      } finally {
        inFlight.current--;
      }
    });
    return chain.current;
  }, [noteId]);

  const save = useCallback(
    (patch: Patch) => {
      pending.current = { ...pending.current, ...patch };
      setStatus("saving");
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, delay);
    },
    [flush, delay],
  );

  /** True while there are local edits that haven't been confirmed saved. */
  const isDirty = useCallback(() => Object.keys(pending.current).length > 0 || inFlight.current > 0, []);

  useEffect(() => {
    const onHide = () => document.visibilityState === "hidden" && void flush();
    const onUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(pending.current).length) {
        void flush();
        e.preventDefault();
      }
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("beforeunload", onUnload);
      void flush();
    };
  }, [flush]);

  return { save, flush, isDirty, status, error };
}
