import { defineConfig } from "vite";
import { tessellatePlugin } from "@tessellatepos/plugin-sdk/vite";

// One `vite build` produces dist/client.js (from src/client.tsx) and
// dist/index.js (from index.ts). React and the Tessellate SDKs aren't
// bundled into the client: the plugin uses the frontend's instances.
export default defineConfig({
    plugins: [tessellatePlugin()],
});
