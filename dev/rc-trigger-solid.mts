/*
@see https://github.com/google/zx
*/
import { $, cd, fs, glob } from "zx";
import nodeFs from "fs/promises";
import reactToSolid from "./react-to-solid.mjs";
import reactToSolidTest from "./react-to-solid-test.mjs";

const cwd = (await $`pwd`).stdout.toString().trim();
await $`mkdir packages`.catch(() => 1);
console.log(cwd);
cd(`${cwd}/packages`);
let hasInstall = await fs.pathExists(`rc-trigger-solid/node_modules`);
console.log("hasInstall = ", hasInstall)
const getRepo = async () => {
  await $`rm -rf ant-design-icons`;
  (await fs.pathExists("rc-trigger-solid")) &&
    (await $`rm -rf rc-trigger-solid`);

  await $`git clone --depth=1 https://github.com/react-component/trigger.git rc-trigger`;
};

const resolvePkg = async () => {
  // package.json
//   await $`cp -rf rc-trigger ./`;
  await $`rm -rf rc-trigger-solid`;
  await $`mv rc-trigger rc-trigger-solid`;
  const p1 = await $`cat rc-trigger-solid/package.json`;
  const pkg = JSON.parse(p1.stdout);
  delete pkg.unpkg;
  delete pkg.main;
  pkg.name = "rc-trigger-solid";
  pkg.description = "adapte @ant-design/icons for solid-js";
  pkg.module = "./src/index.ts";
  pkg.scripts.start = "vite dev";
  pkg.scripts.test = "NODE_ENV=production jest";
  delete pkg.scripts.compile;
  delete pkg.gitHead;
  const reactPkg = [
    "react",
    "react-dom",
    "mobx",
    "mobx-react",
    "@types/enzyme",
    "enzyme",
    "enzyme-to-json",
    "create-react-class",
    "react-is"
  ];
  const aliPkg = ["father", "@umijs/fabric", "antd", "dumi"];
  for (let k of [...reactPkg, ...aliPkg]) {
    delete pkg.devDependencies[k];
    delete pkg.dependencies[k];
  }
  if (pkg.devDependencies["styled-components"]) {
    pkg["solid-styled-components"] = "lastest";
    delete pkg.devDependencies["styled-components"];
  }
  Object.assign(pkg.devDependencies, {
    "@babel/preset-env": "^7.19.1",
    "@testing-library/jest-dom": "^5.16.5",
    "@types/jest": "^29.0.3",
    "@types/testing-library__jest-dom": "^5.14.5",
    "babel-preset-solid": "^1.5.5",
    jest: "^29.0.3",
    "jest-environment-jsdom": "^29.0.3",
    "solid-testing-library": "^0.3.0",
    "solid-styled-components": "^0.28.4",
    "ts-jest": "^29.0.1",
    "ts-node": "^10.9.1",
    vite: "^3.0.9",
    "vite-plugin-solid": "^2.3.0",
    "dom-align": "^1.7.0",
  });
  // sort object by key
  pkg.devDependencies = Object.fromEntries(
    Object.entries(pkg.devDependencies).sort((a, b) => (a[0] < b[0] ? -1 : 1))
  );
  pkg.dependencies.typescript = "^4.8.2"
  pkg.peerDependencies = {
    "solid-js": ">=1.5.0",
  };
  await nodeFs.writeFile(
    "rc-trigger-solid/package.json",
    JSON.stringify(pkg, null, "  ")
  );

  // typescript
  const p2 = await $`cat rc-trigger-solid/tsconfig.json`;
  const tsconfig = JSON.parse(p2.stdout);
  tsconfig.compilerOptions.jsx = "preserve";
  tsconfig.compilerOptions.jsxImportSource = "solid-js";
  await nodeFs.writeFile(
    "rc-trigger-solid/tsconfig.json",
    JSON.stringify(tsconfig, null, "  ")
  );
  try {
    cd(`${cwd}/packages/rc-trigger-solid`);
    await $`mv tests/basic.test.jsx tests/basic.test.tsx`;
    await $`mv tests/mask.test.jsx tests/mask.test.tsx`;
    await $`mv tests/motion.test.jsx tests/motion.test.tsx`;
    await $`mv tests/point.test.jsx tests/point.test.tsx`;
    await $`mv tests/util.test.jsx tests/util.test.tsx`;
    await $`rm -f tests/__snapshots__/*`;
    if (hasInstall) {
      await $`npm i --prefer-offline --no-audit --progress=false --legacy-peer-deps`;
    } else {
      await $`npm i`
    }
  } catch (e) {
    console.log(e);
  }
};

// react to solid
const react2Solid = async () => {
  cd(`${cwd}/packages/rc-trigger-solid`);
  for await (const file of await glob(`{src,tests,docs}/**/*.{ts,tsx}`)) {
    $.verbose = false;
    let s1 = await $`cat ${file}`;
    $.verbose = true;
    let s2 = reactToSolid(s1.stdout);
    if (file.endsWith(".test.tsx") || file.endsWith(".test.tsx")) {
      s2 = reactToSolidTest(s2);
    }
    s2 = s2.replace(/\bact\(\(\) => {([^}]+)}\);/g, "$1");
    s2 = s2.replace(/(import ReactDOM from 'react-dom';)/, "");
    await nodeFs.writeFile(file, s2);
  }
};

await getRepo()
await resolvePkg()
await react2Solid()
await $`cp -Rf ${cwd}/dev/rc-trigger-solid-source/* ${cwd}/packages/rc-trigger-solid`;
await $`cd ${cwd}/packages/rc-trigger-solid`;
await $`npx jest`;
