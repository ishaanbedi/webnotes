"use client";

import React, { useRef, useEffect } from 'react';
import { cn } from '@udecode/cn';
import { Plate } from '@udecode/plate-common';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { plugins } from '@/lib/plate/plate-plugins';
import { CursorOverlay } from '@/components/plate-ui/cursor-overlay';
import { Editor } from '@/components/plate-ui/editor';
import { FixedToolbar } from '@/components/plate-ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/components/plate-ui/fixed-toolbar-buttons';
import { FloatingToolbar } from '@/components/plate-ui/floating-toolbar';
import { FloatingToolbarButtons } from '@/components/plate-ui/floating-toolbar-buttons';

const localStorageKey = 'plateEditorContent';

export default function PlateEditor() {
  const containerRef = useRef(null);

  const initialValue = (localStorage.getItem(localStorageKey) === null ? [
    {
      type: ELEMENT_PARAGRAPH,
      children: [{id: "1", type: "h1", children: [{text: "Welcome to Webnotes!", bold: true}]}],
    },
  ] : JSON.parse(localStorage.getItem(localStorageKey) || ''));

  const handleChange = (newValue: any) => {
    localStorage.setItem(localStorageKey, JSON.stringify(newValue));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate plugins={plugins} initialValue={initialValue} onChange={handleChange}>
        <div
          ref={containerRef}
          className={cn(
            // Block selection
            '[&_.slate-start-area-left]:!w-[64px] [&_.slate-start-area-right]:!w-[64px] [&_.slate-start-area-top]:!h-4'
          )}
        >
          <FixedToolbar>
            <FixedToolbarButtons />
          </FixedToolbar>

          <Editor
            className="px-[96px] py-16"
            autoFocus
            focusRing={false}
            variant="ghost"
            size="md"
          />
          <FloatingToolbar>
            <FloatingToolbarButtons />
          </FloatingToolbar>
          <CursorOverlay containerRef={containerRef} />
        </div>
      </Plate>
    </DndProvider>
  );
}
