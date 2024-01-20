"use client";

import React, { useRef, useState } from 'react';
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

const lsKey = 'plateEditorContent';

export default function PlateEditor() {
  const containerRef = useRef(null);
  const [initialValue, setInitialValue] = useState(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(lsKey);
    return saved ? JSON.parse(saved) : [{ type: ELEMENT_PARAGRAPH, children: [{ text: '' }] }];
  }
  );

  const handleChange = (newValue : any) => {
    const content = JSON.stringify(newValue);
    localStorage.setItem(lsKey, content);

  }
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
