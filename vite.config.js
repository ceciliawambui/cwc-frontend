// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite' 

// // https://vite.dev/config/
// export default defineConfig({
//  plugins: [react(), tailwindcss(),],
// })
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss({
      darkMode: 'class',
    }),
  ],
  resolve: {
    dedupe: [
      "prosemirror-state",
      "prosemirror-transform",
      "prosemirror-model",
      "prosemirror-view",
      "@blocknote/core",
      "@blocknote/react"
    ]},
})
