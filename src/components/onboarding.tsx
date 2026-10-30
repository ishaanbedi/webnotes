"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { NoteEditor } from "./editor/editor";

const kbd = "rounded border bg-secondary px-1.5 py-0.5 font-mono text-xs text-foreground";

function Rows({ rows }: { rows: [React.ReactNode, React.ReactNode][] }) {
  return (
    <dl className="mt-5 divide-y border-y text-sm">
      {rows.map(([term, desc], n) => (
        <div key={n} className="grid gap-1 py-3 sm:grid-cols-[9.5rem_1fr] sm:gap-4">
          <dt className="font-medium">{term}</dt>
          <dd className="text-muted-foreground">{desc}</dd>
        </div>
      ))}
    </dl>
  );
}

const TRY_IT = `Press Enter, then type / to pick a block.

Select these words to format them.`;

type Step = { id: string; title: string; lede: string };

type Props = {
  imagesEnabled: boolean;
  /** Guests have no account yet: sharing and images get a note saying so. */
  guest?: boolean;
  /** Records that the tour was seen (server for accounts, localStorage for guests). */
  onFinish: () => void | Promise<void>;
  /** Used by the last step's "Open the Welcome note". */
  onOpenWelcome: () => void | Promise<void>;
  onClose: () => void;
};

export function Onboarding({ imagesEnabled, guest, onFinish, onOpenWelcome, onClose }: Props) {
  const steps: Step[] = [
    { id: "welcome", title: "Welcome to Webnotes", lede: "A simple place to write. This tour takes about a minute." },
    { id: "write", title: "Write with blocks", lede: "Try it right here. Nothing you type in this box is saved." },
    { id: "organize", title: "Keep things tidy", lede: "Find, pin and tidy up your notes." },
    ...(imagesEnabled ? [{ id: "images", title: "Add images", lede: "Pictures sit inside the note, right where you put them." }] : []),
    { id: "share", title: "Share a note", lede: "Send a link. You decide who can open it, and for how long." },
    { id: "shortcuts", title: "Shortcuts", lede: "A few keys that make writing quicker." },
  ];

  const [i, setI] = useState(0);
  const [pending, start] = useTransition();
  const [mac, setMac] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const step = steps[i];
  const last = i === steps.length - 1;
  const mod = mac ? "⌘" : "Ctrl";

  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform)), []);

  // Focus the dialog, lock page scroll, restore on close.
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, []);

  // Marks onboarding done (also when skipped) and closes straight away.
  const finish = (then?: () => void | Promise<void>) => {
    start(async () => {
      try {
        await onFinish();
      } catch {
        toast.error("Couldn't save your progress. The tour may show again.");
      }
      onClose();
      await then?.();
    });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return void finish();
    if (e.key !== "Tab") return;
    const f = dialog.current?.querySelectorAll<HTMLElement>('button, [href], input, textarea, [contenteditable="true"], [tabindex]:not([tabindex="-1"])');
    if (!f?.length) return;
    const first = f[0], lastEl = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { e.preventDefault(); lastEl.focus(); }
    else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && finish()}>
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className="flex h-[min(42rem,92dvh)] w-full max-w-xl flex-col rounded-t-lg border bg-popover text-popover-foreground outline-none sm:rounded-lg"
      >
        <div className="flex items-center justify-between px-6 pt-5 text-xs text-muted-foreground">
          <span>Step {i + 1} of {steps.length}</span>
          <button onClick={() => finish()} disabled={pending} className="rounded px-1 py-0.5 hover:text-foreground">Skip tour</button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-6 pt-4 pb-6">
          <h2 id="tour-title" className="text-2xl font-semibold tracking-tight">{step.title}</h2>
          <p className="mt-2 text-muted-foreground">{step.lede}</p>

          {step.id === "welcome" && (
            <Rows rows={[
              ["Simple to start", "Make a note and start typing. Everything is formatted as you go."],
              ["Saves for you", guest ? "There is no save button. Your notes stay in this browser until you create an account." : "There is no save button. The status at the top of a note says Saving, then Saved."],
              ["Stays in sync", guest ? "Create an account any time to keep your notes across devices and to share them." : "Changes show up right away in your other tabs."],
            ]} />
          )}

          <div hidden={step.id !== "write"}>
            <div className="mt-5 rounded-lg border bg-background p-4">
              <NoteEditor markdown={TRY_IT} editable compact />
            </div>
            <Rows rows={[
              [<span key="s" className={kbd}>/</span>, "Headings, bullet and numbered lists, to-dos, quotes, code and dividers."],
              ["Select text", "A small toolbar appears: bold, italic, underline, strikethrough, code, highlight and link."],
              ["Quick formatting", <span key="m">Type <span className={kbd}># </span> then a space for a heading, <span className={kbd}>- </span> for a list, <span className={kbd}>[] </span> for a to-do.</span>],
            ]} />
          </div>

          {step.id === "organize" && (
            <Rows rows={[
              ["Icon and title", "Click the icon above a note's title to pick an emoji. Press Enter in the title to jump into the note."],
              ["Favorites", "Star a note to pin it to the top of the sidebar."],
              ["Search", "The box above your notes filters them by title as you type."],
              ["Trash", "Deleted notes wait in Trash. Restore them any time, or empty it for good."],
            ]} />
          )}

          {step.id === "images" && (
            <Rows rows={[
              ...(guest ? ([["Needs an account", "Images are stored on our servers, so you'll be asked to create a free account when you add one."]] as [React.ReactNode, React.ReactNode][]) : []),
              ["Paste or drag", <span key="p">Paste an image or drop it into a note. Or type <span className={kbd}>/image</span> to choose a file.</span>],
              ["Formats", "PNG, JPEG, WebP and GIF, up to 8 MB each."],
              ["Private", "Only you, or people with the note's link, can see the images in it."],
            ]} />
          )}

          {step.id === "share" && (
            <Rows rows={[
              ...(guest ? ([["Needs an account", "A shared note lives on our servers, so you'll be asked to create a free account the first time you share."]] as [React.ReactNode, React.ReactNode][]) : []),
              ["Share button", "Open a note and use Share at the top right."],
              ["Link on or off", "Turn the link on to get an address you can send. Turn it off and the note is private again."],
              ["Read only", "People with the link can read the note. They can't change it."],
              ["Password", "Add a password so only people who know it can open the link."],
              ["Expiry", "Set the link to stop working after an hour, a day, a week or a month."],
              ["Reset the link", "Make a new address if the old one got out. The old link stops working."],
            ]} />
          )}

          {step.id === "shortcuts" && (
            <div className="mt-5 grid gap-x-8 gap-y-2.5 text-sm sm:grid-cols-2">
              {([
                [`${mod} B`, "Bold"],
                [`${mod} I`, "Italic"],
                [`${mod} U`, "Underline"],
                [`${mod} E`, "Inline code"],
                [`${mod} Shift S`, "Strikethrough"],
                [`${mod} Alt 1 / 2 / 3`, "Heading 1 / 2 / 3"],
                [`${mod} Z`, "Undo"],
                [`${mod} Shift Z`, "Redo"],
              ] as const).map(([k, d]) => (
                <div key={d} className="flex items-center justify-between gap-3 border-b pb-2.5">
                  <span className="text-muted-foreground">{d}</span>
                  <span className={kbd}>{k}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex gap-1.5" aria-hidden>
            {steps.map((s, n) => (
              <span key={s.id} className={cn("size-1.5 rounded-full", n === i ? "bg-foreground" : n < i ? "bg-muted-foreground" : "bg-input")} />
            ))}
          </div>
          <div className="flex gap-2">
            {i > 0 && (
              <button onClick={() => setI(i - 1)} disabled={pending} className="h-9 rounded-md border px-3.5 text-sm font-medium hover:bg-secondary">Back</button>
            )}
            {last ? (
              <>
                <button onClick={() => finish()} disabled={pending} className="h-9 rounded-md border px-3.5 text-sm font-medium hover:bg-secondary">Done</button>
                <button onClick={() => finish(onOpenWelcome)} disabled={pending} className="h-9 rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
                  Open the Welcome note
                </button>
              </>
            ) : (
              <button onClick={() => setI(i + 1)} className="h-9 rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground hover:opacity-90">Next</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
