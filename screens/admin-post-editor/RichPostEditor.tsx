"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Eraser,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Indent,
  ImageIcon,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  Outdent,
  Palette,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Table,
  Underline,
  Undo2
} from "lucide-react";

type RichPostEditorProps = {
  name: string;
  initialHtml?: string;
  slug: string;
  onStatus?: (message: string) => void;
  onError?: (message: string) => void;
};

function sanitizeEditorHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+=["'][^"']*["']/gi, "")
    .trim();
}

function toolbarButtonLabel(label: string, shortcut?: string) {
  return shortcut ? `${label} (${shortcut})` : label;
}

const fontFamilies = [
  { label: "Default", value: "" },
  { label: "Inter", value: "Inter, Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Merriweather", value: "Merriweather, Georgia, serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Times", value: "'Times New Roman', Times, serif" },
  { label: "Courier", value: "'Courier New', Courier, monospace" }
];

const fontSizes = [
  { label: "12", value: "12px" },
  { label: "14", value: "14px" },
  { label: "16", value: "16px" },
  { label: "18", value: "18px" },
  { label: "20", value: "20px" },
  { label: "24", value: "24px" },
  { label: "32", value: "32px" },
  { label: "40", value: "40px" }
];

export function RichPostEditor({ name, initialHtml, slug, onStatus, onError }: RichPostEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [html, setHtml] = useState(initialHtml || "<p>Write your post content here.</p>");
  const [block, setBlock] = useState("p");
  const [fontFamily, setFontFamily] = useState("");
  const [fontSize, setFontSize] = useState("16px");
  const [textColor, setTextColor] = useState("#292524");
  const [highlightColor, setHighlightColor] = useState("#f2e8e5");
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
    }
  }, [html]);

  function syncHtml() {
    const nextHtml = sanitizeEditorHtml(editorRef.current?.innerHTML || "");
    setHtml(nextHtml);
  }

  function focusEditor() {
    editorRef.current?.focus();
  }

  function command(commandName: string, value?: string) {
    focusEditor();
    document.execCommand(commandName, false, value);
    syncHtml();
  }

  function wrapSelection(style: string) {
    focusEditor();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    const span = document.createElement("span");
    span.setAttribute("style", style);
    try {
      range.surroundContents(span);
    } catch {
      span.appendChild(range.extractContents());
      range.insertNode(span);
    }
    selection.removeAllRanges();
    const nextRange = document.createRange();
    nextRange.selectNodeContents(span);
    selection.addRange(nextRange);
    syncHtml();
  }

  function applyFontFamily(value: string) {
    setFontFamily(value);
    if (!value) return;
    wrapSelection(`font-family: ${value};`);
  }

  function applyFontSize(value: string) {
    setFontSize(value);
    wrapSelection(`font-size: ${value};`);
  }

  function applyTextColor(value: string) {
    setTextColor(value);
    command("foreColor", value);
  }

  function applyHighlightColor(value: string) {
    setHighlightColor(value);
    command("hiliteColor", value);
  }

  function setBlockFormat(value: string) {
    setBlock(value);
    command("formatBlock", value);
  }

  function createLink() {
    const url = window.prompt("Paste link URL");
    if (!url) return;
    command("createLink", url);
  }

  function insertHtml(value: string) {
    focusEditor();
    document.execCommand("insertHTML", false, value);
    syncHtml();
  }

  function insertTable() {
    const rows = Math.min(Math.max(Number(tableRows) || 2, 1), 12);
    const cols = Math.min(Math.max(Number(tableCols) || 2, 1), 8);
    const headerCells = Array.from({ length: cols }, () => "<th>Heading</th>").join("");
    const bodyRows = Array.from({ length: Math.max(rows - 1, 0) }, () => {
      const cells = Array.from({ length: cols }, () => "<td>Cell</td>").join("");
      return `<tr>${cells}</tr>`;
    }).join("");

    insertHtml(`
      <table>
        <tbody>
          <tr>${headerCells}</tr>
          ${bodyRows}
        </tbody>
      </table>
      <p><br></p>
    `);
  }

  function insertQuote() {
    insertHtml("<blockquote>Write a pull quote here.</blockquote><p><br></p>");
  }

  function insertCodeBlock() {
    insertHtml("<pre><code>Paste code here</code></pre><p><br></p>");
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const safeSlug = slug?.trim() || "draft";
    const formData = new FormData();
    formData.set("file", file);
    formData.set("slug", safeSlug);

    setBusy(true);
    onStatus?.("Uploading image to GitHub...");
    onError?.("");

    try {
      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: formData
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not upload image.");

      const alt = window.prompt("Image alt text for SEO", file.name.replace(/\.[^.]+$/, "")) || "";
      insertHtml(`
        <figure>
          <img src="${result.url}" alt="${alt.replace(/"/g, "&quot;")}" />
          <figcaption>Write image caption here</figcaption>
        </figure>
        <p><br></p>
      `);
      onStatus?.("Image uploaded and inserted.");
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Could not upload image.");
      onStatus?.("");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }

  return (
    <div className="rich-editor-shell">
      <input type="hidden" name={name} value={html} />
      <div className="rich-editor-toolbar" aria-label="Post editor toolbar">
        <select
          value={block}
          onChange={(event) => setBlockFormat(event.target.value)}
          className="rich-editor-select"
          aria-label="Text style"
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="pre">Code block</option>
        </select>

        <select
          value={fontFamily}
          onChange={(event) => applyFontFamily(event.target.value)}
          className="rich-editor-select rich-editor-font-select"
          aria-label="Font family"
        >
          {fontFamilies.map((font) => (
            <option key={font.label} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>

        <select
          value={fontSize}
          onChange={(event) => applyFontSize(event.target.value)}
          className="rich-editor-select rich-editor-size-select"
          aria-label="Font size"
        >
          {fontSizes.map((size) => (
            <option key={size.value} value={size.value}>
              {size.label}
            </option>
          ))}
        </select>

        <ToolbarButton label={toolbarButtonLabel("Undo", "Ctrl+Z")} onClick={() => command("undo")}>
          <Undo2 size={16} />
        </ToolbarButton>
        <ToolbarButton label={toolbarButtonLabel("Redo", "Ctrl+Y")} onClick={() => command("redo")}>
          <Redo2 size={16} />
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton label={toolbarButtonLabel("Bold", "Ctrl+B")} onClick={() => command("bold")}>
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton label={toolbarButtonLabel("Italic", "Ctrl+I")} onClick={() => command("italic")}>
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton label={toolbarButtonLabel("Underline", "Ctrl+U")} onClick={() => command("underline")}>
          <Underline size={16} />
        </ToolbarButton>
        <ToolbarButton label="Strike" onClick={() => command("strikeThrough")}>
          <Strikethrough size={16} />
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton label="Heading 1" onClick={() => setBlockFormat("h1")}>
          <Heading1 size={16} />
        </ToolbarButton>
        <ToolbarButton label="Heading 2" onClick={() => setBlockFormat("h2")}>
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton label="Heading 3" onClick={() => setBlockFormat("h3")}>
          <Heading3 size={16} />
        </ToolbarButton>
        <ToolbarButton label="Paragraph" onClick={() => setBlockFormat("p")}>
          <Pilcrow size={16} />
        </ToolbarButton>
        <ToolbarDivider />
        <ColorControl label="Text color" value={textColor} onChange={applyTextColor}>
          <Palette size={16} />
        </ColorControl>
        <ColorControl label="Highlight" value={highlightColor} onChange={applyHighlightColor}>
          <Highlighter size={16} />
        </ColorControl>
        <ToolbarDivider />
        <ToolbarButton label="Align left" onClick={() => command("justifyLeft")}>
          <AlignLeft size={16} />
        </ToolbarButton>
        <ToolbarButton label="Align center" onClick={() => command("justifyCenter")}>
          <AlignCenter size={16} />
        </ToolbarButton>
        <ToolbarButton label="Align right" onClick={() => command("justifyRight")}>
          <AlignRight size={16} />
        </ToolbarButton>
        <ToolbarButton label="Justify" onClick={() => command("justifyFull")}>
          <AlignJustify size={16} />
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton label="Bullet list" onClick={() => command("insertUnorderedList")}>
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton label="Numbered list" onClick={() => command("insertOrderedList")}>
          <ListOrdered size={16} />
        </ToolbarButton>
        <ToolbarButton label="Outdent" onClick={() => command("outdent")}>
          <Outdent size={16} />
        </ToolbarButton>
        <ToolbarButton label="Indent" onClick={() => command("indent")}>
          <Indent size={16} />
        </ToolbarButton>
        <ToolbarButton label="Quote" onClick={insertQuote}>
          <Quote size={16} />
        </ToolbarButton>
        <ToolbarButton label="Code block" onClick={insertCodeBlock}>
          <Code size={16} />
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton label="Link" onClick={createLink}>
          <Link size={16} />
        </ToolbarButton>
        <ToolbarButton label="Horizontal rule" onClick={() => command("insertHorizontalRule")}>
          <Minus size={16} />
        </ToolbarButton>
        <div className="rich-editor-table-controls" aria-label="Table size">
          <input
            type="number"
            min={1}
            max={12}
            value={tableRows}
            onChange={(event) => setTableRows(Number(event.target.value))}
            aria-label="Table rows"
          />
          <span>x</span>
          <input
            type="number"
            min={1}
            max={8}
            value={tableCols}
            onChange={(event) => setTableCols(Number(event.target.value))}
            aria-label="Table columns"
          />
        </div>
        <ToolbarButton label="Table" onClick={insertTable}>
          <Table size={16} />
        </ToolbarButton>
        <ToolbarButton label="Upload image" onClick={() => fileInputRef.current?.click()} disabled={busy}>
          <ImageIcon size={16} />
        </ToolbarButton>
        <ToolbarButton label="Clear formatting" onClick={() => command("removeFormat")}>
          <Eraser size={16} />
        </ToolbarButton>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={uploadImage} />
      </div>

      <div
        ref={editorRef}
        className="rich-editor-canvas"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label="Post content"
        onInput={syncHtml}
        onBlur={syncHtml}
      />

      <details className="rich-editor-source">
        <summary>HTML source</summary>
        <textarea
          value={html}
          onChange={(event) => setHtml(event.target.value)}
          rows={10}
          className="mt-3 w-full rounded-xl border border-stone-300 px-4 py-3 font-mono text-sm"
        />
      </details>
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  disabled,
  children
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className="rich-editor-button"
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="rich-editor-divider" aria-hidden="true" />;
}

function ColorControl({
  label,
  value,
  onChange,
  children
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="rich-editor-color" title={label} aria-label={label}>
      {children}
      <input
        type="color"
        value={value}
        onMouseDown={(event) => event.preventDefault()}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
