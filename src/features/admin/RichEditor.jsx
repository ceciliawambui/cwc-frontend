// RichEditor.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import EditorJS from "@editorjs/editorjs";

/** Core Tools */
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import Underline from "@editorjs/underline";
import Marker from "@editorjs/marker";
import Checklist from "@editorjs/checklist";
import Table from "@editorjs/table";

/** Rich Tools */
import CodeTool from "@calumk/editorjs-codeflask";
import Embed from "@editorjs/embed";
import LinkTool from "@editorjs/link";
import ImageTool from "@editorjs/image";

/** Premium Tools */
import InlineCode from "@editorjs/inline-code";
import Delimiter from "@editorjs/delimiter";
import Warning from "@editorjs/warning";
import Alert from "editorjs-alert";
// import Steps from "editorjs-steps";
import AttachesTool from "@editorjs/attaches";

/** Styling */
import "prismjs/themes/prism-okaidia.css";

const RichEditor = forwardRef(({ initialData, onSelectionChange }, ref) => {
  const holderRef = useRef(null);
  const instance = useRef(null);
  const selectionWatcher = useRef(null);

  useImperativeHandle(ref, () => ({
    save: async () => {
      if (!instance.current) return null;
      return await instance.current.save();
    },
  
    getInstance: () => instance.current,
  
    /** Manually clear content */
    clear: async () => {
      if (!instance.current) return;
      await instance.current.render({
        blocks: [{ type: "paragraph", data: { text: "" } }],
      });
    },
  
    /** Load existing content */
    load: async (data) => {
      if (!instance.current) return;
      await instance.current.render(data || {
        blocks: [{ type: "paragraph", data: { text: "" } }],
      });
    }
  }));
  

  /** WATCH TEXT SELECTION WITHOUT STUTTER */
  useEffect(() => {
    const handler = () => {
      const selection = window.getSelection();
      if (!selection) return;
      const text = selection.toString();
      onSelectionChange?.(text);
    };

    document.addEventListener("selectionchange", handler);
    selectionWatcher.current = handler;

    return () => {
      document.removeEventListener("selectionchange", handler);
    };
  }, []);

  /** INIT EDITOR */
  useEffect(() => {
    if (instance.current) return;

    const editor = new EditorJS({
      holder: holderRef.current,
      autofocus: false,

      /** Initial content */
      data: initialData || { blocks: [{ type: "paragraph", data: { text: "" } }] },

      /** EXTENDED TOOLSET */
      tools: {
        header: {
          class: Header,
          inlineToolbar: true,
          config: {
            levels: [1, 2, 3, 4],
            defaultLevel: 2,
          },
        },

        list: { class: List, inlineToolbar: true },
        checklist: { class: Checklist, inlineToolbar: true },

        quote: {
          class: Quote,
          inlineToolbar: true,
          config: {
            quotePlaceholder: "Enter quote",
            captionPlaceholder: "Author",
          },
        },

        underline: Underline,
        marker: Marker,
        inlineCode: InlineCode,

        delimiter: Delimiter,
        warning: Warning,

        alert: {
          class: Alert,
          inlineToolbar: true,
        },

        steps: {
        //   class: Steps,
          inlineToolbar: true,
        },

        /** EMBEDS: YouTube, Vimeo, CodePen, Twitter, Gist */
        embed: {
          class: Embed,
          config: {
            services: {
              youtube: true,
              vimeo: true,
              codepen: true,
              twitter: true,
              github: true,
            },
          },
        },

        linkTool: {
          class: LinkTool,
          config: {
            endpoint: "/api/link-fetch/",
          },
        },

        table: {
          class: Table,
          inlineToolbar: true,
          config: { rows: 2, cols: 2 },
        },

        /** File Attachment */
        attaches: {
          class: AttachesTool,
          config: {
            uploader: {
              uploadByFile(file) {
                return new Promise((resolve) => {
                  const url = URL.createObjectURL(file);
                  resolve({
                    success: 1,
                    file: {
                      url,
                      size: file.size,
                      name: file.name,
                    },
                  });
                });
              },
            },
          },
        },

        /** Image Upload (temporary local preview, but can be hooked to backend) */
        image: {
          class: ImageTool,
          config: {
            captionPlaceholder: "Image caption",
            uploader: {
              uploadByFile: async (file) => ({
                success: 1,
                file: { url: URL.createObjectURL(file) },
              }),
            },
          },
        },

        /** CODE BLOCK WITH LANGUAGES */
        code: {
          class: CodeTool,
          config: {
            language: "javascript",
            theme: "okaidia",
          },
        },
      },

      /** IMPROVED PASTE HANDLING */
      paste: {
        cleanPastedHTML: true,
        patterns: {
          github: /github\.com/,
          youtube: /youtu/,
        },
      },

      /** No flicker + fast detection */
      onChange: () => {},
    });

    instance.current = editor;

    return () => {
      editor.isReady
        .then(() => editor.destroy())
        .catch(() => {});
    };
  }, []);

  return (
    <div
      ref={holderRef}
      className="
        w-full border rounded-xl p-4  
        bg-white dark:bg-dark-800 
        min-h-[350px] 
        prose dark:prose-invert
      "
    />
  );
});

export default RichEditor;
