const pkgRootPath = `<rootDir>`;
const solidjsPath = `<rootDir>/../../node_modules/solid-js`;

module.exports = {
  preset: "ts-jest",
  testMatch: ['<rootDir>/(src|tests)/**/*.spec.(ts|tsx|js)'],
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
    "rc-util-solid/lib/hooks/useState": `${pkgRootPath}/../rc-util-solid/src/hooks/useState.ts`,
    "rc-util-solid/lib/Dom/canUseDom": `${pkgRootPath}/../rc-util-solid/src/Dom/canUseDom.ts`,
    "rc-util-solid/lib/ref": `${pkgRootPath}/../rc-util-solid/src/ref.ts`
  },

  verbose: true,
  testTimeout: 30000
};
