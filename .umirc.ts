import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { path: "/", component: "index" },
    { path: "/chat", component: "chat" },
  ],
  npmClient: 'pnpm',
});
