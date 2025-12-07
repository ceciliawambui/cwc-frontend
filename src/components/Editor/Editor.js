import React, { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";

import Header from "@editorjs/header";
import List from "@editorjs/list";
import CodeFlask from "editorjs-codeflask";
import LinkTool from "@editorjs/link";
import Table from "@editorjs/table";
import Quote from "@editorjs/quote";
import ImageTool from "@editorjs/image";
import Embed from "@editorjs/embed";
import Underline from "@editorjs/underline";
import Marker from "@editorjs/marker";

const Editor = ({ data, onChange }) => {
  const ejInstance = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;

    ejInstance.current = new EditorJS({
      holder: editorRef.current,
      autofocus: true,
      data: data || {},

      tools: {
        header: Header,
        list: List,
        underline: Underline,
        marker: Marker,
        table: Table,
        quote: Quote,
        linkTool: LinkTool,
        embed: Embed,
        code: CodeFlask,
        image: {
          class: ImageTool,
          config: {
            uploader: {
              uploadByFile: async (file) => {
                // TODO — Integrate with Cloudinary, S3, Django, or Firebase
                return {
                  success: 1,
                  file: {
                    url: URL.createObjectURL(file),
                  },
                };
              },
            },
          },
        },
      },

      onChange: async () => {
        const output = await ejInstance.current.save();
        onChange(output);
      },
    });

    return () => {
      if (ejInstance.current && ejInstance.current.destroy) {
        ejInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="editorjs-container border rounded-lg p-4 bg-white dark:bg-neutral-900">
      <div id="editorjs" ref={editorRef}></div>
    </div>
  );
};

export default Editor;
