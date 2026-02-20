// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     react(),
//     tailwindcss({
//       darkMode: 'class',
//     }),
//   ],
//   base: "/",
//   resolve: {
//     dedupe: [
//       "prosemirror-state",
//       "prosemirror-transform",
//       "prosemirror-model",
//       "prosemirror-view",
//       "@blocknote/core",
//       "@blocknote/react"
//     ]},
// })
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss({
      darkMode: 'class',
    }),
  ],
  base: "/",
  resolve: {
    dedupe: [
      "prosemirror-state",
      "prosemirror-transform",
      "prosemirror-model",
      "prosemirror-view",
      "@blocknote/core",
      "@blocknote/react"
    ]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Monaco editor is very large - isolate it
          monaco: ['@monaco-editor/react', 'monaco-editor'],
          // BlockNote / ProseMirror
          blocknote: ['@blocknote/core', '@blocknote/react'],
          prosemirror: [
            'prosemirror-state',
            'prosemirror-transform',
            'prosemirror-model',
            'prosemirror-view',
          ],
        }
      }
    }
  }
})