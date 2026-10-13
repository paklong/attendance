import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const REACT_PACKAGES = /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler|cookie|set-cookie-parser)[\\/]/;
const FIREBASE_CORE_PACKAGES = /[\\/]node_modules[\\/](firebase[\\/](app|auth|firestore)|@firebase[\\/](app|auth|firestore|component|logger|util))[\\/]/;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Vendor chunks change rarely, so browsers keep them cached across app
        // deploys. Firebase Storage is left out so only the admin upload page
        // downloads it.
        manualChunks(id) {
          if (REACT_PACKAGES.test(id)) return "react";
          if (FIREBASE_CORE_PACKAGES.test(id)) return "firebase";
        },
      },
    },
  },
});
