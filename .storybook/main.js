const path = require("path");

module.exports = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-a11y",
    "storybook-dark-mode",
  ],
  framework: "@storybook/html",
  core: {
    "builder": "@storybook/builder-webpack5"
  },
  babel: options => ({
    ...options,
    presets: ["@babel/preset-typescript", "solid"],
  }),
  webpackFinal: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "../src"),
    };

    return config;
  }
};
