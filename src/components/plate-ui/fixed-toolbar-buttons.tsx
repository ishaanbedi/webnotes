import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/plate-ui/dialog";
import React, { useState } from 'react';
import {
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
} from '@udecode/plate-basic-marks';
import { useEditorReadOnly } from '@udecode/plate-common';
import { MARK_BG_COLOR, MARK_COLOR } from '@udecode/plate-font';
import { ListStyleType } from '@udecode/plate-indent-list';
import { ELEMENT_IMAGE } from '@udecode/plate-media';

import { Icons, iconVariants } from '@/components/icons';
import { AlignDropdownMenu } from '@/components/plate-ui/align-dropdown-menu';
import { ColorDropdownMenu } from '@/components/plate-ui/color-dropdown-menu';
import { EmojiDropdownMenu } from '@/components/plate-ui/emoji-dropdown-menu';
import { IndentListToolbarButton } from '@/components/plate-ui/indent-list-toolbar-button';
import { IndentToolbarButton } from '@/components/plate-ui/indent-toolbar-button';
import { LineHeightDropdownMenu } from '@/components/plate-ui/line-height-dropdown-menu';
import { LinkToolbarButton } from '@/components/plate-ui/link-toolbar-button';
import { MediaToolbarButton } from '@/components/plate-ui/media-toolbar-button';
import { MoreDropdownMenu } from '@/components/plate-ui/more-dropdown-menu';
import { OutdentToolbarButton } from '@/components/plate-ui/outdent-toolbar-button';
import { TableDropdownMenu } from '@/components/plate-ui/table-dropdown-menu';

import { InsertDropdownMenu } from './insert-dropdown-menu';
import { MarkToolbarButton } from './mark-toolbar-button';
import { ToolbarGroup } from './toolbar';
import { TurnIntoDropdownMenu } from './turn-into-dropdown-menu';
import { ThemeToggle } from '../site/theme-toggle';
import { Button } from './button';
import { Share2 } from 'lucide-react';
import axios from "axios";
import Link from "next/link";

export function FixedToolbarButtons(

) {
  const readOnly = useEditorReadOnly();
  const [setButtonLoading, setButtonLoadingState] = useState(false)
  const [gotBackSlug, setGotBackSlug] = useState("")
  const handleShare = async () => {
    setButtonLoadingState(true)
    const note = localStorage.getItem("plateEditorContent")
    const { data } = await axios.post("/api", {
      note: note
    })
    if (data.error) {
      toast.error("An error occured. Please try again.")
      setButtonLoadingState(false)
      return
    }
    setGotBackSlug(data.slug)
    setButtonLoadingState(false)
    toast.success("Link generated.")
  }
  return (
    <div className="w-full overflow-hidden">
      <div
        className="flex flex-wrap"
        style={{
          transform: 'translateX(calc(-1px))',
        }}
      >
        {!readOnly && (
          <>
            <ToolbarGroup noSeparator>
              <InsertDropdownMenu />
              <TurnIntoDropdownMenu />
            </ToolbarGroup>

            <ToolbarGroup>
              <MarkToolbarButton tooltip="Bold (⌘+B)" nodeType={MARK_BOLD}>
                <Icons.bold />
              </MarkToolbarButton>
              <MarkToolbarButton tooltip="Italic (⌘+I)" nodeType={MARK_ITALIC}>
                <Icons.italic />
              </MarkToolbarButton>
              <MarkToolbarButton
                tooltip="Underline (⌘+U)"
                nodeType={MARK_UNDERLINE}
              >
                <Icons.underline />
              </MarkToolbarButton>

              <MarkToolbarButton
                tooltip="Strikethrough (⌘+⇧+M)"
                nodeType={MARK_STRIKETHROUGH}
              >
                <Icons.strikethrough />
              </MarkToolbarButton>
              <MarkToolbarButton tooltip="Code (⌘+E)" nodeType={MARK_CODE}>
                <Icons.code />
              </MarkToolbarButton>
            </ToolbarGroup>

            <ToolbarGroup>
              <ColorDropdownMenu nodeType={MARK_COLOR} tooltip="Text Color">
                <Icons.color className={iconVariants({ variant: 'toolbar' })} />
              </ColorDropdownMenu>
              <ColorDropdownMenu
                nodeType={MARK_BG_COLOR}
                tooltip="Highlight Color"
              >
                <Icons.bg className={iconVariants({ variant: 'toolbar' })} />
              </ColorDropdownMenu>
            </ToolbarGroup>

            <ToolbarGroup>
              <AlignDropdownMenu />

              <LineHeightDropdownMenu />

              <IndentListToolbarButton nodeType={ListStyleType.Disc} />
              <IndentListToolbarButton nodeType={ListStyleType.Decimal} />

              <OutdentToolbarButton />
              <IndentToolbarButton />
            </ToolbarGroup>

            <ToolbarGroup>
              <LinkToolbarButton />

              <MediaToolbarButton nodeType={ELEMENT_IMAGE} />

              <TableDropdownMenu />

              <EmojiDropdownMenu />

              <MoreDropdownMenu />
            </ToolbarGroup>
          </>
        )}

        <div className="grow" />

        <ToolbarGroup noSeparator>
          <ThemeToggle />
          <Dialog>
            <DialogTrigger>
              <Button size={"sm"} variant={"ghost"} onClick={() => {
                setGotBackSlug("")
                setButtonLoadingState(false)
              }}>
                <Share2 size={20} />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Share Webnote
                </DialogTitle>
                <DialogDescription>
                  {gotBackSlug === "" ? (
                    <>By clicking the button below, you agree to our <a href="/legal" target="_blank" className="text-blue-500">legal stuff</a>.</>
                  ) : (
                    <>
                      <p className="text-primary/50">Anyone with this link can view this note.</p>
                    </>
                  )}
                </DialogDescription>
              </DialogHeader>
              <section className="flex flex-col space-y-4">
                <div className="flex flex-row space-x-2 items-center">
                  {gotBackSlug === "" ? (
                    <Button
                      disabled={setButtonLoading}
                      onClick={() => {
                        handleShare()
                      }}>
                      Generate Link
                    </Button>
                  ) : (
                    <div className="">
                      <p>
                        <Link href={`/shared/${gotBackSlug}`} target="_blank" className="text-blue-500">
                          webnotes.vercel.app/shared/{gotBackSlug}
                        </Link>
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() => {
                          toast.success("Copied to clipboard.")
                          navigator.clipboard.writeText(`https://webnotes.vercel.app/shared/${gotBackSlug}`)
                        }}>
                        Copy
                      </Button>
                    </div>
                  )}
                </div>
              </section>
            </DialogContent>
          </Dialog>
        </ToolbarGroup>
      </div>
    </div >
  );
}
