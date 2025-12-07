// parser.js
import edjsHTML from "editorjs-html";

const edjsParser = edjsHTML({
  code: (block) => [
    `<pre><code class="language-${block.data.language || "javascript"}">` +
      block.data.code +
      `</code></pre>`,
  ],
  table: (block) => [
    `<table>${block.data.content
      .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
      .join("")}</table>`,
  ],
});

export const parseEditorToHTML = (data) => {
  const parsed = edjsParser.parse(data);
  return Array.isArray(parsed) ? parsed.join("") : parsed;
};
