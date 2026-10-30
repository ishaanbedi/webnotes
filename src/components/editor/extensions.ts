import { Markdown } from "@tiptap/markdown";
import Image from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Placeholder from "@tiptap/extension-placeholder";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);

export function baseExtensions(placeholder?: string) {
  return [
    StarterKit.configure({
      codeBlock: false,
      link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" } },
    }),
    CodeBlockLowlight.configure({ lowlight }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Highlight,
    Image.configure({ allowBase64: false }),
    Markdown,
    ...(placeholder
      ? [Placeholder.configure({ placeholder: ({ node }) => (node.type.name === "heading" ? "Heading" : placeholder) })]
      : []),
  ];
}
