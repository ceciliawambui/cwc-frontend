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
      darkMode: 'class', // ✅ ensure Tailwind uses class-based dark mode
    }),
  ],
})
