const pkgRootPath = `<rootDir>`;
const solidjsPath = `<rootDir>/../../node_modules/solid-js`;

module.exports = {
  preset: "ts-jest",
  testMatch: ['<rootDir>/(src|tests)/**/*.test.(ts|tsx|js)'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest',{
      tsconfig: `./tsconfig.json`,
      isolatedModules: true,
      babelConfig: {
        presets: ["@babel/preset-env", "babel-preset-solid"]
      }
    }]
  },

  testEnvironment: "jsdom",

  setupFilesAfterEnv: [`${pkgRootPath}/jest.setup.ts`, "regenerator-runtime"],

  moduleNameMapper: {
    "solid-js/web": `${solidjsPath}/web/dist/web.cjs`,
    "solid-js/store": `${solidjsPath}/store/dist/store.cjs`,
    "solid-js": `${solidjsPath}/dist/solid.cjs`,
    "antd": `<rootDir>/src/Tooltip.tsx`,
    "antd/lib/tooltip": `<rootDir>/src/Tooltip.tsx`,
    "antd/lib/tooltip/style/index.css": `<rootDir>/src/Tooltip.css`
  },

  verbose: true,
  testTimeout: 30000
};
