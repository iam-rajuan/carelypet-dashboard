"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  RemoveFormatting,
} from "lucide-react";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function RichTextEditor({
  value,
  onChange,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const applyCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
  };

  const handleLink = () => {
    const url = window.prompt("Enter a URL");
    if (!url) return;
    applyCommand("createLink", url);
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    onChange(editorRef.current.innerHTML);
  };

  const handleToolbarMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <div className="border border-gray-200 rounded-2xl bg-white shadow-sm">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b border-gray-200 bg-white px-4 py-2">
        <button
          type="button"
          onMouseDown={(event) => {
            handleToolbarMouseDown(event);
            applyCommand("bold");
          }}
          className="p-2 rounded-lg hover:bg-gray-100"
          aria-label="Bold"
        >
          <Bold className="h-4 w-4 text-gray-700" />
        </button>
        <button
          type="button"
          onMouseDown={(event) => {
            handleToolbarMouseDown(event);
            applyCommand("italic");
          }}
          className="p-2 rounded-lg hover:bg-gray-100"
          aria-label="Italic"
        >
          <Italic className="h-4 w-4 text-gray-700" />
        </button>
        <button
          type="button"
          onMouseDown={(event) => {
            handleToolbarMouseDown(event);
            applyCommand("underline");
          }}
          className="p-2 rounded-lg hover:bg-gray-100"
          aria-label="Underline"
        >
          <Underline className="h-4 w-4 text-gray-700" />
        </button>
        <span className="h-5 w-px bg-gray-200" />
        <button
          type="button"
          onMouseDown={(event) => {
            handleToolbarMouseDown(event);
            applyCommand("formatBlock", "H1");
          }}
          className="px-2 py-1 text-sm font-semibold text-gray-600 rounded-lg hover:bg-gray-100"
          aria-label="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onMouseDown={(event) => {
            handleToolbarMouseDown(event);
            applyCommand("formatBlock", "H2");
          }}
          className="px-2 py-1 text-sm font-semibold text-gray-600 rounded-lg hover:bg-gray-100"
          aria-label="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onMouseDown={(event) => {
            handleToolbarMouseDown(event);
            applyCommand("formatBlock", "H3");
          }}
          className="px-2 py-1 text-sm font-semibold text-gray-600 rounded-lg hover:bg-gray-100"
          aria-label="Heading 3"
        >
          H3
        </button>
        <button
          type="button"
          onMouseDown={(event) => {
            handleToolbarMouseDown(event);
            applyCommand("formatBlock", "P");
          }}
          className="px-2 py-1 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
          aria-label="Paragraph"
        >
          P
        </button>
        <span className="h-5 w-px bg-gray-200" />
        <button
          type="button"
          onMouseDown={(event) => {
            handleToolbarMouseDown(event);
            applyCommand("insertUnorderedList");
          }}
          className="p-2 rounded-lg hover:bg-gray-100"
          aria-label="Bullet list"
        >
          <List className="h-4 w-4 text-gray-700" />
        </button>
        <button
          type="button"
          onMouseDown={(event) => {
            handleToolbarMouseDown(event);
            applyCommand("insertOrderedList");
          }}
          className="p-2 rounded-lg hover:bg-gray-100"
          aria-label="Numbered list"
        >
          <ListOrdered className="h-4 w-4 text-gray-700" />
        </button>
        <span className="h-5 w-px bg-gray-200" />
        <button
          type="button"
          onMouseDown={(event) => {
            handleToolbarMouseDown(event);
            handleLink();
          }}
          className="p-2 rounded-lg hover:bg-gray-100"
          aria-label="Insert link"
        >
          <Link2 className="h-4 w-4 text-gray-700" />
        </button>
        <button
          type="button"
          onMouseDown={(event) => {
            handleToolbarMouseDown(event);
            applyCommand("removeFormat");
          }}
          className="p-2 rounded-lg hover:bg-gray-100"
          aria-label="Clear formatting"
        >
          <RemoveFormatting className="h-4 w-4 text-gray-700" />
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className="min-h-[360px] px-5 py-4 text-gray-800 focus:outline-none [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold"
      />
    </div>
  );
}
