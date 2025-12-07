import React, { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import {
  FiBold, FiItalic, FiCode, FiList, FiRotateCcw, FiRotateCw
} from "react-icons/fi";

// 1. Load common languages
const lowlight = createLowlight(common);

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  // Helper to set language
  const setLanguage = (lang) => {
    editor.chain().focus().toggleCodeBlock({ language: lang }).run();
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700 p-2 flex flex-wrap gap-2 sticky top-0 z-10 items-center">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition ${
          editor.isActive("bold") ? "bg-gray-300 dark:bg-gray-600" : ""
        }`}
        title="Bold"
      >
        <FiBold />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition ${
          editor.isActive("italic") ? "bg-gray-300 dark:bg-gray-600" : ""
        }`}
        title="Italic"
      >
        <FiItalic />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-2 py-1 text-xs font-bold rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition ${
          editor.isActive("heading", { level: 2 }) ? "bg-gray-300 dark:bg-gray-600" : ""
        }`}
      >
        H2
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* CODE BLOCK CONTROLS */}
      <div className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 rounded px-1">
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition ${
            editor.isActive("codeBlock") ? "text-indigo-600" : ""
          }`}
          title="Code Block"
        >
          <FiCode />
        </button>
        
        {/* Language Dropdown - Only visible if code block is active */}
        {editor.isActive("codeBlock") && (
          <select 
            className="bg-transparent text-xs font-mono focus:outline-none py-1 pr-1"
            onChange={(e) => setLanguage(e.target.value)}
            // Try to get current language
            defaultValue="javascript" 
          >
            <option value="javascript">JS</option>
            <option value="python">Python</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="bash">Bash</option>
            <option value="java">Java</option>
          </select>
        )}
      </div>

      <div className="flex-1" />

      <button onClick={() => editor.chain().focus().undo().run()} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
        <FiRotateCcw />
      </button>
      <button onClick={() => editor.chain().focus().redo().run()} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
        <FiRotateCw />
      </button>
    </div>
  );
};

const TiptapEditor = React.memo(({ content, onChange }) => {
  const debounceRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, 
        heading: { levels: [2, 3] },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
      }),
    ],
    content: content, 
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none focus:outline-none min-h-[350px] p-4",
      },
    },
    onUpdate: ({ editor }) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onChange(editor.getHTML());
      }, 750); 
    },
  });

  useEffect(() => {
    if (editor && content) {
      const currentContent = editor.getHTML();
      if (currentContent !== content && !editor.isFocused) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="border dark:border-gray-700 rounded-xl overflow-hidden flex flex-col h-full bg-white dark:bg-gray-900 shadow-sm">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto cursor-text bg-white dark:bg-gray-900" onClick={() => editor?.commands.focus()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
});

export default TiptapEditor;