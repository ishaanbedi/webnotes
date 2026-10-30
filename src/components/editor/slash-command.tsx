"use client";

import { Extension, type Editor, type Range } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion, { type SuggestionKeyDownProps, type SuggestionProps } from "@tiptap/suggestion";
import {
  Code2, Heading1, ImageIcon, Heading2, Heading3, List, ListChecks, ListOrdered, Minus, Quote, Type,
  type LucideIcon,
} from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { cn } from "@/lib/utils";

type Opts = { onImage?: () => void };
type Item = { title: string; hint: string; keywords: string; icon: LucideIcon; run: (c: { editor: Editor; range: Range }, o: Opts) => void };

const items: Item[] = [
  { title: "Text", hint: "Plain paragraph", keywords: "paragraph p", icon: Type, run: ({ editor, range }) => editor.chain().focus().deleteRange(range).setParagraph().run() },
  { title: "Heading 1", hint: "Big section heading", keywords: "h1 title", icon: Heading1, run: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run() },
  { title: "Heading 2", hint: "Medium section heading", keywords: "h2 subtitle", icon: Heading2, run: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run() },
  { title: "Heading 3", hint: "Small section heading", keywords: "h3", icon: Heading3, run: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run() },
  { title: "Bulleted list", hint: "Simple bullet points", keywords: "ul unordered", icon: List, run: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBulletList().run() },
  { title: "Numbered list", hint: "Ordered list", keywords: "ol ordered", icon: ListOrdered, run: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleOrderedList().run() },
  { title: "To-do list", hint: "Track tasks with checkboxes", keywords: "task checkbox todo", icon: ListChecks, run: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleTaskList().run() },
  { title: "Quote", hint: "Capture a quote", keywords: "blockquote", icon: Quote, run: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBlockquote().run() },
  { title: "Code block", hint: "Syntax-highlighted code", keywords: "pre snippet", icon: Code2, run: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run() },
  { title: "Image", hint: "Upload a picture", keywords: "photo picture upload img", icon: ImageIcon, run: ({ editor, range }, o) => { editor.chain().focus().deleteRange(range).run(); o.onImage?.(); } },
  { title: "Divider", hint: "Visually separate sections", keywords: "hr rule line", icon: Minus, run: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHorizontalRule().run() },
];

type MenuHandle = { onKeyDown: (p: SuggestionKeyDownProps) => boolean };

const SlashMenu = forwardRef<MenuHandle, SuggestionProps<Item, Item>>(function SlashMenu(props, ref) {
  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [props.items]);
  useEffect(() => {
    document.getElementById(`slash-item-${index}`)?.scrollIntoView({ block: "nearest" });
  }, [index]);

  const select = (i: number) => {
    const item = props.items[i];
    if (item) props.command(item);
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      const n = props.items.length;
      if (!n) return false;
      if (event.key === "ArrowDown") { setIndex((i) => (i + 1) % n); return true; }
      if (event.key === "ArrowUp") { setIndex((i) => (i - 1 + n) % n); return true; }
      if (event.key === "Enter") { select(index); return true; }
      return false;
    },
  }));

  if (!props.items.length)
    return <div className="pop-in w-64 rounded-lg border bg-popover p-3 text-sm text-muted-foreground">No results</div>;

  return (
    <div role="listbox" className="pop-in max-h-80 w-64 overflow-y-auto overscroll-contain rounded-lg border bg-popover p-1">
      {props.items.map((item, i) => (
        <button
          key={item.title}
          id={`slash-item-${i}`}
          role="option"
          aria-selected={i === index}
          onMouseEnter={() => setIndex(i)}
          onMouseDown={(e) => { e.preventDefault(); select(i); }}
          className={cn("flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left", i === index && "bg-accent")}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-md border bg-background"><item.icon className="size-4" /></span>
          <span className="min-w-0">
            <span className="block text-sm font-medium">{item.title}</span>
            <span className="block truncate text-xs text-muted-foreground">{item.hint}</span>
          </span>
        </button>
      ))}
    </div>
  );
});

export const SlashCommand = Extension.create<Opts>({
  name: "slashCommand",
  addOptions() {
    return {};
  },
  addProseMirrorPlugins() {
    const opts = this.options;
    return [
      Suggestion<Item, Item>({
        editor: this.editor,
        char: "/",
        command: ({ editor, range, props }) => props.run({ editor, range }, opts),
        items: ({ query }) => {
          const q = query.toLowerCase();
          return items.filter(
            (i) => (opts.onImage || i.title !== "Image") && `${i.title} ${i.keywords}`.toLowerCase().includes(q),
          );
        },
        render: () => {
          let component: ReactRenderer<MenuHandle, SuggestionProps<Item, Item>> | null = null;
          const place = (props: SuggestionProps<Item, Item>) => {
            const rect = props.clientRect?.();
            if (!rect || !component) return;
            const el = component.element as HTMLElement;
            const below = rect.bottom + 8;
            const flip = below + 330 > window.innerHeight && rect.top > 340;
            el.style.position = "fixed";
            el.style.zIndex = "200";
            el.style.left = `${Math.min(rect.left, window.innerWidth - 270)}px`;
            el.style.top = flip ? `${rect.top - 8}px` : `${below}px`;
            el.style.transform = flip ? "translateY(-100%)" : "";
          };
          return {
            onStart: (props) => {
              component = new ReactRenderer(SlashMenu, { props, editor: props.editor });
              document.body.appendChild(component.element);
              place(props);
            },
            onUpdate: (props) => { component?.updateProps(props); place(props); },
            onKeyDown: (props) => {
              if (props.event.key === "Escape") { component?.destroy(); component?.element.remove(); component = null; return true; }
              return component?.ref?.onKeyDown(props) ?? false;
            },
            onExit: () => { component?.element.remove(); component?.destroy(); component = null; },
          };
        },
      }),
    ];
  },
});
