const pkgRootPath = `<rootDir>`;
const solidjsPath = `${pkgRootPath}/node_modules/solid-js`;

module.exports = {
  preset: "ts-jest",
  testMatch: ['<rootDir>/(src|package)/**/*.test.(ts|tsx|js)'],
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
    "@ant-design/icons-solid": `${pkgRootPath}/packages/antd-icons-solid/src/index.ts`,
    "@ant-design/icons-svg/es/asn": `${pkgRootPath}/packages/antd-icons-solid/node_modules/@ant-design/icons-svg/lib/asn/AccountBookFilled.js`
  },

  verbose: true,
  testTimeout: 30000
};
