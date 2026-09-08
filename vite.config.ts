import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  /* Load the whole .env, not just VITE_-prefixed keys, so the shared secret
   * can be declared once and read by both the server and the client. Two
   * variables that must be kept equal is a bug waiting to happen. */
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    define: {
      /* G14: the browser has to present the secret, so it is compiled into
       * the bundle and is readable by anyone who opens devtools. It is a
       * gate against drive-by traffic, not a credential. See server.ts. */
      __API_SHARED_SECRET__: JSON.stringify(env.API_SHARED_SECRET || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
