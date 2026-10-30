"use client";

import { EditorContent, useEditor, useEditorState, type Editor as TiptapEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  Bold, Code, Highlighter, Italic, Link2, Link2Off, Strikethrough, Underline as UnderlineIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createImageUpload } from "@/lib/actions";
import { IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/files";
import { cn } from "@/lib/utils";
import { baseExtensions } from "./extensions";
import { SlashCommand } from "./slash-command";

type Props = {
  markdown: string;
  editable?: boolean;
  onChange?: (markdown: string) => void;
  placeholder?: string;
  /** Enables image uploads (Neon Object Storage) for this note. */
  noteId?: string;
  imagesEnabled?: boolean;
  /** Latest content from Neon Realtime; applied when the local user has no unsaved edits. */
  remote?: string;
  isDirty?: () => boolean;
  /** Embedded sample: no page-sized min height or bottom padding. */
  compact?: boolean;
  /** Guests: called instead of uploading when an image is added (it needs an account). */
  onNeedAccount?: (feature: "images") => void;
};

export function NoteEditor({
  markdown, editable = true, onChange, placeholder = "Type '/' for commands…",
  noteId, imagesEnabled, remote, isDirty, compact, onNeedAccount,
}: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const editorRef = useRef<TiptapEditor | null>(null);
  const lastKnown = useRef(markdown);

  const uploadImage = useCallback(
    async (file: File) => {
      const editor = editorRef.current;
      if (!editor || !noteId) return;
      if (!IMAGE_TYPES[file.type]) return void toast.error("Only PNG, JPEG, WebP or GIF images are supported");
      if (file.size > MAX_IMAGE_BYTES) return void toast.error("Images must be under 8 MB");
      const id = toast.loading("Uploading image…");
      try {
        const res = await createImageUpload(noteId, { type: file.type, size: file.size });
        if (!res.ok) throw new Error(res.error);
        const put = await fetch(res.uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
        if (!put.ok) throw new Error("Upload failed");
        editor.chain().focus().setImage({ src: res.src, alt: file.name.replace(/\.[^.]+$/, "") }).run();
        toast.success("Image added", { id });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed", { id });
      }
    },
    [noteId],
  );

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: [
      ...baseExtensions(editable ? placeholder : undefined),
      ...(editable
        ? [SlashCommand.configure({ onImage: onNeedAccount ? () => onNeedAccount("images") : imagesEnabled ? () => fileInput.current?.click() : undefined })]
        : []),
    ],
    content: markdown,
    contentType: "markdown",
    editorProps: {
      attributes: { spellcheck: "true", "aria-label": "Note content" },
      handlePaste: (_v, e) => {
        const f = (imagesEnabled || onNeedAccount) && Array.from(e.clipboardData?.files ?? []).find((x) => x.type.startsWith("image/"));
        if (!f) return false;
        if (onNeedAccount) onNeedAccount("images");
        else void uploadImage(f);
        return true;
      },
      handleDrop: (_v, e) => {
        const f = (imagesEnabled || onNeedAccount) && Array.from(e.dataTransfer?.files ?? []).find((x) => x.type.startsWith("image/"));
        if (!f) return false;
        e.preventDefault();
        if (onNeedAccount) onNeedAccount("images");
        else void uploadImage(f);
        return true;
      },
    },
    onUpdate: ({ editor }) => {
      const md = editor.getMarkdown();
      lastKnown.current = md;
      onChange?.(md);
    },
  });

  useEffect(() => {
    editorRef.current = editor;
    editor?.setEditable(editable);
  }, [editor, editable]);

  // Apply live changes made elsewhere (other tab / collaborator) without clobbering local typing.
  useEffect(() => {
    if (!editor || remote === undefined || remote === lastKnown.current) return;
    if (isDirty?.()) return;
    const { from } = editor.state.selection;
    editor.commands.setContent(remote, { contentType: "markdown", emitUpdate: false });
    lastKnown.current = remote;
    const max = editor.state.doc.content.size;
    if (editor.isEditable) editor.commands.setTextSelection(Math.min(from, max));
  }, [editor, remote, isDirty]);

  if (!editor) return <div className={compact ? "h-64" : "min-h-[50vh]"} aria-busy />;

  return (
    <div className={cn("note-editor", compact && "note-editor-compact")}>
      {editable && <Toolbar editor={editor} />}
      {editable && imagesEnabled && (
        <input
          ref={fileInput} type="file" accept={Object.keys(IMAGE_TYPES).join(",")} hidden
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadImage(f); e.target.value = ""; }}
        />
      )}
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: TiptapEditor }) {
  // Tiptap v3 doesn't re-render React on every transaction; subscribe to just what we show.
  const active = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      underline: editor.isActive("underline"),
      strike: editor.isActive("strike"),
      code: editor.isActive("code"),
      highlight: editor.isActive("highlight"),
      link: editor.isActive("link"),
    }),
  });

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (url.trim() === "") return void editor.chain().focus().extendMarkRange("link").unsetLink().run();
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const btns: { label: string; icon: typeof Bold; key: keyof typeof active; run: () => void }[] = [
    { label: "Bold", icon: Bold, key: "bold", run: () => editor.chain().focus().toggleBold().run() },
    { label: "Italic", icon: Italic, key: "italic", run: () => editor.chain().focus().toggleItalic().run() },
    { label: "Underline", icon: UnderlineIcon, key: "underline", run: () => editor.chain().focus().toggleUnderline().run() },
    { label: "Strikethrough", icon: Strikethrough, key: "strike", run: () => editor.chain().focus().toggleStrike().run() },
    { label: "Code", icon: Code, key: "code", run: () => editor.chain().focus().toggleCode().run() },
    { label: "Highlight", icon: Highlighter, key: "highlight", run: () => editor.chain().focus().toggleHighlight().run() },
    { label: "Link", icon: Link2, key: "link", run: setLink },
  ];

  const btn = "grid size-8 place-items-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground";

  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: "top", offset: 8 }}
      shouldShow={({ editor, from, to }) => editor.isEditable && from !== to && !editor.isActive("codeBlock")}
    >
      <div className="pop-in flex items-center gap-0.5 rounded-lg border bg-popover p-1">
        {btns.map(({ label, icon: Icon, key, run }) => (
          <button
            key={label} type="button" title={label} aria-label={label} aria-pressed={active[key]}
            onMouseDown={(e) => e.preventDefault()} onClick={run}
            className={cn(btn, active[key] && "bg-accent text-accent-foreground")}
          >
            <Icon className="size-4" />
          </button>
        ))}
        {active.link && (
          <button type="button" title="Remove link" aria-label="Remove link" onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()} className={btn}>
            <Link2Off className="size-4" />
          </button>
        )}
      </div>
    </BubbleMenu>
  );
}
