/*
@see https://github.com/google/zx
*/
import { $, cd, fs, glob } from "zx";
import nodeFs from "fs/promises";
import reactToSolid from "./react-to-solid.mjs";

const cwd = (await $`pwd`).stdout.toString().trim();
await $`mkdir packages`.catch(() => 1);
console.log(cwd);
cd(`${cwd}/packages`);

const getRepo = async () => {
  await $`rm -rf ant-design-icons`;
  (await fs.pathExists("antd-icons-solid")) &&
    (await $`rm -rf antd-icons-solid`);

  await $`git clone --depth=1 https://github.com/ant-design/ant-design-icons.git`;
  await $`mv -f ant-design-icons/packages/icons-react antd-icons-solid`;
};

const resolvePkg = async () => {
  // package.json
  const p1 = await $`cat antd-icons-solid/package.json`;
  const pkg = JSON.parse(p1.stdout);
  delete pkg.unpkg;
  delete pkg.main;
  pkg.name = "@ant-design/icons-solid";
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
  ];
  const aliPkg = ["father", "@umijs/fabric", "antd", "dumi"];
  for (let k of [...reactPkg, ...aliPkg]) {
    delete pkg.devDependencies[k];
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
    "ts-jest": "^29.0.1",
    "ts-node": "^10.9.1",
    vite: "^3.0.9",
    "vite-plugin-solid": "^2.3.0"
  });
  // sort object by key
  pkg.devDependencies = Object.fromEntries(Object.entries(pkg.devDependencies).sort((a, b) => a[0] < b[0] ? -1 : 1))
  pkg.peerDependencies = {
    "solid-js": ">=1.5.0",
  };
  await nodeFs.writeFile(
    "antd-icons-solid/package.json",
    JSON.stringify(pkg, null, "  ")
  );

  // typescript
  const p2 = await $`cat antd-icons-solid/tsconfig.json`;
  const tsconfig = JSON.parse(p2.stdout);
  tsconfig.compilerOptions.jsx = "preserve";
  tsconfig.compilerOptions.jsxImportSource = "solid-js";
  await nodeFs.writeFile(
    "antd-icons-solid/tsconfig.json",
    JSON.stringify(tsconfig, null, "  ")
  );
  try {
    cd(`${cwd}/packages/antd-icons-solid`);
    await $`npm i`;
    await $`cp -f ${cwd}/dev/generate.ts ./scripts/generate.ts`;
    await $`cp -f ${cwd}/dev/main.tsx ./src/main.tsx`;
    await $`cp -f ${cwd}/dev/App.tsx ./src/App.tsx`;
    await $`cp -f ${cwd}/dev/utils.ts ./src/utils.ts`;
    await $`cp -f ${cwd}/dev/index.html ./index.html`;
    await $`cp -f ${cwd}/dev/vite.config.ts ./vite.config.ts`;
    await $`cp -f ${cwd}/dev/jest.config.js ./jest.config.js`;
    await $`cp -f ${cwd}/dev/jest.setup.ts ./jest.setup.ts`;
    await $`cp -f ${cwd}/dev/Tooltip.tsx ./Tooltip.tsx`;
    await $`cp -f ${cwd}/dev/Icon.tsx ./src/components/Icon.tsx`;
    await $`cp -f ${cwd}/dev/IconSolid.test.tsx ./tests/IconSolid.tsx`;
    await $`cp -f ${cwd}/dev/test-utils.tsx ./tests/test-utils.tsx`;

    await $`npm run generate`;
  } catch (e) {
    console.log(e);
  }
};

// react to solid
const react2Solid = async () => {
  cd(`${cwd}/packages/antd-icons-solid`);
  for await (const file of await glob(`{src,tests,docs}/**/*.{ts,tsx}`)) {
    if (file.includes("src/icons/")) {
      continue;
    }
    $.verbose = false;
    let s1 = await $`cat ${file}`;
    $.verbose = true;
    let s2 = reactToSolid(s1.stdout);
    await nodeFs.writeFile(file, s2);
  }

  for await (const file of await glob(`{src,tests,docs}/**/*.{ts,tsx}`)) {
    if (file.includes("src/icons/")) {
      continue;
    }
    $.verbose = false;
    let s1 = await $`cat ${file}`;
    $.verbose = true;
    let s2 = s1.stdout
      .replaceAll(" as IconBaseComponent<IconComponentProps>;", "")
      .replaceAll("from '../lib';", "from '../src';")
      .replace(
        /import (\w+) from '@ant\-design\/icons\-svg\/lib/,
        `import $1 from '@ant-design/icons-svg/es`
      )
      .replace(/but got \${icon}/, `but got \${JSON.stringify(icon)}`);
    await nodeFs.writeFile(file, s2);
  }
  await $`rm ./tests/__snapshots__/*`
  await $`npm run test`
};

// await getRepo()
// await resolvePkg()
await react2Solid()

// await $`rm -rf packages/ant-design-icons`;
