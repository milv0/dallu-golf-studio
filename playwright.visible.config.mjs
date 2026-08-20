import { defineConfig } from "@playwright/test";
import baseConfig from "./playwright.config.mjs";

const visibleViewport = { width: 1440, height: 1100 };
const visibleLaunchOptions = {
  ...baseConfig.use?.launchOptions,
  slowMo: 450,
  args: [
    ...(baseConfig.use?.launchOptions?.args || []),
    "--window-size=1440,1200",
  ],
};

export default defineConfig({
  ...baseConfig,
  timeout: 60_000,
  use: {
    ...baseConfig.use,
    headless: false,
    viewport: visibleViewport,
    launchOptions: visibleLaunchOptions,
  },
  projects: baseConfig.projects.map((project) => ({
    ...project,
    use: {
      ...project.use,
      headless: false,
      viewport: visibleViewport,
      launchOptions: visibleLaunchOptions,
    },
  })),
});
