import React, { useEffect, useState, useCallback } from "react";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import client from "../features/auth/api";

export default function BlockNoteEditor({ initialContent, onChange }) {
  // Store initial content state
  const [jsonBlocks] = useState(initialContent || undefined);

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

  // Handle editor changes
  useEffect(() => {
    if (!editor) return;
    
    const handleUpdate = async () => {
      try {
        const json = editor.document;
        
        // CRITICAL FIX: Process code blocks to preserve raw text content
        const processedBlocks = json.map(block => {
          if (block.type === "codeBlock") {
            // Extract the actual text content from the block
            let codeText = '';
            
            if (block.content && Array.isArray(block.content)) {
              codeText = block.content.map(item => {
                if (typeof item === 'string') return item;
                if (item.type === 'text') return item.text || '';
                if (item.text) return item.text;
                return '';
              }).join('');
            }
            
            // Return a processed block with escaped content
            return {
              ...block,
              _rawContent: codeText
            };
          }
          return block;
        });
        
        // Build HTML manually for code blocks to ensure proper escaping
        let html = '';
        
        for (const block of processedBlocks) {
          if (block.type === "codeBlock" && block._rawContent !== undefined) {
            const language = block.props?.language || "plaintext";
            const rawCode = block._rawContent;
            
            // Escape HTML entities for storage
            const escapedCode = rawCode
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
            
            // Use base64 encoding as backup to preserve exact content
            const base64Code = btoa(unescape(encodeURIComponent(rawCode)));
            
            html += `<pre data-language="${language}" data-code-content="${escapedCode}" data-code-base64="${base64Code}"><code class="language-${language}">${escapedCode}</code></pre>\n`;
          } else {
            // For non-code blocks, use standard conversion
            const tempEditor = editor;
            const blockHtml = await tempEditor.blocksToHTMLLossy([block]);
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
    <div className="blocknote-container h-full overflow-y-auto bg-white dark:bg-gray-900 rounded-xl relative z-0">
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
        
        /* Code block styling in editor - PREVENT HTML RENDERING */
        .bn-editor pre {
          background-color: #1e1e1e;
          border-radius: 8px;
          padding: 1rem;
          overflow-x: auto;
        }
        
        .bn-editor pre code {
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          white-space: pre;
          display: block;
        }
        
        /* Ensure code blocks show text content, not rendered HTML */
        .bn-editor pre * {
          display: inline;
          margin: 0;
          padding: 0;
          font-size: inherit;
          font-weight: inherit;
          line-height: inherit;
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