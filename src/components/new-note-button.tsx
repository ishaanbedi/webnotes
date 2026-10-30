"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

/** Submit button for the createNote form: disabled while creating, so a double click can't make two notes. */
export function NewNoteButton({ className }: { className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className={cn("flex items-center justify-center gap-2 bg-primary font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-60", className)}>
      {pending && <Loader2 className="size-4 animate-spin" />} New note
    </button>
  );
}
