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
  Trash2,
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

type ResizeDirection = "e" | "w" | "se" | "sw";
type ResizePointerEvent = React.PointerEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>;

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

  const [selectedTarget, setSelectedTarget] = useState<HTMLElement | null>(null);
  const [overlayPos, setOverlayPos] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [currentWidthPct, setCurrentWidthPct] = useState<number>(100);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
    }
  }, [html]);

  useEffect(() => {
    if (!editorRef.current) return;
    const canvas = editorRef.current;
    const preventNativeDrag = (e: DragEvent) => {
      if ((e.target as HTMLElement).tagName === "IMG") {
        e.preventDefault();
      }
    };
    canvas.addEventListener("dragstart", preventNativeDrag);
    return () => canvas.removeEventListener("dragstart", preventNativeDrag);
  }, []);

  function syncHtml() {
    const nextHtml = sanitizeEditorHtml(editorRef.current?.innerHTML || "");
    setHtml(nextHtml);
  }

  function focusEditor() {
    editorRef.current?.focus();
  }

  function getElementWidthPercent(elem: HTMLElement): number {
    if (elem.style.width && elem.style.width.endsWith("%")) {
      return parseInt(elem.style.width, 10);
    }
    if (editorRef.current) {
      const containerW = editorRef.current.clientWidth || 600;
      const elemW = elem.getBoundingClientRect().width;
      return Math.round((elemW / containerW) * 100);
    }
    return 100;
  }

  function updateOverlay(elem?: HTMLElement | null) {
    const target = elem !== undefined ? elem : selectedTarget;
    const wrapper = editorRef.current?.parentElement;
    if (!target || !wrapper) {
      setOverlayPos(null);
      return;
    }
    const targetRect = target.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    setOverlayPos({
      top: targetRect.top - wrapperRect.top + wrapper.scrollTop,
      left: targetRect.left - wrapperRect.left + wrapper.scrollLeft,
      width: targetRect.width,
      height: targetRect.height
    });
  }

  function getImageTarget(clicked: HTMLElement) {
    const image = clicked.tagName === "IMG" ? clicked : clicked.closest("img");
    if (!image) return null;

    const figure = image.closest("figure");
    if (figure) return figure as HTMLElement;

    const parent = image.parentElement;
    if (parent && parent !== editorRef.current && parent.children.length <= 2 && parent.querySelector("img")) {
      return parent;
    }

    return image as HTMLElement;
  }

  function handleCanvasClick(e: React.MouseEvent<HTMLDivElement>) {
    const clicked = e.target as HTMLElement;
    const imageTarget = getImageTarget(clicked);
    if (imageTarget) {
      setSelectedTarget(imageTarget);
      setCurrentWidthPct(getElementWidthPercent(imageTarget));
      updateOverlay(imageTarget);
    } else {
      setSelectedTarget(null);
      setOverlayPos(null);
    }
  }

  useEffect(() => {
    if (!selectedTarget) return;
    function handleScrollOrResize() {
      updateOverlay();
    }
    window.addEventListener("resize", handleScrollOrResize);
    const contentWrapper = editorRef.current?.parentElement;
    contentWrapper?.addEventListener("scroll", handleScrollOrResize);
    return () => {
      window.removeEventListener("resize", handleScrollOrResize);
      contentWrapper?.removeEventListener("scroll", handleScrollOrResize);
    };
  }, [selectedTarget]);

  function applyAlignment(mode: "left" | "center" | "right" | "float-left" | "float-right") {
    if (!selectedTarget) return;
    selectedTarget.style.float = "none";
    selectedTarget.style.display = "block";
    selectedTarget.style.clear = "";
    selectedTarget.style.marginTop = selectedTarget.style.marginTop || "1.5rem";
    selectedTarget.style.marginBottom = selectedTarget.style.marginBottom || "1rem";

    if (mode === "center") {
      selectedTarget.style.marginLeft = "auto";
      selectedTarget.style.marginRight = "auto";
    } else if (mode === "left") {
      selectedTarget.style.marginLeft = "0";
      selectedTarget.style.marginRight = "auto";
    } else if (mode === "right") {
      selectedTarget.style.marginLeft = "auto";
      selectedTarget.style.marginRight = "0";
    } else if (mode === "float-left") {
      selectedTarget.style.float = "left";
      selectedTarget.style.display = "inline-block";
      selectedTarget.style.marginRight = "1.5rem";
      selectedTarget.style.marginBottom = "1rem";
      selectedTarget.style.marginTop = "0.5rem";
      selectedTarget.style.marginLeft = "0";
    } else if (mode === "float-right") {
      selectedTarget.style.float = "right";
      selectedTarget.style.display = "inline-block";
      selectedTarget.style.marginLeft = "1.5rem";
      selectedTarget.style.marginBottom = "1rem";
      selectedTarget.style.marginTop = "0.5rem";
      selectedTarget.style.marginRight = "0";
    }
    syncHtml();
    setTimeout(() => updateOverlay(), 50);
  }

  function setImageWidth(target: HTMLElement, pct: number) {
    const boundedPct = Math.min(100, Math.max(10, pct));
    target.style.width = `${boundedPct}%`;
    target.style.maxWidth = "100%";
    setCurrentWidthPct(boundedPct);

    const innerImg = target.tagName.toLowerCase() === "img" ? target : target.querySelector("img");
    if (innerImg) {
      (innerImg as HTMLElement).style.width = "100%";
      (innerImg as HTMLElement).style.height = "auto";
      (innerImg as HTMLElement).style.maxWidth = "100%";
      (innerImg as HTMLElement).style.display = "block";
    }
  }

  function applyWidthPercent(pct: number) {
    if (!selectedTarget) return;
    setImageWidth(selectedTarget, pct);
    syncHtml();
    setTimeout(() => updateOverlay(), 50);
  }

  function deleteSelectedImage() {
    if (!selectedTarget) return;
    selectedTarget.remove();
    setSelectedTarget(null);
    setOverlayPos(null);
    syncHtml();
  }

  function startResize(e: ResizePointerEvent, direction: ResizeDirection) {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedTarget || !editorRef.current) return;

    const target = selectedTarget;
    const handle = e.currentTarget;
    const startX = e.clientX;
    const containerWidth = editorRef.current.clientWidth || 600;
    const startWidthPx = target.getBoundingClientRect().width;
    document.body.style.userSelect = "none";
    document.body.style.cursor = direction.includes("w") || direction.includes("e") ? "ew-resize" : "se-resize";

    if ("pointerId" in e) {
      try {
        handle.setPointerCapture?.(e.pointerId);
      } catch {
        // Window listeners below keep resize working if pointer capture is unavailable.
      }
    }

    function applyDrag(clientX: number) {
      const deltaX = clientX - startX;
      const widthDelta = direction.includes("w") ? -deltaX : deltaX;
      const newWidthPx = Math.max(80, Math.min(containerWidth, startWidthPx + widthDelta));
      const widthPct = Math.min(100, Math.max(10, Math.round((newWidthPx / containerWidth) * 100)));

      setImageWidth(target, widthPct);
      updateOverlay(target);
    }

    function stopResize(pointerId?: number) {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      if (pointerId !== undefined) {
        try {
          handle.releasePointerCapture?.(pointerId);
        } catch {
          // Ignore stale pointer capture releases.
        }
      }
      window.removeEventListener("pointermove", onPointerMove, true);
      window.removeEventListener("pointerup", onPointerUp, true);
      window.removeEventListener("pointercancel", onPointerUp, true);
      window.removeEventListener("mousemove", onMouseMove, true);
      window.removeEventListener("mouseup", onMouseUp, true);
      syncHtml();
      updateOverlay(target);
    }

    function onPointerMove(moveEvent: PointerEvent) {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      applyDrag(moveEvent.clientX);
    }

    function onPointerUp(upEvent: PointerEvent) {
      upEvent.preventDefault();
      upEvent.stopPropagation();
      stopResize(upEvent.pointerId);
    }

    function onMouseMove(moveEvent: MouseEvent) {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      applyDrag(moveEvent.clientX);
    }

    function onMouseUp(upEvent: MouseEvent) {
      upEvent.preventDefault();
      upEvent.stopPropagation();
      stopResize();
    }

    window.addEventListener("pointermove", onPointerMove, true);
    window.addEventListener("pointerup", onPointerUp, true);
    window.addEventListener("pointercancel", onPointerUp, true);
    window.addEventListener("mousemove", onMouseMove, true);
    window.addEventListener("mouseup", onMouseUp, true);
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
        <figure style="width: 100%; max-width: 100%; margin: 1.5rem auto; display: block;">
          <img src="${result.url}" alt="${alt.replace(/"/g, "&quot;")}" style="width: 100%; height: auto;" />
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

      <div className="rich-editor-content-wrapper relative">
        <div
          ref={editorRef}
          className="rich-editor-canvas"
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-label="Post content"
          onClick={handleCanvasClick}
          onInput={syncHtml}
          onBlur={syncHtml}
        />

        {overlayPos && selectedTarget ? (
          <div
            className="absolute z-30 pointer-events-none border-2 border-coffee-600 transition-all"
            style={{
              top: `${overlayPos.top}px`,
              left: `${overlayPos.left}px`,
              width: `${overlayPos.width}px`,
              height: `${overlayPos.height}px`
            }}
          >
            <ResizeHandle direction="nwse" className="-right-2.5 -bottom-2.5" label="Kéo góc để thay đổi kích thước ảnh" onPointerDown={(event) => startResize(event, "se")} />
            <ResizeHandle direction="nesw" className="-left-2.5 -bottom-2.5" label="Kéo góc để thay đổi kích thước ảnh" onPointerDown={(event) => startResize(event, "sw")} />
            <ResizeHandle direction="ew" className="-right-2.5 top-1/2 -translate-y-1/2" label="Kéo cạnh phải để thay đổi kích thước ảnh" onPointerDown={(event) => startResize(event, "e")} />
            <ResizeHandle direction="ew" className="-left-2.5 top-1/2 -translate-y-1/2" label="Kéo cạnh trái để thay đổi kích thước ảnh" onPointerDown={(event) => startResize(event, "w")} />

            {/* Floating Image Control Toolbar */}
            <div className="pointer-events-auto absolute -top-12 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-sm border border-stone-200 bg-white p-1.5 shadow-xl text-xs whitespace-nowrap">
              <span className="px-1 text-[11px] font-bold text-stone-500">Căn lề:</span>
              <button type="button" onClick={() => applyAlignment("left")} className="rounded-sm p-1 hover:bg-stone-100" title="Căn trái">
                <AlignLeft size={14} />
              </button>
              <button type="button" onClick={() => applyAlignment("center")} className="rounded-sm p-1 hover:bg-stone-100" title="Căn giữa">
                <AlignCenter size={14} />
              </button>
              <button type="button" onClick={() => applyAlignment("right")} className="rounded-sm p-1 hover:bg-stone-100" title="Căn phải">
                <AlignRight size={14} />
              </button>
              <button type="button" onClick={() => applyAlignment("float-left")} className="rounded-sm px-1.5 py-0.5 font-bold hover:bg-stone-100 text-[10px] text-coffee-700 bg-coffee-50" title="Trôi trái (Float Left)">
                Float L
              </button>
              <button type="button" onClick={() => applyAlignment("float-right")} className="rounded-sm px-1.5 py-0.5 font-bold hover:bg-stone-100 text-[10px] text-coffee-700 bg-coffee-50" title="Trôi phải (Float Right)">
                Float R
              </button>
              <span className="mx-1 h-4 w-px bg-stone-300" />
              <span className="px-1 text-[11px] font-bold text-stone-500">Cỡ ảnh:</span>
              <input
                type="range"
                min={10}
                max={100}
                value={currentWidthPct}
                onChange={(e) => applyWidthPercent(Number(e.target.value))}
                className="w-16 h-1.5 accent-coffee-700 cursor-pointer"
                title="Thanh trượt co giãn %"
              />
              <span className="text-[11px] font-bold text-coffee-800 w-8 text-center">{currentWidthPct}%</span>
              <span className="mx-1 h-4 w-px bg-stone-300" />
              <button type="button" onClick={deleteSelectedImage} className="rounded-sm p-1 text-red-600 hover:bg-red-50" title="Xóa ảnh">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ) : null}

        <details className="rich-editor-source">
          <summary>HTML source</summary>
          <textarea
            value={html}
            onChange={(event) => setHtml(event.target.value)}
            rows={10}
            className="mt-3 w-full rounded-sm border border-stone-300 px-4 py-3 font-mono text-sm"
          />
        </details>
      </div>
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

function ResizeHandle({
  direction,
  className,
  label,
  onPointerDown
}: {
  direction: "ew" | "nwse" | "nesw";
  className: string;
  label: string;
  onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void;
}) {
  const cursorClass = direction === "ew" ? "cursor-ew-resize" : direction === "nwse" ? "cursor-nwse-resize" : "cursor-nesw-resize";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onPointerDown={onPointerDown}
      className={`pointer-events-auto absolute h-5 w-5 rounded-full border-2 border-white bg-coffee-700 shadow-lg transition hover:scale-125 ${cursorClass} ${className}`}
    />
  );
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
