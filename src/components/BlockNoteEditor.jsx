import React, { useEffect, useState, useCallback, useRef } from "react";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import client from "../features/auth/api";

export default function BlockNoteEditor({ initialContent, onChange }) {
  // Store initial content state
  const [jsonBlocks] = useState(initialContent || undefined);
  const editorRef = useRef(null);

  // Memoized Upload Function
  const uploadFile = useCallback(async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await client.post("/api/editor/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.url;
    } catch (error) {
      console.error("Image upload failed:", error);
      return "https://via.placeholder.com/1000x400?text=Upload+Error";
    }
  }, []);

  // Create Editor
  const editor = useCreateBlockNote({
    initialContent: jsonBlocks,
    uploadFile: uploadFile,
  });

  // CRITICAL FIX: Intercept paste events to preserve all HTML content
  useEffect(() => {
    if (!editor || !editorRef.current) return;

    const editorElement = editorRef.current.querySelector('[contenteditable="true"]');
    if (!editorElement) return;

    const handlePaste = (e) => {
      // Check if we're currently in a code block
      const selection = window.getSelection();
      const currentElement = selection?.anchorNode?.parentElement;
      
      // Look for code block indicators
      const isInCodeBlock = currentElement?.closest('[data-content-type="codeBlock"]') ||
                           currentElement?.closest('code') ||
                           currentElement?.closest('pre');

      if (isInCodeBlock) {
        // For code blocks, preserve the raw pasted text
        e.preventDefault();
        
        const pastedText = e.clipboardData.getData('text/plain');
        
        // Insert the text at cursor position
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(pastedText);
        range.insertNode(textNode);
        
        // Move cursor to end of inserted text
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Trigger editor update
        editor._tiptapEditor?.commands?.focus();
      }
    };

    editorElement.addEventListener('paste', handlePaste);
    return () => {
      editorElement.removeEventListener('paste', handlePaste);
    };
  }, [editor]);

  // Handle editor changes
  useEffect(() => {
    if (!editor) return;
    
    const handleUpdate = async () => {
      try {
        const json = editor.document;
        
        // Build HTML with special handling for code blocks
        let html = '';
        
        for (const block of json) {
          if (block.type === "codeBlock") {
            // Extract raw text content directly from the block
            let codeText = '';
            
            if (block.content && Array.isArray(block.content)) {
              codeText = block.content.map(item => {
                if (typeof item === 'string') return item;
                if (item.type === 'text') return item.text || '';
                if (item.text) return item.text;
                return '';
              }).join('');
            }
            
            // Get language
            const language = block.props?.language || "plaintext";
            
            // Store in base64 for absolute reliability
            const base64Code = btoa(unescape(encodeURIComponent(codeText)));
            
            // Escape HTML entities
            const escapedCode = codeText
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
            
            // Build HTML with data attributes
            html += `<pre data-language="${language}" data-code-base64="${base64Code}" data-code-content="${escapedCode}"><code class="language-${language}">${escapedCode}</code></pre>\n`;
          } else {
            // For non-code blocks, use standard conversion
            const blockHtml = await editor.blocksToHTMLLossy([block]);
            html += blockHtml;
          }
        }
        
        onChange({ json, html });
      } catch (error) {
        console.error("Error generating editor content:", error);
      }
    };
    
    const unsubscribe = editor.onChange(handleUpdate);
    return () => unsubscribe();
  }, [editor, onChange]);

  if (!editor) {
    return <div className="p-4 text-gray-500">Loading Editor...</div>;
  }

  return (
    <div 
      ref={editorRef}
      className="blocknote-container h-full overflow-y-auto bg-white dark:bg-gray-900 rounded-xl relative z-0"
    >
      <BlockNoteView 
        editor={editor} 
        theme="light" 
        className="min-h-[500px] py-4"
      />
      
      <style>{`
        /* Editor padding */
        .bn-editor { 
          padding-inline: 2rem !important;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
        
        /* Heading spacing */
        .bn-block-content[data-content-type="heading"] { 
          margin-top: 1.5em;
          font-weight: 700;
        }
        
        /* Ensure headings are properly sized in editor */
        .bn-editor h1 { 
          font-size: 2.5em; 
          font-weight: 800; 
          line-height: 1.2;
        }
        .bn-editor h2 { 
          font-size: 2em; 
          font-weight: 700; 
          line-height: 1.3;
        }
        .bn-editor h3 { 
          font-size: 1.5em; 
          font-weight: 600; 
          line-height: 1.4;
        }
        
        /* List styling in editor */
        .bn-editor ul { 
          list-style-type: disc; 
          padding-left: 1.5rem;
          margin: 1em 0;
        }
        .bn-editor ol { 
          list-style-type: decimal; 
          padding-left: 1.5rem;
          margin: 1em 0;
        }
        .bn-editor li {
          margin: 0.5em 0;
        }
        
        /* Paragraph spacing */
        .bn-editor p {
          margin: 1em 0;
          line-height: 1.7;
        }
        
        /* Dark mode support */
        :global(.dark) .bn-editor { 
          background-color: #111827; 
          color: #e5e7eb; 
        }
        :global(.dark) .bn-block-content { 
          color: #e5e7eb; 
        }
        :global(.dark) .bn-inline-content { 
          color: #e5e7eb; 
        }
        :global(.dark) .bn-side-menu { 
          color: #9ca3af; 
        }
        
        /* Code block styling - PRESERVE ALL TEXT CONTENT */
        .bn-editor pre {
          background-color: #1e1e1e;
          border-radius: 8px;
          padding: 1rem;
          overflow-x: auto;
          white-space: pre-wrap !important;
        }
        
        .bn-editor pre code {
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          white-space: pre-wrap !important;
          display: block;
        }
        
        /* Force text-only rendering */
        .bn-editor [data-content-type="codeBlock"] * {
          white-space: pre-wrap !important;
        }
        
        /* Blockquote styling in editor */
        .bn-editor blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          margin: 1em 0;
          color: #6b7280;
          font-style: italic;
        }
        
        :global(.dark) .bn-editor blockquote {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}
