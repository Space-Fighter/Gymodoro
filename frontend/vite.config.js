import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'      // <-- Added missing import
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // daisyui() removed here because it is already handled by @plugin in your index.css
  ],
})
