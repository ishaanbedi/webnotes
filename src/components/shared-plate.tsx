"use client";

import React, { useRef } from 'react';
import { cn } from '@udecode/cn';
import { Plate } from '@udecode/plate-common';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { plugins } from '@/lib/plate/plate-plugins';
import { CursorOverlay } from '@/components/plate-ui/cursor-overlay';
import { Editor } from '@/components/plate-ui/editor';

export default function SharedPlate(
  { note }: { note: string }
) {
  const containerRef = useRef(null);
  return (
    <DndProvider backend={HTML5Backend}>
      <Plate plugins={plugins} initialValue={
        JSON.parse(note)
      }>
        <div
          ref={containerRef}
          className={cn(
            // Block selection
            '[&_.slate-start-area-left]:!w-[64px] [&_.slate-start-area-right]:!w-[64px] [&_.slate-start-area-top]:!h-4'
          )}
        >
          <div
          >
            <Editor
              readOnly
              className="px-[96px] py-16"
              autoFocus
              focusRing={false}
              variant="ghost"
              size="md"
            />
          </div>
          <CursorOverlay containerRef={containerRef} />
        </div>
      </Plate>
    </DndProvider>
  );
}
