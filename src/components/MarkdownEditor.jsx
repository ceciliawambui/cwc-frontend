import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Eye, Code2, LayoutPanelLeft, Copy, Check, Bold, Italic,
  List, ListOrdered, Heading2, Minus, Link2, Quote, Maximize2, Minimize2
} from "lucide-react";

/* ================================
   Markdown → HTML
   CRITICAL: Code blocks are extracted to placeholders FIRST,
   then all other transforms run, then placeholders are restored.
   This prevents bold/italic/list/paragraph regexes from
   corrupting code content or base64 strings.
================================ */
function markdownToHtml(md) {
  if (!md) return "";

  const codeBlocks = [];
  const inlineCodes = [];
  let html = md;

  // ── 1. Pull out fenced code blocks into placeholders ──
  html = html.replace(/```(\w*)\r?\n([\s\S]*?)```/g, (_, lang, code) => {
    const language = lang || "plaintext";
    const escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
    const base64 = btoa(unescape(encodeURIComponent(code)));
    const block = `<pre data-language="${language}" data-code-base64="${base64}" data-code-content="${escaped}"><code class="language-${language}">${escaped}</code></pre>`;
    const id = codeBlocks.length;
    codeBlocks.push(block);
    return `\n%%CB${id}%%\n`;
  });

  // ── 2. Pull out inline code into placeholders ──
  html = html.replace(/`([^`\n]+)`/g, (_, code) => {
    const escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const id = inlineCodes.length;
    inlineCodes.push(`<code>${escaped}</code>`);
    return `%%IC${id}%%`;
  });

  // ── 3. All other Markdown transforms (safe — no code in string) ──

  // Headings
  html = html.replace(/^#{6}\s+(.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^#{5}\s+(.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^#{4}\s+(.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");

  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, "<blockquote>$1</blockquote>");

  // Horizontal rule
  html = html.replace(/^---+$/gm, "<hr/>");

  // Bold + italic (order: *** → ** → *)
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");
  html = html.replace(/_(.+?)_/g, "<em>$1</em>");

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Unordered lists
  html = html.replace(/((?:^[*-]\s+.+$\n?)+)/gm, (match) => {
    const items = match.trim().split("\n")
      .filter(Boolean)
      .map(l => `<li>${l.replace(/^[*-]\s+/, "").trim()}</li>`)
      .join("");
    return `<ul>${items}</ul>`;
  });

  // Ordered lists
  html = html.replace(/((?:^\d+\.\s+.+$\n?)+)/gm, (match) => {
    const items = match.trim().split("\n")
      .filter(Boolean)
      .map(l => `<li>${l.replace(/^\d+\.\s+/, "").trim()}</li>`)
      .join("");
    return `<ol>${items}</ol>`;
  });

  // Paragraphs — wrap bare text, skip block-level and placeholders
  html = html.split(/\n{2,}/).map(block => {
    const trimmed = block.trim();
    if (!trimmed) return "";
    if (/^(<(h[1-6]|ul|ol|pre|blockquote|hr|div|p)|%%CB)/i.test(trimmed)) return trimmed;
    return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
  }).join("\n");

  // ── 4. Restore placeholders ──
  codeBlocks.forEach((block, i) => {
    // Cover cases where the placeholder got wrapped in <p> by the paragraph step
    html = html.replace(new RegExp(`<p>%%CB${i}%%<\\/p>`, "g"), block);
    html = html.replace(new RegExp(`<p>%%CB${i}%%`, "g"), block);
    html = html.replace(new RegExp(`%%CB${i}%%`, "g"), block);
  });
  inlineCodes.forEach((code, i) => {
    html = html.replace(new RegExp(`%%IC${i}%%`, "g"), code);
  });

  return html;
}


function ToolbarBtn({ icon: Icon, label, onClick, active }) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className="flex items-center justify-center w-8 h-8 rounded-md transition-all"
      style={{ background: active ? "#1e3a5f" : "transparent", color: active ? "#4a9eff" : "#6b8cae" }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#1a2332"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      {Icon && <Icon size={15} />}
    </button>
  );
}

function MarkdownPreview({ markdown, theme }) {
  const html = markdownToHtml(markdown);
  const previewStyles = `
    <style>
      * { box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; font-size: 15px; line-height: 1.75; color: ${theme === "dark" ? "#c9d1d9" : "#1e293b"}; background: ${theme === "dark" ? "#0d1117" : "#ffffff"}; padding: 1.5rem 2rem; margin: 0; }
      h1 { font-size: 2em; font-weight: 800; margin: 1.5em 0 0.5em; color: ${theme === "dark" ? "#ffffff" : "#0f172a"}; line-height: 1.2; }
      h2 { font-size: 1.6em; font-weight: 700; margin: 1.4em 0 0.5em; color: ${theme === "dark" ? "#f0f6ff" : "#0f172a"}; line-height: 1.3; }
      h3 { font-size: 1.3em; font-weight: 600; margin: 1.2em 0 0.4em; color: ${theme === "dark" ? "#f0f6ff" : "#0f172a"}; }
      h4, h5, h6 { font-weight: 600; margin: 1em 0 0.4em; color: ${theme === "dark" ? "#f0f6ff" : "#0f172a"}; }
      p { margin: 0.75em 0; }
      ul { list-style: disc; padding-left: 1.5em; margin: 0.75em 0; }
      ol { list-style: decimal; padding-left: 1.5em; margin: 0.75em 0; }
      li { margin: 0.35em 0; }
      code { font-family: 'Fira Code', 'Courier New', monospace; font-size: 0.875em; background: ${theme === "dark" ? "#1e2a3a" : "#f1f5f9"}; color: ${theme === "dark" ? "#e879f9" : "#be185d"}; padding: 0.15em 0.4em; border-radius: 4px; }
      pre { background: #0d1117; border: 1px solid #1e2a3a; border-radius: 10px; padding: 1.25rem 1.5rem; overflow-x: auto; margin: 1.25em 0; }
      pre code { background: transparent; color: #c9d1d9; padding: 0; font-size: 0.875em; line-height: 1.7; }
      blockquote { border-left: 4px solid #3b82f6; margin: 1em 0; padding: 0.5em 1em; background: ${theme === "dark" ? "rgba(59,130,246,0.08)" : "#eff6ff"}; color: ${theme === "dark" ? "#93c5fd" : "#1d4ed8"}; border-radius: 0 8px 8px 0; font-style: italic; }
      hr { border: none; border-top: 1px solid ${theme === "dark" ? "#1e2a3a" : "#e2e8f0"}; margin: 2em 0; }
      a { color: #3b82f6; text-decoration: underline; text-underline-offset: 2px; }
      strong { font-weight: 700; color: ${theme === "dark" ? "#ffffff" : "#0f172a"}; }
    </style>
  `;
  const iframeRef = useRef(null);
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head>${previewStyles}</head><body>${html || '<p style="color:#4a5568;font-style:italic">Nothing to preview yet...</p>'}</body></html>`);
    doc.close();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markdown, theme]);
  return <iframe ref={iframeRef} title="Markdown Preview" className="w-full h-full border-0" sandbox="allow-same-origin" />;
}

export default function MarkdownEditor({ initialContent, onChange, theme = "light" }) {
  const [markdown, setMarkdown] = useState(() => {
    if (typeof initialContent === "string") return initialContent;
    if (initialContent?.markdown) return initialContent.markdown;
    return "";
  });
  const [viewMode, setViewMode] = useState("split");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);
  const debounceRef = useRef(null);

  const emitChange = useCallback((md) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const html = markdownToHtml(md);
      onChange?.({ json: null, html, markdown: md });
    }, 250);
  }, [onChange]);

  const handleChange = (e) => {
    const val = e.target.value;
    setMarkdown(val);
    emitChange(val);
  };

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const wrap = useCallback((before, after = before, placeholder = "text") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = markdown.substring(start, end) || placeholder;
    const newVal = markdown.substring(0, start) + before + selected + after + markdown.substring(end);
    setMarkdown(newVal);
    emitChange(newVal);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = start + before.length;
      ta.selectionEnd = start + before.length + selected.length;
    });
  }, [markdown, emitChange]);

  const insertLine = useCallback((prefix) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = markdown.lastIndexOf("\n", start - 1) + 1;
    const newVal = markdown.substring(0, lineStart) + prefix + markdown.substring(lineStart);
    setMarkdown(newVal);
    emitChange(newVal);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + prefix.length;
    });
  }, [markdown, emitChange]);

  const insertCodeBlock = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const selected = markdown.substring(start, ta.selectionEnd);
    const block = `\n\`\`\`javascript\n${selected || "// your code here"}\n\`\`\`\n`;
    const newVal = markdown.substring(0, start) + block + markdown.substring(ta.selectionEnd);
    setMarkdown(newVal);
    emitChange(newVal);
    requestAnimationFrame(() => {
      ta.focus();
      const codeStart = start + block.indexOf(selected || "// your code here");
      ta.selectionStart = codeStart;
      ta.selectionEnd = codeStart + (selected || "// your code here").length;
    });
  }, [markdown, emitChange]);

  const handleKeyDown = useCallback((e) => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (e.key === "Tab") {
      e.preventDefault();
      const s = ta.selectionStart;
      const newVal = markdown.substring(0, s) + "  " + markdown.substring(ta.selectionEnd);
      setMarkdown(newVal);
      emitChange(newVal);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + 2; });
    }
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "b") { e.preventDefault(); wrap("**", "**", "bold text"); }
      if (e.key === "i") { e.preventDefault(); wrap("*", "*", "italic text"); }
      if (e.key === "k") { e.preventDefault(); wrap("[", "](url)", "link text"); }
    }
  }, [markdown, wrap, emitChange]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ✅ FIX: Each view mode item includes its icon
  const viewModes = [
    { id: "edit",    icon: Code2,          label: "Edit" },
    { id: "split",   icon: LayoutPanelLeft, label: "Split" },
    { id: "preview", icon: Eye,            label: "Preview" },
  ];

  const toolbarGroups = [
    [
      { icon: Heading2,    label: "Heading (## H2)", action: () => insertLine("## ") },
      { icon: Bold,        label: "Bold (Ctrl+B)",   action: () => wrap("**", "**", "bold text") },
      { icon: Italic,      label: "Italic (Ctrl+I)", action: () => wrap("*", "*", "italic text") },
    ],
    [
      { icon: List,        label: "Bullet List",     action: () => insertLine("* ") },
      { icon: ListOrdered, label: "Numbered List",   action: () => insertLine("1. ") },
      { icon: Quote,       label: "Blockquote",      action: () => insertLine("> ") },
    ],
    [
      { icon: Code2,       label: "Code Block",      action: insertCodeBlock },
      { icon: Link2,       label: "Link (Ctrl+K)",   action: () => wrap("[", "](url)", "link text") },
      { icon: Minus,       label: "Divider (---)",   action: () => insertLine("---\n") },
    ],
  ];

  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden"
      style={{
        background: "#0d1117",
        border: "1px solid #1e2a3a",
        height: isFullscreen ? "100vh" : "100%",
        minHeight: 520,
        position: isFullscreen ? "fixed" : "relative",
        inset: isFullscreen ? 0 : undefined,
        zIndex: isFullscreen ? 9999 : undefined,
      }}
    >
      {/* ── Top Bar ── */}
      <div
        className="flex items-center gap-3 px-3 py-2 shrink-0 border-b"
        style={{ borderColor: "#1e2a3a", background: "#080e17" }}
      >
        {/* Toolbar groups */}
        <div className="flex items-center gap-1 flex-1">
          {toolbarGroups.map((group, gi) => (
            <React.Fragment key={gi}>
              {group.map(({ icon, label, action }) => (
                <ToolbarBtn key={label} icon={icon} label={label} onClick={action} />
              ))}
              {gi < toolbarGroups.length - 1 && (
                <div className="w-px h-5 mx-1" style={{ background: "#1e2a3a" }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all"
          style={{ background: "#1e2a3a", color: copied ? "#4ade80" : "#6b8cae" }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>

        {/* View mode switcher */}
        <div className="flex items-center rounded-lg p-0.5 gap-0.5" style={{ background: "#0d1117", border: "1px solid #1e2a3a" }}>
          {viewModes.map((mode) => {
            const ViewIcon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                title={mode.label}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all"
                style={{
                  background: viewMode === mode.id ? "#1e2a3a" : "transparent",
                  color: viewMode === mode.id ? "#4a9eff" : "#4a5568",
                }}
              >
                <ViewIcon size={12} />
                <span className="hidden sm:inline">{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Fullscreen */}
        <button
          onClick={() => setIsFullscreen(v => !v)}
          className="p-1.5 rounded-md transition-colors"
          style={{ color: "#4a5568" }}
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>

      {/* ── Editor Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Edit pane */}
        {(viewMode === "edit" || viewMode === "split") && (
          <div
            className="flex flex-col overflow-hidden"
            style={{
              width: viewMode === "split" ? "50%" : "100%",
              borderRight: viewMode === "split" ? "1px solid #1e2a3a" : "none",
            }}
          >
            <div className="flex items-center gap-2 px-4 py-1.5 shrink-0" style={{ background: "#080e17", borderBottom: "1px solid #1e2a3a" }}>
              <Code2 size={12} style={{ color: "#3a4a5a" }} />
              <span className="text-xs" style={{ color: "#3a4a5a" }}>Markdown</span>
              <span className="ml-auto text-xs" style={{ color: "#3a4a5a" }}>{markdown.length} chars</span>
            </div>
            <textarea
              ref={textareaRef}
              value={markdown}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              placeholder={`# Your heading here\n\nWrite your content naturally. Use **bold**, *italic*, and lists.\n\nFor code, use triple backticks:\n\n\`\`\`javascript\nconsole.log("Hello, world!");\n\`\`\``}
              className="flex-1 w-full resize-none border-0 outline-none p-5 font-mono text-sm leading-relaxed"
              style={{ background: "#0d1117", color: "#c9d1d9", caretColor: "#e2e8f0", lineHeight: "1.65rem" }}
            />
          </div>
        )}

        {/* Preview pane */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div
            className="flex flex-col overflow-hidden"
            style={{ width: viewMode === "split" ? "50%" : "100%" }}
          >
            <div className="flex items-center gap-2 px-4 py-1.5 shrink-0" style={{ background: "#080e17", borderBottom: "1px solid #1e2a3a" }}>
              <Eye size={12} style={{ color: "#3a4a5a" }} />
              <span className="text-xs" style={{ color: "#3a4a5a" }}>Preview</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded" style={{ background: "#1a3a1a", color: "#4ade80" }}>● Live</span>
            </div>
            <div className="flex-1 overflow-hidden bg-white">
              <MarkdownPreview markdown={markdown} theme={theme} />
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div
        className="flex items-center justify-between px-4 py-1.5 shrink-0 border-t"
        style={{ borderColor: "#1e2a3a", background: "#080e17" }}
      >
        <div className="flex items-center gap-3 text-xs" style={{ color: "#3a4a5a" }}>
          <span>{markdown.split("\n").length} lines</span>
          <span>·</span>
          <span>{markdown.trim().split(/\s+/).filter(Boolean).length} words</span>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: "#3a4a5a" }}>
          <span>**bold**</span>
          <span>*italic*</span>
          <span># heading</span>
          <span>```code```</span>
        </div>
      </div>
    </div>
  );
}