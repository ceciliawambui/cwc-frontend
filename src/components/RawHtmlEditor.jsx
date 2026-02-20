import React, { useState, useEffect, useRef, useCallback } from "react";
import { Code2, Eye, LayoutPanelLeft, Copy, Check, AlertCircle, Maximize2, Minimize2 } from "lucide-react";

/* ================================
   Raw HTML Editor Component
   Supports full HTML including <html>, <head>, <body>, scripts, etc.
   Integrates with the same onChange({ json, html }) API as BlockNoteEditor
================================ */

const EDITOR_MODES = {
  CODE: "code",
  PREVIEW: "preview",
  SPLIT: "split",
};

// Very minimal syntax highlighting via regex coloring on a textarea overlay
function SyntaxHighlight({ code }) {
  const highlighted = code
    // HTML tags
    .replace(/(&lt;\/?)([\w-]+)([^&]*?)(\/?&gt;)/g, (_, open, tag, attrs, close) => {
      const coloredAttrs = attrs.replace(
        /([\w-]+)(=)(&quot;[^&]*&quot;|'[^']*'|\S+)/g,
        `<span style="color:#92c5f8">$1</span><span style="color:#89ddff">$2</span><span style="color:#c3e88d">$3</span>`
      );
      return `<span style="color:#89ddff">${open}</span><span style="color:#f07178">${tag}</span>${coloredAttrs}<span style="color:#89ddff">${close}</span>`;
    })
    // HTML entities
    .replace(/&amp;/g, `<span style="color:#c792ea">&amp;</span>`)
    // CSS properties inside style tags (rough)
    .replace(/([a-z-]+)(:)(\s*[^;{<\n]+)/g, `<span style="color:#ffcb6b">$1</span><span style="color:#89ddff">$2</span><span style="color:#c3e88d">$3</span>`)
    // Comments
    .replace(/(&lt;!--)([\s\S]*?)(--&gt;)/g, `<span style="color:#546e7a;font-style:italic">$1$2$3</span>`);
  return (
    <div
      className="absolute inset-0 pointer-events-none p-4 font-mono text-sm leading-relaxed overflow-hidden"
      dangerouslySetInnerHTML={{ __html: highlighted }}
      aria-hidden
    />
  );
}

function LineNumbers({ lines }) {
  return (
    <div
      className="select-none text-right pr-4 font-mono text-xs leading-relaxed shrink-0 w-12"
      style={{ color: "#4a5568", paddingTop: "1rem", paddingBottom: "1rem" }}
    >
      {Array.from({ length: lines }, (_, i) => (
        <div key={i + 1} style={{ lineHeight: "1.5rem" }}>
          {i + 1}
        </div>
      ))}
    </div>
  );
}

/* ================================
   HTML Preview Iframe
================================ */
function HtmlPreview({ html, theme }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(html || "<html><body><p style='color:#666;font-family:sans-serif;padding:2rem'>Nothing to preview yet...</p></body></html>");
    doc.close();
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      title="HTML Preview"
      className="w-full h-full border-0 rounded-b-xl"
      sandbox="allow-scripts allow-same-origin allow-forms"
      style={{ background: theme === "dark" ? "#0d1117" : "#ffffff" }}
    />
  );
}

/* ================================
   Code Editor Panel
================================ */
function CodeEditorPanel({ value, onChange }) {
  const textareaRef = useRef(null);
  const lines = (value || "").split("\n").length;
  const [copied, setCopied] = useState(false);

  const handleKeyDown = useCallback((e) => {
    const ta = textareaRef.current;
    if (!ta) return;

    // Tab key → insert 2 spaces
    if (e.key === "Tab") {
      e.preventDefault();
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = value.substring(0, start) + "  " + value.substring(end);
      onChange(newVal);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }

    // Auto-close tags: type > after tag name
    if (e.key === ">" && !e.shiftKey) {
      const start = ta.selectionStart;
      const before = value.substring(0, start);
      const tagMatch = before.match(/<([\w-]+)[^/]*$/);
      if (tagMatch && !["br", "hr", "img", "input", "meta", "link"].includes(tagMatch[1])) {
        e.preventDefault();
        const tag = tagMatch[1];
        const insert = `></${tag}>`;
        const newVal = value.substring(0, start) + insert + value.substring(start);
        onChange(newVal);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 1;
        });
      }
    }
  }, [value, onChange]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#0d1117" }}>
      {/* Editor toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b shrink-0"
        style={{ borderColor: "#1e2a3a", background: "#0d1117" }}
      >
        <div className="flex items-center gap-2">
          <Code2 size={14} style={{ color: "#4a9eff" }} />
          <span className="text-xs font-medium" style={{ color: "#6b8cae" }}>
            HTML Source
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{ background: "#1e2a3a", color: "#4a9eff" }}
          >
            {lines} lines
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all"
          style={{
            background: copied ? "#1a3a1a" : "#1e2a3a",
            color: copied ? "#4ade80" : "#6b8cae",
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Editor area */}
      <div className="flex flex-1 overflow-auto">
        <LineNumbers lines={lines} />
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            className="absolute inset-0 w-full h-full resize-none border-0 outline-none bg-transparent font-mono text-sm leading-relaxed p-4"
            style={{
              color: "transparent",
              caretColor: "#e2e8f0",
              zIndex: 2,
              lineHeight: "1.5rem",
            }}
            placeholder="<!-- Paste or write your HTML here -->"
          />
          {/* Overlay for display */}
          <div
            className="absolute inset-0 font-mono text-sm leading-relaxed p-4 pointer-events-none overflow-hidden whitespace-pre"
            style={{
              color: "#c9d1d9",
              zIndex: 1,
              lineHeight: "1.5rem",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {value || (
              <span style={{ color: "#3a4a5a" }}>
                {"<!-- Paste or write your HTML here -->"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================
   Main RawHtmlEditor Export
================================ */
export default function RawHtmlEditor({ initialContent, onChange }) {
  const [mode, setMode] = useState(EDITOR_MODES.SPLIT);
  const [html, setHtml] = useState(() => {
    // Initialize from existing content if available
    if (typeof initialContent === "string") return initialContent;
    if (initialContent?.html) return initialContent.html;
    return "";
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  // Debounced onChange to parent (same API as BlockNoteEditor)
  const debounceTimer = useRef(null);
  const handleHtmlChange = useCallback((newHtml) => {
    setHtml(newHtml);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      onChange?.({ json: null, html: newHtml });
    }, 300);
  }, [onChange]);

  useEffect(() => () => clearTimeout(debounceTimer.current), []);

  const modeButtons = [
    { id: EDITOR_MODES.CODE, icon: Code2, label: "Code" },
    { id: EDITOR_MODES.SPLIT, icon: LayoutPanelLeft, label: "Split" },
    { id: EDITOR_MODES.PREVIEW, icon: Eye, label: "Preview" },
  ];

  return (
    <div
      ref={containerRef}
      className="flex flex-col rounded-xl overflow-hidden"
      style={{
        background: "#0d1117",
        border: "1px solid #1e2a3a",
        height: isFullscreen ? "100vh" : "100%",
        minHeight: 500,
        position: isFullscreen ? "fixed" : "relative",
        inset: isFullscreen ? 0 : undefined,
        zIndex: isFullscreen ? 9999 : undefined,
      }}
    >
      {/* Top Bar */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0 border-b"
        style={{ borderColor: "#1e2a3a", background: "#080e17" }}
      >
        {/* Left: Mode Switcher */}
        <div
          className="flex items-center rounded-lg p-1 gap-1"
          style={{ background: "#0d1117" }}
        >
          {modeButtons.map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
              style={{
                background: mode === id ? "#1e2a3a" : "transparent",
                color: mode === id ? "#4a9eff" : "#4a5568",
                border: mode === id ? "1px solid #1e3a5f" : "1px solid transparent",
              }}
            >
              {React.createElement(icon, { size: 13 })}
              {label}
            </button>
          ))}
        </div>

        {/* Center: Info */}
        <div className="flex items-center gap-2">
          <AlertCircle size={14} style={{ color: "#f59e0b" }} />
          <span className="text-xs" style={{ color: "#6b8cae" }}>
            Raw HTML Mode — all tags preserved
          </span>
        </div>

        {/* Right: Fullscreen */}
        <button
          onClick={() => setIsFullscreen((v) => !v)}
          className="p-2 rounded-lg transition-colors"
          style={{ color: "#4a5568", background: "#0d1117" }}
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
      </div>

      {/* Editor Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Code Panel */}
        {(mode === EDITOR_MODES.CODE || mode === EDITOR_MODES.SPLIT) && (
          <div
            className="flex flex-col overflow-hidden"
            style={{
              width: mode === EDITOR_MODES.SPLIT ? "50%" : "100%",
              borderRight: mode === EDITOR_MODES.SPLIT ? "1px solid #1e2a3a" : "none",
            }}
          >
            <CodeEditorPanel value={html} onChange={handleHtmlChange} />
          </div>
        )}

        {/* Preview Panel */}
        {(mode === EDITOR_MODES.PREVIEW || mode === EDITOR_MODES.SPLIT) && (
          <div
            className="flex flex-col overflow-hidden"
            style={{ width: mode === EDITOR_MODES.SPLIT ? "50%" : "100%" }}
          >
            <div
              className="flex items-center gap-2 px-4 py-2 border-b shrink-0"
              style={{ borderColor: "#1e2a3a", background: "#0d1117" }}
            >
              <Eye size={14} style={{ color: "#4a9eff" }} />
              <span className="text-xs font-medium" style={{ color: "#6b8cae" }}>
                Live Preview
              </span>
              <span
                className="ml-auto text-xs px-2 py-0.5 rounded"
                style={{ background: "#1a3a1a", color: "#4ade80" }}
              >
                ● Live
              </span>
            </div>
            <div className="flex-1 overflow-hidden" style={{ background: "#ffffff" }}>
              <HtmlPreview html={html} />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="px-4 py-2 flex items-center justify-between shrink-0 border-t"
        style={{ borderColor: "#1e2a3a", background: "#080e17" }}
      >
        <span className="text-xs" style={{ color: "#3a4a5a" }}>
          {html.length.toLocaleString()} chars · {html.split("\n").length} lines
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: "#4ade80" }} />
          <span className="text-xs" style={{ color: "#3a4a5a" }}>
            Ready
          </span>
        </div>
      </div>
    </div>
  );
}