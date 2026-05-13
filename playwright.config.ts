import { defineConfig } from "playwright/config";

export default defineConfig({
  testDir: "./src",
  use: {
    headless: false,
    channel: "chrome"
  }
});
