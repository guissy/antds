const pkgRootPath = `<rootDir>`;
const solidjsPath = `<rootDir>/../../node_modules/solid-js`;

module.exports = {
  preset: "ts-jest",
  testMatch: ['<rootDir>/(src|tests)/**/*.(spec|test).(ts|tsx|js)'],
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
    "dom-align": `${pkgRootPath}/node_modules/dom-align/dist-node/index.js`,
    "rc-util-solid/lib/hooks/useState": `${pkgRootPath}/../rc-util-solid/src/hooks/useState.ts`,
    "rc-util-solid/lib/ref": `${pkgRootPath}/../rc-util-solid/src/ref.ts`,
    "rc-util-solid/lib/raf": `${pkgRootPath}/../rc-util-solid/src/raf.ts`,
    "rc-util-solid/lib/getScrollBarSize": `${pkgRootPath}/../rc-util-solid/src/getScrollBarSize.tsx`,
    "rc-util-solid/lib/KeyCode": `${pkgRootPath}/../rc-util-solid/src/KeyCode.ts`,
    "rc-util-solid/lib/pickAttrs": `${pkgRootPath}/../rc-util-solid/src/pickAttrs.ts`,
    "rc-util-solid/lib/Dom/dynamicCSS": `${pkgRootPath}/../rc-util-solid/src/Dom/dynamicCSS.ts`,
    "rc-util-solid/lib/Dom/isVisible": `${pkgRootPath}/../rc-util-solid/src/Dom/isVisible.ts`,
    "rc-util-solid/lib/Dom/contains": `${pkgRootPath}/../rc-util-solid/src/Dom/contains.ts`,
    "rc-util-solid/lib/Dom/findDOMNode": `${pkgRootPath}/../rc-util-solid/src/Dom/findDOMNode.ts`,
    "rc-util-solid/lib/Dom/canUseDom": `${pkgRootPath}/../rc-util-solid/src/Dom/canUseDom.ts`,
    "rc-util-solid/lib/Dom/addEventListener": `${pkgRootPath}/../rc-util-solid/src/Dom/addEventListener.ts`,
    "rc-util-solid/lib/hooks/useLayoutEffect": `${pkgRootPath}/../rc-util-solid/src/hooks/useLayoutEffect.ts`,
    "rc-util-solid/lib/hooks/useId": `${pkgRootPath}/../rc-util-solid/src/hooks/useId.ts`,
    "rc-util-solid/lib/test/domHook": `${pkgRootPath}/../rc-util-solid/src/test/domHook.ts`,
    "rc-util-solid/lib/Portal": `${pkgRootPath}/../rc-util-solid/src/Portal.tsx`,
    "rc-util-solid/lib/isMobile": `${pkgRootPath}/../rc-util-solid/src/isMobile.ts`,
    "rc-motion-solid": `${pkgRootPath}/../rc-motion-solid/src/index.tsx`,
    "rc-align-solid": `${pkgRootPath}/../rc-align-solid/src/index.ts`,
    "@rc-component-solid/portal": `${pkgRootPath}/../rc-portal-solid/src/index.tsx`,
  },

  verbose: true,
  testTimeout: 30000
};
